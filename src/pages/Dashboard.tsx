import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, BadgeCheck, BookOpen, LogOut, Sparkles } from "lucide-react";
import { getCourses } from "@/lib/api";
import { clearSessionUser, getLastPurchasedCourseId, getSessionUser, hasSessionUser } from "@/lib/session";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();
  const user = getSessionUser();
  const signedIn = hasSessionUser();
  const lastPurchasedCourseId = getLastPurchasedCourseId();

  const { data, isLoading } = useQuery({
    queryKey: ["dashboard-courses", user.id],
    queryFn: () => getCourses(user.id),
  });

  const enrolledCourses = data?.courses.filter((course) => course.enrolled) ?? [];
  const recommendedCourses = data?.courses.filter((course) => course.recommended && !course.enrolled) ?? [];
  const highlightedCourse = enrolledCourses.find((course) => course.id === lastPurchasedCourseId) ?? enrolledCourses[0] ?? recommendedCourses[0];

  const handleSignOut = () => {
    clearSessionUser();
    navigate("/");
  };

  if (!signedIn) {
    return (
      <div className="min-h-screen bg-background px-4 py-16">
        <div className="mx-auto max-w-2xl rounded-[2rem] border border-border bg-card p-8 text-center shadow-[var(--shadow-elevated)]">
          <h1 className="text-4xl font-bold text-foreground">Sign in to view your profile</h1>
          <p className="mt-3 text-muted-foreground">Your enrolled courses, watch progress, and recommendations appear here after login.</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link to="/login" className="rounded-xl bg-primary px-5 py-3 font-semibold text-primary-foreground shadow-[var(--shadow-warm)]">Sign in</Link>
            <Link to="/register" className="rounded-xl border border-border px-5 py-3 font-semibold text-foreground">Create account</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_hsl(var(--green-india)_/_0.12),_transparent_30%),linear-gradient(180deg,_hsl(var(--background)),_hsl(var(--muted)))] px-4 py-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <section className="rounded-[2rem] border border-border bg-card p-6 shadow-[var(--shadow-elevated)] md:p-8">
          <div className="flex flex-wrap items-start justify-between gap-5">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Learner profile</p>
              <h1 className="mt-3 text-4xl font-bold text-foreground">Welcome back, {user.fullName}.</h1>
              <p className="mt-3 max-w-3xl text-muted-foreground">
                Your preferred categories drive the catalog recommendations, while course enrollment and lesson playback keep ownership and progress in sync.
              </p>
            </div>

            <div className="flex flex-col gap-3 rounded-2xl bg-muted/50 p-4">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Signed in as</p>
                <p className="mt-1 font-semibold text-foreground">{user.email}</p>
              </div>
              <button onClick={handleSignOut} className="inline-flex items-center justify-center gap-2 rounded-xl border border-border px-4 py-2 text-sm font-semibold text-foreground transition hover:border-primary hover:text-primary">
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-border bg-background p-5">
              <BookOpen className="h-5 w-5 text-primary" />
              <p className="mt-3 text-2xl font-bold text-foreground">{isLoading ? "—" : enrolledCourses.length}</p>
              <p className="text-sm text-muted-foreground">Owned courses</p>
            </div>
            <div className="rounded-2xl border border-border bg-background p-5">
              <BadgeCheck className="h-5 w-5 text-secondary" />
              <p className="mt-3 text-2xl font-bold text-foreground">{user.preferredCategories.length}</p>
              <p className="text-sm text-muted-foreground">Preferred categories</p>
            </div>
            <div className="rounded-2xl border border-border bg-background p-5">
              <Sparkles className="h-5 w-5 text-gold" />
              <p className="mt-3 text-2xl font-bold text-foreground">Free</p>
              <p className="text-sm text-muted-foreground">Video-based lessons</p>
            </div>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[0.7fr_1.3fr]">
          <div className="rounded-[2rem] border border-border bg-card p-6 shadow-[var(--shadow-card)]">
            <h2 className="text-2xl font-bold text-foreground">Your profile preferences</h2>
            <p className="mt-2 text-sm text-muted-foreground">These categories shape the recommendations returned by the course catalog.</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {user.preferredCategories.map((category) => (
                <span key={category} className="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                  {category}
                </span>
              ))}
            </div>

            {highlightedCourse ? (
              <div className="mt-6 overflow-hidden rounded-3xl border border-border bg-muted/40">
                <img src={highlightedCourse.thumbnail} alt={highlightedCourse.title} className="h-48 w-full object-cover" />
                <div className="p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Continue learning</p>
                  <h3 className="mt-2 text-xl font-bold text-foreground">{highlightedCourse.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{highlightedCourse.description}</p>
                  <Link
                    to={`/courses/${highlightedCourse.id}`}
                    className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-warm)] transition hover:opacity-95"
                  >
                    Open course <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            ) : (
              <div className="mt-6 rounded-3xl border border-dashed border-border bg-muted/30 p-6 text-sm text-muted-foreground">
                Once you enroll, the purchased course will appear here.
              </div>
            )}
          </div>

          <div className="rounded-[2rem] border border-border bg-card p-6 shadow-[var(--shadow-card)]">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-foreground">Owned courses</h2>
                <p className="mt-1 text-sm text-muted-foreground">These were added through the enrollment flow.</p>
              </div>
              <Link to="/courses" className="text-sm font-medium text-primary hover:underline">
                Browse catalog
              </Link>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {enrolledCourses.length > 0 ? enrolledCourses.map((course) => (
                <article key={course.id} className="overflow-hidden rounded-3xl border border-border bg-background">
                  <img src={course.thumbnail} alt={course.title} className="h-44 w-full object-cover" />
                  <div className="p-4">
                    <div className="flex items-center justify-between gap-3">
                      <span className="rounded-full bg-secondary/10 px-2.5 py-1 text-xs font-semibold text-secondary">Owned</span>
                      {course.recommended ? <span className="text-xs font-medium text-primary">Recommended</span> : null}
                    </div>
                    <h3 className="mt-3 text-lg font-semibold text-foreground">{course.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">{course.provider} • {course.category} • {course.lecture_count} lectures</p>
                    <Link to={`/courses/${course.id}`} className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline">
                      Resume playback <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </article>
              )) : (
                <div className="rounded-3xl border border-dashed border-border bg-muted/30 p-6 text-sm text-muted-foreground md:col-span-2">
                  Purchase a course to unlock this area.
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Dashboard;