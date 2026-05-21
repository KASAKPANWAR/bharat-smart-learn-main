import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, Clock3, PlayCircle, Sparkles } from "lucide-react";
import YouTubeLecturePlayer from "@/components/YouTubeLecturePlayer";
import { findCourseById, markLectureComplete } from "@/lib/api";
import { getSessionUser } from "@/lib/session";
import type { Course } from "@/lib/types";

const CourseDetail = () => {
  const params = useParams();
  const sessionUser = getSessionUser();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeLectureId, setActiveLectureId] = useState<string | null>(null);
  const [completedLectureIds, setCompletedLectureIds] = useState<string[]>([]);

  useEffect(() => {
    let active = true;

    const loadCourse = async () => {
      if (!params.courseId) {
        setLoading(false);
        return;
      }

      const selectedCourse = await findCourseById(params.courseId, sessionUser.id);
      if (!active) {
        return;
      }

      setCourse(selectedCourse ?? null);
      setActiveLectureId(selectedCourse?.lectures[0]?.id ?? null);
      setLoading(false);
    };

    void loadCourse();

    return () => {
      active = false;
    };
  }, [params.courseId, sessionUser.id]);

  const activeLecture = useMemo(() => course?.lectures.find((lecture) => lecture.id === activeLectureId) ?? course?.lectures[0], [activeLectureId, course]);
  const activeLectureIndex = useMemo(() => course?.lectures.findIndex((lecture) => lecture.id === activeLecture?.id) ?? -1, [activeLecture?.id, course]);

  const handleLectureEnded = async () => {
    if (!activeLecture) {
      return;
    }

    await markLectureComplete({ userId: sessionUser.id, lectureId: activeLecture.id });
    setCompletedLectureIds((current) => Array.from(new Set([...current, activeLecture.id])));

    const nextLecture = course?.lectures[activeLectureIndex + 1];
    if (nextLecture) {
      setActiveLectureId(nextLecture.id);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center bg-background px-4 text-muted-foreground">
        Loading course...
      </div>
    );
  }

  if (!course) {
    return <Navigate to="/courses" replace />;
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,_hsl(var(--background)),_hsl(var(--muted))_100%)] px-4 py-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <Link to="/courses" className="text-sm font-medium text-muted-foreground hover:text-primary">
              Back to all courses
            </Link>
            <h1 className="mt-3 text-4xl font-bold text-foreground">{course.title}</h1>
            <p className="mt-2 max-w-3xl text-muted-foreground">{course.description}</p>
            <a href={course.source_url} target="_blank" rel="noreferrer" className="mt-3 inline-flex text-sm font-semibold text-primary hover:underline">
              Open the original lesson series
            </a>
          </div>
          <div className="rounded-2xl border border-border bg-card px-5 py-4 shadow-[var(--shadow-card)]">
            <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Category</p>
            <p className="mt-1 text-xl font-semibold text-foreground">{course.category}</p>
            <p className="mt-1 text-sm text-muted-foreground">{course.provider}</p>
          </div>
        </div>

        <div className="grid gap-8 xl:grid-cols-[1.35fr_0.65fr]">
          <div className="space-y-6">
            {activeLecture ? (
              <YouTubeLecturePlayer
                videoId={activeLecture.youtube_video_id}
                title={activeLecture.title}
                autoPlay={activeLectureIndex === 0}
                onEnded={handleLectureEnded}
              />
            ) : null}

            <div className="rounded-3xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Now playing</p>
                  <h2 className="mt-1 text-2xl font-bold text-foreground">{activeLecture?.title ?? "Select a lecture"}</h2>
                </div>

                <Link
                  to={`/checkout/${course.id}`}
                  className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-warm)] transition hover:opacity-95"
                >
                  Go to checkout <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  to={`/community?course=${course.id}`}
                  className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-semibold text-foreground transition hover:border-primary hover:text-primary"
                >
                  Discuss course
                </Link>
              </div>

              <p className="mt-4 text-sm text-muted-foreground">
                Progress is saved automatically when a lesson finishes.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {course.lectures.map((lecture, index) => {
                const completed = completedLectureIds.includes(lecture.id);
                const active = lecture.id === activeLecture?.id;

                return (
                  <motion.button
                    key={lecture.id}
                    whileHover={{ y: -2 }}
                    onClick={() => setActiveLectureId(lecture.id)}
                    className={`rounded-2xl border p-4 text-left transition ${active ? "border-primary bg-primary/5" : "border-border bg-card hover:border-primary/40"}`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Lecture {index + 1}</p>
                        <h3 className="mt-1 text-lg font-semibold text-foreground">{lecture.title}</h3>
                      </div>
                      {completed ? <CheckCircle2 className="h-5 w-5 text-emerald-600" /> : <PlayCircle className="h-5 w-5 text-primary" />}
                    </div>
                    <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock3 className="h-4 w-4" />
                      Video lesson
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>

          <aside className="rounded-[2rem] border border-border bg-card p-6 shadow-[var(--shadow-card)]">
            <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-primary">
              <Sparkles className="h-4 w-4" />
              Course navigation
            </div>

            <div className="mt-5 space-y-3">
              {course.lectures.map((lecture, index) => {
                const active = lecture.id === activeLecture?.id;
                return (
                  <button
                    key={lecture.id}
                    onClick={() => setActiveLectureId(lecture.id)}
                    className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left transition ${active ? "border-primary bg-primary/5" : "border-border bg-background hover:border-primary/40"}`}
                  >
                    <span className="text-sm font-medium text-foreground">{index + 1}. {lecture.title}</span>
                    {active ? <span className="text-xs font-semibold text-primary">Now playing</span> : <span className="text-xs text-muted-foreground">Select</span>}
                  </button>
                );
              })}
            </div>

            <div className="mt-6 rounded-2xl bg-muted/50 p-4">
              <p className="text-sm font-medium text-foreground">Tracking summary</p>
              <p className="mt-1 text-sm text-muted-foreground">
              The player is embedded inside the app and records completion automatically at the end of each lesson.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;