import { FormEvent, useEffect, useMemo, useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, CreditCard, Loader2, ShieldCheck, Sparkles } from "lucide-react";
import { enrollCourse, findCourseById } from "@/lib/api";
import { getSessionUser, setLastPurchasedCourseId } from "@/lib/session";
import type { Course } from "@/lib/types";

const confettiPieces = Array.from({ length: 18 }, (_, index) => ({
  id: index,
  angle: (index / 18) * 360,
  delay: index * 0.03,
}));

const Checkout = () => {
  const navigate = useNavigate();
  const params = useParams();
  const user = getSessionUser();
  const [course, setCourse] = useState<Course | null>(null);
  const [loadingCourse, setLoadingCourse] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [complete, setComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const loadCourse = async () => {
      if (!params.courseId) {
        setLoadingCourse(false);
        return;
      }

      try {
        const selectedCourse = await findCourseById(params.courseId, user.id);
        if (active) {
          setCourse(selectedCourse ?? null);
        }
      } finally {
        if (active) {
          setLoadingCourse(false);
        }
      }
    };

    void loadCourse();

    return () => {
      active = false;
    };
  }, [params.courseId, user.id]);

  const orderTotal = useMemo(() => (course ? 499 : 0), [course]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!course) {
      return;
    }

    setError(null);
    setProcessing(true);

    try {
      await enrollCourse({ userId: user.id, courseId: course.id });
      setLastPurchasedCourseId(course.id);
      setProcessing(false);
      setComplete(true);

      window.setTimeout(() => {
        navigate("/dashboard", { replace: true });
      }, 1400);
    } catch (submitError) {
      setProcessing(false);
      setError(submitError instanceof Error ? submitError.message : "Checkout failed.");
    }
  };

  if (loadingCourse) {
    return (
      <div className="min-h-screen grid place-items-center bg-background px-4">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <p>Loading checkout...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return <Navigate to="/courses" replace />;
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_hsl(var(--saffron)_/_0.18),_transparent_34%),linear-gradient(180deg,_hsl(var(--background)),_hsl(var(--muted)))] px-4 py-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 lg:flex-row lg:items-start">
        <div className="flex-1 rounded-[2rem] border border-border bg-card/90 p-6 shadow-[var(--shadow-elevated)] backdrop-blur-sm md:p-8">
          <Link to={`/courses/${course.id}`} className="text-sm font-medium text-muted-foreground hover:text-primary">
            Back to course
          </Link>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              Enrollment
            </span>
            <span className="rounded-full bg-secondary/10 px-3 py-1 text-xs font-semibold text-secondary">
              Secure processing
            </span>
          </div>

          <h1 className="mt-5 text-4xl font-bold text-foreground">Complete your access for {course.title}</h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            The enrollment flow waits 1.5 seconds to simulate payment verification, saves the purchase, and then routes you to your dashboard.
          </p>

          <div className="mt-8 overflow-hidden rounded-2xl border border-border bg-muted/40">
            <img src={course.thumbnail} alt={course.title} className="h-56 w-full object-cover" />
          </div>

          <form onSubmit={handleSubmit} className="mt-8 grid gap-5">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="grid gap-2 text-sm font-medium text-foreground">
                Card holder
                <input
                  name="cardHolder"
                  placeholder="Aarav Sharma"
                  required
                  className="h-12 rounded-xl border border-border bg-background px-4 text-foreground outline-none transition focus:border-primary"
                />
              </label>
              <label className="grid gap-2 text-sm font-medium text-foreground">
                Email
                <input
                  name="email"
                  type="email"
                  defaultValue={user.email}
                  required
                  className="h-12 rounded-xl border border-border bg-background px-4 text-foreground outline-none transition focus:border-primary"
                />
              </label>
            </div>

            <div className="grid gap-4 md:grid-cols-[1.35fr_0.65fr_0.5fr]">
              <label className="grid gap-2 text-sm font-medium text-foreground">
                Card number
                <div className="flex h-12 items-center gap-3 rounded-xl border border-border bg-background px-4">
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                  <input
                    name="cardNumber"
                    placeholder="4242 4242 4242 4242"
                    required
                    className="w-full bg-transparent text-foreground outline-none"
                  />
                </div>
              </label>
              <label className="grid gap-2 text-sm font-medium text-foreground">
                Expiry
                <input
                  name="expiry"
                  placeholder="09/29"
                  required
                  className="h-12 rounded-xl border border-border bg-background px-4 text-foreground outline-none transition focus:border-primary"
                />
              </label>
              <label className="grid gap-2 text-sm font-medium text-foreground">
                CVV
                <input
                  name="cvv"
                  placeholder="123"
                  required
                  className="h-12 rounded-xl border border-border bg-background px-4 text-foreground outline-none transition focus:border-primary"
                />
              </label>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-muted/40 p-4">
              <div>
                <p className="text-sm font-medium text-foreground">Access includes lectures, progress tracking, and recommendation updates.</p>
                <p className="text-sm text-muted-foreground">Your progress is recorded automatically when the lesson finishes.</p>
              </div>
              <div className="text-right">
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Total</p>
                <p className="text-3xl font-bold text-foreground">₹{orderTotal}</p>
              </div>
            </div>

            {error ? <p className="text-sm font-medium text-destructive">{error}</p> : null}

            <button
              type="submit"
              disabled={processing || complete}
              className="inline-flex h-12 items-center justify-center rounded-xl bg-primary px-6 font-semibold text-primary-foreground shadow-[var(--shadow-warm)] transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {processing ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Verifying enrollment...
                </span>
              ) : complete ? (
                <span className="inline-flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  Success
                </span>
              ) : (
                "Confirm enrollment"
              )}
            </button>
          </form>
        </div>

        <aside className="relative w-full max-w-xl overflow-hidden rounded-[2rem] border border-border bg-card p-6 shadow-[var(--shadow-elevated)] lg:sticky lg:top-6">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_hsl(var(--gold)_/_0.24),_transparent_25%)]" />
          <div className="relative z-10">
            <div className="flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.2em] text-primary">
              <ShieldCheck className="h-4 w-4" />
              Secure demo flow
            </div>

            <div className="mt-6 rounded-3xl border border-border bg-background p-5">
              <p className="text-sm font-medium text-muted-foreground">Enrollment summary</p>
              <h2 className="mt-2 text-2xl font-bold text-foreground">{course.title}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{course.description}</p>
              <dl className="mt-6 grid gap-4 text-sm text-muted-foreground">
                <div className="flex items-center justify-between">
                  <dt>Category</dt>
                  <dd className="font-semibold text-foreground">{course.category}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt>Lectures</dt>
                  <dd className="font-semibold text-foreground">{course.lecture_count}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt>Processing time</dt>
                  <dd className="font-semibold text-foreground">1.5 seconds</dd>
                </div>
              </dl>
            </div>

            <AnimatePresence>
              {complete ? (
                <motion.div
                  initial={{ opacity: 0, y: 20, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="relative mt-6 overflow-hidden rounded-3xl border border-emerald-200 bg-emerald-50 p-6 text-emerald-950"
                >
                  <div className="absolute inset-0">
                    {confettiPieces.map((piece) => (
                      <motion.span
                        key={piece.id}
                        initial={{ opacity: 0, y: 0, x: 0, rotate: 0 }}
                        animate={{ opacity: [0, 1, 0], y: [0, -60], x: [0, Math.cos((piece.angle * Math.PI) / 180) * 42], rotate: [0, 180] }}
                        transition={{ duration: 1.2, delay: piece.delay, repeat: 0 }}
                        className="absolute left-1/2 top-1/2 block h-2 w-2 rounded-full bg-emerald-500"
                      />
                    ))}
                  </div>
                  <div className="relative z-10 flex items-center gap-4">
                    <div className="grid h-16 w-16 place-items-center rounded-full bg-white shadow-sm">
                      <CheckCircle2 className="h-10 w-10 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-700">Payment confirmed</p>
                      <p className="mt-1 text-lg font-semibold">Your enrollment has been saved. Redirecting to the dashboard.</p>
                    </div>
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Checkout;