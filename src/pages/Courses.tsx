import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, BookOpen, CheckCircle2, Loader2, Sparkles } from "lucide-react";
import CourseCategories from "@/components/CourseCategories";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { getCourses } from "@/lib/api";
import { getSessionUser } from "@/lib/session";

const Courses = () => {
  const user = getSessionUser();
  const { data, isLoading, error } = useQuery({
    queryKey: ["courses", user.id],
    queryFn: () => getCourses(user.id),
  });

  const courses = data?.courses ?? [];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 space-y-12">
          <section className="rounded-[2rem] border border-border bg-card p-6 shadow-[var(--shadow-card)] md:p-8">
            <div className="flex flex-wrap items-start justify-between gap-5">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                  <Sparkles className="h-4 w-4" />
                  Personalized catalog
                </div>
                <h1 className="mt-4 text-4xl font-bold text-foreground">All courses, ranked by your category preferences.</h1>
                <p className="mt-3 max-w-3xl text-muted-foreground">
                  This catalog comes from the backend endpoint. If the logged-in user has preferred categories, those courses float to the top.
                </p>
              </div>

              <div className="rounded-2xl border border-border bg-background p-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <BookOpen className="h-4 w-4 text-primary" />
                  Signed in as {user.fullName}
                </div>
                <p className="mt-2 text-sm text-muted-foreground">Preferences: {user.preferredCategories.join(", ")}</p>
              </div>
            </div>
          </section>

          <CourseCategories />

          <section className="space-y-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-3xl font-bold text-foreground">Available courses</h2>
                <p className="mt-1 text-muted-foreground">Each course includes a structured lesson sequence with automatic progress tracking at lesson end.</p>
              </div>
              <div className="text-sm text-muted-foreground">{courses.length} course{courses.length === 1 ? "" : "s"}</div>
            </div>

            {isLoading ? (
              <div className="flex items-center gap-2 rounded-2xl border border-border bg-card p-5 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                Loading course catalog...
              </div>
            ) : error ? (
              <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-5 text-sm text-destructive">
                {(error as Error).message}
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {courses.map((course) => (
                  <article key={course.id} className="overflow-hidden rounded-[1.75rem] border border-border bg-card shadow-[var(--shadow-card)] transition hover:-translate-y-1 hover:shadow-[var(--shadow-elevated)]">
                    <div className="relative h-48 overflow-hidden">
                      <img src={course.thumbnail} alt={course.title} className="h-full w-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/20 to-transparent" />
                      <div className="absolute left-4 top-4 flex gap-2">
                        {course.recommended ? <span className="rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">Recommended</span> : null}
                        {course.enrolled ? <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-secondary-foreground">Owned</span> : null}
                      </div>
                      <div className="absolute bottom-4 left-4 right-4 text-primary-foreground">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary-foreground/80">{course.category}</p>
                        <h3 className="mt-2 text-2xl font-bold">{course.title}</h3>
                        <p className="mt-1 text-xs text-primary-foreground/80">{course.provider}</p>
                      </div>
                    </div>

                    <div className="space-y-4 p-5 text-left">
                      <p className="text-sm text-muted-foreground">{course.description}</p>
                      <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                        <span className="inline-flex items-center gap-1"><BookOpen className="h-4 w-4" />{course.lecture_count} lectures</span>
                        <span className="inline-flex items-center gap-1"><CheckCircle2 className="h-4 w-4 text-emerald-600" />Progress tracked automatically</span>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <Link to={`/courses/${course.id}`} className="inline-flex items-center justify-center gap-2 rounded-xl border border-border px-4 py-2.5 font-semibold text-foreground transition hover:border-primary hover:text-primary">
                          Preview <ArrowRight className="h-4 w-4" />
                        </Link>
                        <Link to={`/checkout/${course.id}`} className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 font-semibold text-primary-foreground shadow-[var(--shadow-warm)] transition hover:opacity-95">
                          Checkout
                        </Link>
                      </div>
                      <a href={course.source_url} target="_blank" rel="noreferrer" className="inline-flex text-sm font-semibold text-muted-foreground hover:text-primary">
                        Open lesson series
                      </a>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Courses;
