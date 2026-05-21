import http from "node:http";
import crypto from "node:crypto";
import { createReadStream, existsSync } from "node:fs";
import { readFile, writeFile, mkdir, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const seedPath = path.join(rootDir, "src", "data", "course-seed.json");
const statePath = path.join(__dirname, "state.json");
const distDir = path.join(rootDir, "dist");
const port = Number(process.env.PORT ?? 8787);
const passwordSalt = "bharat-smart-learn-demo";

const mimeTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
};

const delay = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

const hashPassword = (password) => crypto.scryptSync(password, passwordSalt, 64).toString("hex");

const verifyPassword = (password, hash) => {
  const left = Buffer.from(hash, "hex");
  const right = crypto.scryptSync(password, passwordSalt, 64);

  if (left.length !== right.length) {
    return false;
  }

  return crypto.timingSafeEqual(left, right);
};

const loadSeedState = async () => {
  const rawSeed = await readFile(seedPath, "utf8");
  const seedState = JSON.parse(rawSeed);

  return {
    ...seedState,
    users: seedState.users.map((user) => ({
      ...user,
      password_hash: user.password_hash ?? hashPassword(user.password ?? "demo1234"),
    })).map(({ password, ...user }) => user),
  };
};

const mergeState = (currentState, seedState) => ({
  ...seedState,
  ...currentState,
  users: (() => {
    const merged = [...(currentState?.users ?? [])];
    const seen = new Set(merged.map((item) => item.id));

    for (const seedUser of seedState.users) {
      if (!seen.has(seedUser.id)) {
        merged.push(seedUser);
      }
    }

    return merged;
  })(),
  courses: (() => {
    const merged = [...seedState.courses];
    const seen = new Set(merged.map((item) => item.id));

    for (const currentCourse of currentState?.courses ?? []) {
      if (!seen.has(currentCourse.id)) {
        merged.push(currentCourse);
      }
    }

    return merged;
  })(),
  lectures: (() => {
    const merged = [...seedState.lectures];
    const seen = new Set(merged.map((item) => `${item.course_id}:${item.order_index}`));

    for (const currentLecture of currentState?.lectures ?? []) {
      const lectureKey = `${currentLecture.course_id}:${currentLecture.order_index}`;
      if (!seen.has(lectureKey)) {
        merged.push(currentLecture);
      }
    }

    return merged;
  })(),
  enrollments: currentState?.enrollments ?? [],
  progress: currentState?.progress ?? [],
});

const stateStore = {
  value: null,
  async load() {
    if (this.value) {
      return this.value;
    }

    try {
      const rawState = await readFile(statePath, "utf8");
      const currentState = JSON.parse(rawState);
      const seedState = await loadSeedState();
      this.value = mergeState(currentState, seedState);
      await this.save();
      return this.value;
    } catch {
      this.value = await loadSeedState();
      await this.save();
      return this.value;
    }
  },
  async save() {
    if (!this.value) {
      return;
    }

    await mkdir(__dirname, { recursive: true });
    await writeFile(statePath, JSON.stringify(this.value, null, 2), "utf8");
  },
};

const sendJson = (res, statusCode, payload) => {
  res.writeHead(statusCode, {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET,POST,PATCH,OPTIONS",
    "Content-Type": "application/json; charset=utf-8",
  });
  res.end(JSON.stringify(payload));
};

const parseBody = async (req) => {
  const chunks = [];

  for await (const chunk of req) {
    chunks.push(chunk);
  }

  if (chunks.length === 0) {
    return {};
  }

  const raw = Buffer.concat(chunks).toString("utf8");
  return raw ? JSON.parse(raw) : {};
};

const serializeUser = (user) => ({
  id: user.id,
  email: user.email,
  full_name: user.full_name,
  preferred_categories: user.preferred_categories ?? [],
  created_at: user.created_at,
});

const getCourseLectures = (state, courseId) =>
  state.lectures
    .filter((lecture) => lecture.course_id === courseId)
    .sort((left, right) => left.order_index - right.order_index);

