import { FormEvent, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginUser } from "@/lib/api";
import { setSessionUser } from "@/lib/session";

const Login = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const formData = new FormData(e.currentTarget);

    try {
      const response = await loginUser({
        email: String(formData.get("email") ?? ""),
        password: String(formData.get("password") ?? ""),
      });

      setSessionUser({
        id: response.user.id,
        email: response.user.email,
        fullName: response.user.full_name,
        preferredCategories: response.user.preferred_categories,
      });

      navigate("/dashboard");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to sign in.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="max-w-md w-full bg-card rounded-2xl p-8 shadow-[var(--shadow-elevated)]">
        <h2 className="text-2xl font-bold mb-4">Welcome back</h2>
        <p className="text-sm text-muted-foreground mb-6">Sign in to continue your learning journey.</p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input name="email" type="email" placeholder="Email" required className="w-full px-4 py-2 rounded-lg border border-border bg-card text-foreground" />
          <input name="password" type="password" placeholder="Password" required className="w-full px-4 py-2 rounded-lg border border-border bg-card text-foreground" />

          {error ? <p className="text-sm text-destructive text-left">{error}</p> : null}

          <button disabled={submitting} className="px-4 py-2 rounded-lg gradient-saffron text-primary-foreground font-semibold disabled:opacity-70">
            {submitting ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <div className="mt-6 text-sm text-muted-foreground">
          Don’t have an account? <Link to="/register" className="text-primary underline">Register</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
