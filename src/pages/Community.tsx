import { FormEvent, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MessageSquareText, PlusCircle, Sparkles, ThumbsUp } from "lucide-react";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { createCommunityPost, getCommunityPosts, getCourses } from "@/lib/api";
import { getSessionUser, hasSessionUser } from "@/lib/session";

const formatRelativeTime = (value: string) => {
  const date = new Date(value);
  const diffMs = Date.now() - date.getTime();
  const minutes = Math.floor(diffMs / 60000);
  const hours = Math.floor(diffMs / 3600000);
  const days = Math.floor(diffMs / 86400000);

  if (minutes < 1) {
    return "just now";
  }
  if (minutes < 60) {
    return `${minutes}m ago`;
  }
  if (hours < 24) {
    return `${hours}h ago`;
  }
  return `${days}d ago`;
};

const Community = () => {
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const user = getSessionUser();
  const signedIn = hasSessionUser();
  const [body, setBody] = useState("");

  const { data: coursesData, isLoading: coursesLoading } = useQuery({
    queryKey: ["community-courses", user.id],
    queryFn: () => getCourses(user.id),
  });

  const selectedCourseId = searchParams.get("course") ?? coursesData?.courses[0]?.id ?? "";

  const { data: posts = [], isLoading: postsLoading } = useQuery({
    queryKey: ["community-posts", selectedCourseId],
    queryFn: () => getCommunityPosts(selectedCourseId),
    enabled: Boolean(selectedCourseId),
  });

  const selectedCourse = useMemo(() => coursesData?.courses.find((course) => course.id === selectedCourseId), [coursesData?.courses, selectedCourseId]);

  const addPost = useMutation({
    mutationFn: async () => createCommunityPost({ userId: user.id, courseId: selectedCourseId, authorName: user.fullName, body: body.trim() }),
    onSuccess: async () => {
      setBody("");
      await queryClient.invalidateQueries({ queryKey: ["community-posts", selectedCourseId] });
    },
  });

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!body.trim() || !selectedCourseId) {
      return;
    }

    void addPost.mutateAsync();
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_hsl(var(--green-india)_/_0.12),_transparent_28%),linear-gradient(180deg,_hsl(var(--background)),_hsl(var(--muted)))]">
      <Navbar />
      <main className="pt-24 pb-16 px-4">
        <div className="mx-auto max-w-7xl space-y-8">
          <section className="rounded-[2rem] border border-border bg-card p-8 shadow-[var(--shadow-elevated)] md:p-10">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              <MessageSquareText className="h-4 w-4" />
              Community discussion
            </div>
            <h1 className="mt-4 text-4xl font-bold text-foreground md:text-5xl">Talk about courses, compare notes, and decide what is actually worth it.</h1>
            <p className="mt-4 max-w-3xl text-lg text-muted-foreground">
              Pick a course, share your opinion, ask questions, and read what others found useful. This page is meant to help learners separate hype from real value.
            </p>
          </section>

          {!signedIn ? (
            <section className="rounded-[1.75rem] border border-border bg-card p-8 shadow-[var(--shadow-card)]">
              <h2 className="text-2xl font-bold text-foreground">Sign in to join the discussion</h2>
              <p className="mt-2 text-muted-foreground">Posting uses your signed-in profile so course conversations stay tied to real learners.</p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link to="/login" className="rounded-xl bg-primary px-5 py-3 font-semibold text-primary-foreground shadow-[var(--shadow-warm)]">Sign in</Link>
                <Link to="/register" className="rounded-xl border border-border px-5 py-3 font-semibold text-foreground">Create account</Link>
              </div>
            </section>
          ) : null}

          <div className="grid gap-8 xl:grid-cols-[0.9fr_1.1fr]">
            <aside className="space-y-6">
              <section className="rounded-[1.75rem] border border-border bg-card p-6 shadow-[var(--shadow-card)]">
                <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-primary">
                  <Sparkles className="h-4 w-4" />
                  Pick a course
                </div>
                <div className="mt-4 space-y-3">
                  {coursesLoading ? (
                    <p className="text-sm text-muted-foreground">Loading course list...</p>
                  ) : (
                    coursesData?.courses.map((course) => {
                      const active = course.id === selectedCourseId;
                      return (
                        <button
                          key={course.id}
                          onClick={() => setSearchParams({ course: course.id })}
                          className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left transition ${active ? "border-primary bg-primary/5" : "border-border bg-background hover:border-primary/40"}`}
                        >
                          <span className="text-sm font-semibold text-foreground">{course.title}</span>
                          <span className="text-xs text-muted-foreground">{course.provider}</span>
                        </button>
                      );
                    })
                  )}
                </div>
              </section>

              {selectedCourse ? (
                <section className="rounded-[1.75rem] border border-border bg-card p-6 shadow-[var(--shadow-card)]">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Currently discussing</p>
                  <h2 className="mt-2 text-2xl font-bold text-foreground">{selectedCourse.title}</h2>
                  <p className="mt-2 text-sm text-muted-foreground">{selectedCourse.description}</p>
                  <Link to={`/courses/${selectedCourse.id}`} className="mt-4 inline-flex text-sm font-semibold text-primary hover:underline">
                    Open course page
                  </Link>
                </section>
              ) : null}
            </aside>

            <section className="space-y-6">
              <div className="rounded-[1.75rem] border border-border bg-card p-6 shadow-[var(--shadow-card)]">
                <h2 className="text-2xl font-bold text-foreground">Post a discussion</h2>
                <p className="mt-2 text-sm text-muted-foreground">Write a short note about the course, the difficulty, or whether it is worth someone else's time.</p>
                <form onSubmit={handleSubmit} className="mt-5 space-y-4">
                  <textarea
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    rows={5}
                    maxLength={800}
                    placeholder="Share your experience, questions, or a quick verdict..."
                    className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-foreground outline-none transition focus:border-primary"
                    disabled={!signedIn || !selectedCourseId}
                  />
                  <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
                    <span>{body.length}/800 characters</span>
                    <span className="inline-flex items-center gap-1"><ThumbsUp className="h-3.5 w-3.5" />Be specific and respectful</span>
                  </div>
                  <button
                    type="submit"
                    disabled={!signedIn || addPost.isPending || !body.trim() || !selectedCourseId}
                    className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 font-semibold text-primary-foreground shadow-[var(--shadow-warm)] transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <PlusCircle className="h-4 w-4" />
                    {addPost.isPending ? "Posting..." : "Post comment"}
                  </button>
                </form>
              </div>

              <div className="space-y-4">
                {postsLoading ? (
                  <div className="rounded-[1.75rem] border border-border bg-card p-6 text-sm text-muted-foreground shadow-[var(--shadow-card)]">Loading discussion...</div>
                ) : posts.length > 0 ? (
                  posts.map((post) => {
                    const course = coursesData?.courses.find((item) => item.id === post.course_id);
                    return (
                      <article key={post.id} className="rounded-[1.75rem] border border-border bg-card p-6 shadow-[var(--shadow-card)]">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-foreground">{post.author_name}</p>
                            <p className="text-xs text-muted-foreground">{formatRelativeTime(post.created_at)}</p>
                          </div>
                          {course ? <Link to={`/courses/${course.id}`} className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">{course.title}</Link> : null}
                        </div>
                        <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-foreground">{post.body}</p>
                      </article>
                    );
                  })
                ) : (
                  <div className="rounded-[1.75rem] border border-dashed border-border bg-card p-8 text-sm text-muted-foreground shadow-[var(--shadow-card)]">
                    No comments yet for this course. Start the discussion.
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Community;