const buildCourseView = (course, state, user) => {
  const lectures = getCourseLectures(state, course.id);
  const enrolled = Boolean(user && state.enrollments.some((enrollment) => enrollment.user_id === user.id && enrollment.course_id === course.id));
  const recommended = Boolean(user && (user.preferred_categories ?? []).includes(course.category));

  return {
    ...course,
    lectures,
    lecture_count: lectures.length,
    enrolled,
    recommended,
  };
};

const findUserByEmail = (state, email) => state.users.find((user) => user.email.toLowerCase() === email.toLowerCase());

const handleRegister = async (req, res) => {
  const state = await stateStore.load();
  const body = await parseBody(req);

  const email = String(body.email ?? "").trim().toLowerCase();
  const fullName = String(body.fullName ?? "").trim();
  const password = String(body.password ?? "");
  const preferredCategories = Array.isArray(body.preferredCategories) ? body.preferredCategories.map(String) : [];

  if (!email || !fullName || !password) {
    return sendJson(res, 400, { error: "fullName, email, and password are required." });
  }

  const existingUser = findUserByEmail(state, email);
  const record = existingUser ?? {
    id: crypto.randomUUID(),
    created_at: new Date().toISOString(),
  };

  record.email = email;
  record.full_name = fullName;
  record.password_hash = hashPassword(password);
  record.preferred_categories = preferredCategories;

  if (!existingUser) {
    state.users.push(record);
  }

  await stateStore.save();
  return sendJson(res, 200, { user: serializeUser(record) });
};

const handleLogin = async (req, res) => {
  const state = await stateStore.load();
  const body = await parseBody(req);

  const email = String(body.email ?? "").trim().toLowerCase();
  const password = String(body.password ?? "");
  const user = findUserByEmail(state, email);

  if (!user || !verifyPassword(password, user.password_hash)) {
    return sendJson(res, 401, { error: "Invalid email or password." });
  }

  return sendJson(res, 200, { user: serializeUser(user) });
};

const handleCourses = async (req, res, url) => {
  const state = await stateStore.load();
  const userId = url.searchParams.get("userId");
  const recommendedOnly = url.searchParams.get("recommendedOnly") === "1";
  const user = userId ? state.users.find((candidate) => candidate.id === userId) : null;

  let courses = state.courses.map((course) => buildCourseView(course, state, user));

  courses.sort((left, right) => {
    const leftScore = (left.enrolled ? 2 : 0) + (left.recommended ? 1 : 0);
    const rightScore = (right.enrolled ? 2 : 0) + (right.recommended ? 1 : 0);

    if (leftScore === rightScore) {
      return left.title.localeCompare(right.title);
    }

    return rightScore - leftScore;
  });

  if (recommendedOnly && user) {
    courses = courses.filter((course) => course.recommended);
  }

  return sendJson(res, 200, {
    courses,
    preferred_categories: user?.preferred_categories ?? [],
  });
};

const handleEnroll = async (req, res) => {
  const state = await stateStore.load();
  const body = await parseBody(req);
  const userId = String(body.userId ?? "");
  const courseId = String(body.courseId ?? "");
  const user = state.users.find((candidate) => candidate.id === userId);
  const course = state.courses.find((candidate) => candidate.id === courseId);

  if (!user || !course) {
    return sendJson(res, 404, { error: "User or course not found." });
  }

  await delay(1500);

  const existingEnrollment = state.enrollments.find((enrollment) => enrollment.user_id === userId && enrollment.course_id === courseId);
  const enrollment = existingEnrollment ?? {
    id: crypto.randomUUID(),
    user_id: userId,
    course_id: courseId,
    enrolled_at: new Date().toISOString(),
  };

  if (!existingEnrollment) {
    state.enrollments.push(enrollment);
    await stateStore.save();
  }

  return sendJson(res, 200, {
    enrollment,
    course: buildCourseView(course, state, user),
  });
};

