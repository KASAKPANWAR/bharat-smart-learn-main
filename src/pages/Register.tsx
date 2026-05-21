import { FormEvent, useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerUser } from "@/lib/api";
import { setSessionUser } from "@/lib/session";

const availableCategories = ["Technology", "Languages", "Ayurveda", "Indian Arts"];

const Register = () => {
  const navigate = useNavigate();
  const [selectedCategories, setSelectedCategories] = useState<string[]>(["Technology", "Languages"]);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const categorySummary = useMemo(() => selectedCategories.join(", "), [selectedCategories]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const formData = new FormData(e.currentTarget);

    try {
      const response = await registerUser({
        fullName: String(formData.get("name") ?? ""),
        email: String(formData.get("email") ?? ""),
        password: String(formData.get("password") ?? ""),
        preferredCategories: selectedCategories,
      });

      setSessionUser({
        id: response.user.id,
        email: response.user.email,
        fullName: response.user.full_name,
        preferredCategories: response.user.preferred_categories,
      });

      navigate("/dashboard");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to create account.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="max-w-md w-full bg-card rounded-2xl p-8 shadow-[var(--shadow-elevated)]">
        <h2 className="text-2xl font-bold mb-4">Create your account</h2>
        <p className="text-sm text-muted-foreground mb-6">Join स्वदेशीEdu and start learning today.</p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-left">
          <input name="name" type="text" placeholder="Full name" required className="w-full px-4 py-2 rounded-lg border border-border bg-card text-foreground" />
          <input name="email" type="email" placeholder="Email" required className="w-full px-4 py-2 rounded-lg border border-border bg-card text-foreground" />
          <input name="password" type="password" placeholder="Password" required className="w-full px-4 py-2 rounded-lg border border-border bg-card text-foreground" />

          <div className="space-y-3">
            <p className="text-sm font-medium text-foreground">Preferred categories</p>
            <div className="flex flex-wrap gap-2">
              {availableCategories.map((category) => {
                const selected = selectedCategories.includes(category);

                return (
                  <button
                    key={category}
                    type="button"
                    onClick={() => {
                      setSelectedCategories((current) => (
                        current.includes(category)
                          ? current.filter((item) => item !== category)
                          : [...current, category]
                      ));
                    }}
                    className={`rounded-full border px-3 py-1.5 text-sm transition ${selected ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background text-foreground"}`}
                  >
                    {category}
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-muted-foreground">Stored in the users table as preferred_categories and used by the course recommendation endpoint.</p>
            <p className="text-xs text-muted-foreground">Selected: {categorySummary}</p>
          </div>

          {error ? <p className="text-sm text-destructive">{error}</p> : null}

          <button disabled={submitting} className="px-4 py-2 rounded-lg gradient-saffron text-primary-foreground font-semibold disabled:opacity-70">
            {submitting ? "Creating account..." : "Register"}
          </button>
          <p className="text-xs text-muted-foreground">
            For instant signup, turn off email confirmation in Supabase Auth.
          </p>
        </form>

        <div className="mt-6 text-sm text-muted-foreground">
          Already have an account? <Link to="/login" className="text-primary underline">Sign in</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
