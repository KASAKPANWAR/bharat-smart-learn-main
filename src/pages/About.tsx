import { motion } from "framer-motion";
import { BookOpen, Compass, HeartHandshake, ShieldCheck } from "lucide-react";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";

const values = [
  {
    icon: BookOpen,
    title: "Curated learning paths",
    text: "Courses are grouped like real study tracks so the platform feels structured instead of random.",
  },
  {
    icon: Compass,
    title: "Clear guidance",
    text: "Every page nudges the learner to the next step without burying them in clutter.",
  },
  {
    icon: HeartHandshake,
    title: "Community-first learning",
    text: "Students can compare notes, ask what is worth their time, and learn from each other's experience.",
  },
  {
    icon: ShieldCheck,
    title: "Practical ownership",
    text: "Enrollments, progress, and preferences stay attached to the signed-in learner profile.",
  },
];

const About = () => (
  <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_hsl(var(--green-india)_/_0.1),_transparent_30%),linear-gradient(180deg,_hsl(var(--background)),_hsl(var(--muted)))]">
    <Navbar />
    <main className="pt-24 pb-16 px-4">
      <div className="mx-auto max-w-6xl space-y-12">
        <motion.section
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-[2rem] border border-border bg-card p-8 shadow-[var(--shadow-elevated)] md:p-10"
        >
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">About स्वदेशीEdu</p>
          <h1 className="mt-4 text-4xl font-bold text-foreground md:text-5xl">A smarter way to discover free learning that still feels premium.</h1>
          <p className="mt-4 max-w-3xl text-lg text-muted-foreground">
            स्वदेशीEdu is built around the idea that learners need structure, trust, and a place to discuss whether a course is actually worth the time. The result is a simple catalog, a progress-aware profile, and a community layer around each course.
          </p>
        </motion.section>

        <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {values.map((value, index) => (
            <motion.article
              key={value.title}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              className="rounded-[1.75rem] border border-border bg-card p-6 shadow-[var(--shadow-card)]"
            >
              <value.icon className="h-6 w-6 text-primary" />
              <h2 className="mt-4 text-xl font-semibold text-foreground">{value.title}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{value.text}</p>
            </motion.article>
          ))}
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[2rem] border border-border bg-card p-8 shadow-[var(--shadow-card)]">
            <h2 className="text-2xl font-bold text-foreground">Why this project exists</h2>
            <p className="mt-3 text-muted-foreground">
              Free learning content is abundant, but it is usually scattered. This app turns that into a single place where people can find a course, enroll in it, track progress, and talk about whether it is genuinely useful.
            </p>
          </div>
          <div className="rounded-[2rem] border border-border bg-card p-8 shadow-[var(--shadow-card)]">
            <h2 className="text-2xl font-bold text-foreground">What learners get</h2>
            <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
              <li>• A curated catalog with balanced categories</li>
              <li>• Signed-in profiles with saved preferences</li>
              <li>• Progress tracking at the lesson level</li>
              <li>• A community page for course discussion</li>
            </ul>
          </div>
        </section>
      </div>
    </main>
    <Footer />
  </div>
);

export default About;