const handleProgress = async (req, res) => {
  const state = await stateStore.load();
  const body = await parseBody(req);
  const userId = String(body.userId ?? "");
  const lectureId = String(body.lectureId ?? "");
  const lecture = state.lectures.find((candidate) => candidate.id === lectureId);

  if (!lecture || !state.users.find((candidate) => candidate.id === userId)) {
    return sendJson(res, 404, { error: "Lecture or user not found." });
  }

  const existingProgress = state.progress.find((progress) => progress.user_id === userId && progress.lecture_id === lectureId);
  const progress = existingProgress ?? {
    id: crypto.randomUUID(),
    user_id: userId,
    lecture_id: lectureId,
    completed_at: new Date().toISOString(),
  };

  progress.completed_at = new Date().toISOString();

  if (!existingProgress) {
    state.progress.push(progress);
  }

  await stateStore.save();
  return sendJson(res, 200, { progress });
};

const handleMe = async (req, res, url) => {
  const state = await stateStore.load();
  const userId = url.searchParams.get("userId");
  const user = userId ? state.users.find((candidate) => candidate.id === userId) : null;

  if (!user) {
    return sendJson(res, 404, { error: "User not found." });
  }

  const enrolledCourses = state.courses
    .map((course) => buildCourseView(course, state, user))
    .filter((course) => course.enrolled);

  const recentProgress = state.progress
    .filter((progress) => progress.user_id === user.id)
    .sort((left, right) => right.completed_at.localeCompare(left.completed_at));

  return sendJson(res, 200, {
    user: serializeUser(user),
    enrolled_courses: enrolledCourses,
    recent_progress: recentProgress,
  });
};

const serveStaticAsset = async (req, res, url) => {
  if (!existsSync(distDir)) {
    return sendJson(res, 404, { error: "Build the frontend first with npm run build." });
  }

  const pathname = decodeURIComponent(url.pathname);
  const targetPath = pathname === "/" ? path.join(distDir, "index.html") : path.resolve(distDir, `.${pathname}`);

  if (!targetPath.startsWith(distDir)) {
    return sendJson(res, 403, { error: "Forbidden." });
  }

  const fileExists = existsSync(targetPath);
  const fileStats = fileExists ? await stat(targetPath) : null;

  if (fileExists && fileStats?.isFile()) {
    const extension = path.extname(targetPath).toLowerCase();
    res.writeHead(200, {
      "Content-Type": mimeTypes[extension] ?? "application/octet-stream",
    });
    createReadStream(targetPath).pipe(res);
    return;
  }

  const indexPath = path.join(distDir, "index.html");
  if (existsSync(indexPath)) {
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    createReadStream(indexPath).pipe(res);
    return;
  }

  sendJson(res, 404, { error: "Frontend bundle not found." });
};

const server = http.createServer(async (req, res) => {
  if (!req.url) {
    return sendJson(res, 400, { error: "Invalid request." });
  }

  const url = new URL(req.url, `http://${req.headers.host ?? "localhost"}`);

  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Allow-Methods": "GET,POST,PATCH,OPTIONS",
    });
    res.end();
    return;
  }

  try {
    if (req.method === "POST" && url.pathname === "/api/auth/register") {
      await handleRegister(req, res);
      return;
    }

    if (req.method === "POST" && url.pathname === "/api/auth/login") {
      await handleLogin(req, res);
      return;
    }

    if (req.method === "GET" && url.pathname === "/api/courses") {
      await handleCourses(req, res, url);
      return;
    }

    if (req.method === "POST" && url.pathname === "/api/enroll") {
      await handleEnroll(req, res);
      return;
    }

    if (req.method === "POST" && url.pathname === "/api/progress") {
      await handleProgress(req, res);
      return;
    }

    if (req.method === "GET" && url.pathname === "/api/me") {
      await handleMe(req, res, url);
      return;
    }

    await serveStaticAsset(req, res, url);
  } catch (error) {
    console.error(error);
    sendJson(res, 500, {
      error: error instanceof Error ? error.message : "Unexpected server error.",
    });
  }
});

server.listen(port, () => {
  console.log(`MVP backend listening on http://127.0.0.1:${port}`);
});