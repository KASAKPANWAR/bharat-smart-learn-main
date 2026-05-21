import { supabase } from "@/integrations/supabase/client";
import type { ApiCommunityResponse, ApiCoursesResponse, ApiEnrollResponse, ApiProgressResponse, ApiUser, AuthPayload, CommunityPost, Course } from "./types";

const toApiUser = (row: { id: string; email: string; full_name: string; preferred_categories: string[]; created_at: string }): ApiUser => ({
  id: row.id,
  email: row.email,
  full_name: row.full_name,
  preferred_categories: row.preferred_categories ?? [],
  created_at: row.created_at,
});

const isUuid = (value?: string) =>
  Boolean(value && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value));

const getProfileById = async (userId: string) => {
  const { data, error } = await supabase
    .from("users")
    .select("id,email,full_name,preferred_categories,created_at")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    const message = error.message.toLowerCase();
    if (message.includes("schema cache") || message.includes("could not find the table")) {
      return null;
    }

    throw new Error(error.message);
  }

  return data ? toApiUser(data) : null;
};

export const getCourses = async (userId?: string): Promise<ApiCoursesResponse> => {
  const effectiveUserId = isUuid(userId) ? userId : undefined;
  const [coursesResult, lecturesResult, enrollmentsResult] = await Promise.all([
    supabase.from("courses").select("id,title,description,thumbnail,category,provider,source_url,created_at").order("created_at", { ascending: false }),
    supabase.from("lectures").select("id,course_id,title,youtube_video_id,order_index").order("course_id", { ascending: true }).order("order_index", { ascending: true }),
    effectiveUserId
      ? supabase.from("enrollments").select("course_id").eq("user_id", effectiveUserId)
      : Promise.resolve({ data: [] as Array<{ course_id: string }>, error: null }),
  ]);

  const { data: courses, error: coursesError } = coursesResult;
  const { data: lectures, error: lecturesError } = lecturesResult;
  const enrollments = "data" in enrollmentsResult ? enrollmentsResult.data : [];
  const profile = effectiveUserId ? await getProfileById(effectiveUserId) : null;

  if (coursesError) {
    throw new Error(coursesError.message);
  }

  if (lecturesError) {
    throw new Error(lecturesError.message);
  }

  const lecturesByCourseId = new Map<string, typeof lectures>();
  for (const lecture of lectures ?? []) {
    const currentLectures = lecturesByCourseId.get(lecture.course_id) ?? [];
    currentLectures.push(lecture);
    lecturesByCourseId.set(lecture.course_id, currentLectures);
  }

  const enrolledCourseIds = new Set((enrollments ?? []).map((enrollment) => enrollment.course_id));
  const preferredCategories = profile?.preferred_categories ?? [];

  const mappedCourses: Course[] = (courses ?? []).map((course) => {
    const courseLectures = lecturesByCourseId.get(course.id) ?? [];
    const enrolled = enrolledCourseIds.has(course.id);
    const recommended = preferredCategories.includes(course.category);

    return {
      ...course,
      lectures: courseLectures,
      lecture_count: courseLectures.length,
      enrolled,
      recommended,
    };
  });

  mappedCourses.sort((left, right) => {
    const leftScore = (left.enrolled ? 2 : 0) + (left.recommended ? 1 : 0);
    const rightScore = (right.enrolled ? 2 : 0) + (right.recommended ? 1 : 0);

    if (leftScore === rightScore) {
      return left.title.localeCompare(right.title);
    }

    return rightScore - leftScore;
  });

  return {
    courses: mappedCourses,
    preferred_categories: preferredCategories,
  };
};

export const registerUser = async (payload: {
  fullName: string;
  email: string;
  password: string;
  preferredCategories: string[];
}) => {
  const { data, error } = await supabase.auth.signUp({
    email: payload.email,
    password: payload.password,
    options: {
      data: {
        full_name: payload.fullName,
        preferred_categories: payload.preferredCategories,
      },
    },
  });

  if (error) {
    if (error.message.toLowerCase().includes("rate limit")) {
      throw new Error("Supabase is rate-limiting signup emails. Wait a bit or disable email confirmation in Supabase Auth for instant registration.");
    }

    throw new Error(error.message);
  }

  const authUser = data.user;
  if (!authUser) {
    throw new Error("Unable to create account.");
  }

  const profile = await getProfileById(authUser.id);

  return {
    user: profile ?? {
      id: authUser.id,
      email: authUser.email ?? payload.email,
      full_name: payload.fullName,
      preferred_categories: payload.preferredCategories,
      created_at: authUser.created_at ?? new Date().toISOString(),
    },
  };
};

export const loginUser = async (payload: AuthPayload) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: payload.email,
    password: payload.password,
  });

  if (error) {
    throw new Error(error.message);
  }

  const authUser = data.user;
  if (!authUser) {
    throw new Error("Unable to sign in.");
  }

  const profile = await getProfileById(authUser.id);
  if (profile) {
    return { user: profile };
  }

  const fallbackProfile = {
    id: authUser.id,
    email: authUser.email ?? payload.email,
    full_name: (authUser.user_metadata?.full_name as string | undefined) ?? authUser.email ?? payload.email,
    preferred_categories: payload.preferredCategories ?? [],
    created_at: authUser.created_at ?? new Date().toISOString(),
  } satisfies ApiUser;

  const { error: profileError } = await supabase.from("users").upsert(
    {
      id: fallbackProfile.id,
      email: fallbackProfile.email,
      full_name: fallbackProfile.full_name,
      password_hash: "supabase-auth-managed",
      preferred_categories: fallbackProfile.preferred_categories,
    },
    { onConflict: "id" },
  );

  if (profileError) {
    if (profileError.message.toLowerCase().includes("schema cache") || profileError.message.toLowerCase().includes("could not find the table")) {
      return { user: fallbackProfile };
    }

    throw new Error(profileError.message);
  }

  return { user: fallbackProfile };
};

export const enrollCourse = async (payload: { userId: string; courseId: string }): Promise<ApiEnrollResponse> => {
  const { data: enrollment, error } = await supabase
    .from("enrollments")
    .upsert({
      user_id: payload.userId,
      course_id: payload.courseId,
    }, { onConflict: "user_id,course_id" })
    .select("id,user_id,course_id,enrolled_at")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  const { courses } = await getCourses(payload.userId);
  const course = courses.find((candidate) => candidate.id === payload.courseId);

  if (!course) {
    throw new Error("Course not found.");
  }

  return { enrollment, course };
};

export const markLectureComplete = async (payload: { userId: string; lectureId: string }): Promise<ApiProgressResponse> => {
  const { data: progress, error } = await supabase
    .from("progress")
    .upsert({
      user_id: payload.userId,
      lecture_id: payload.lectureId,
    }, { onConflict: "user_id,lecture_id" })
    .select("id,user_id,lecture_id,completed_at")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return { progress };
};

export const findCourseById = async (courseId: string, userId?: string): Promise<Course | undefined> => {
  const { courses } = await getCourses(userId);
  return courses.find((course) => course.id === courseId);
};

export const getCommunityPosts = async (courseId?: string): Promise<CommunityPost[]> => {
  let query = supabase
    .from("community_posts")
    .select("id,user_id,course_id,author_name,body,created_at")
    .order("created_at", { ascending: false })
    .limit(60);

  if (courseId) {
    query = query.eq("course_id", courseId);
  }

  const { data, error } = await query;

  if (error) {
    const message = error.message.toLowerCase();
    if (message.includes("schema cache") || message.includes("could not find the table")) {
      return [];
    }

    throw new Error(error.message);
  }

  return (data ?? []) as CommunityPost[];
};

export const createCommunityPost = async (payload: { userId: string; courseId: string; authorName: string; body: string; }): Promise<ApiCommunityResponse> => {
  const { data, error } = await supabase
    .from("community_posts")
    .insert({
      user_id: payload.userId,
      course_id: payload.courseId,
      author_name: payload.authorName,
      body: payload.body,
    })
    .select("id,user_id,course_id,author_name,body,created_at")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return { post: data as CommunityPost };
};