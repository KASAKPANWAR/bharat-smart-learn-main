import { motion } from "framer-motion";
import { ArrowUpRight, BookMarked, Globe2, PlayCircle, Sparkles } from "lucide-react";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";

const resourceCards = [
  {
    title: "Learning platforms",
    description: "Browse trusted free platforms for structured courses and guided practice.",
    links: [
      { label: "freeCodeCamp", href: "https://www.freecodecamp.org/" },
      { label: "CS50", href: "https://cs50.harvard.edu/x/" },
      { label: "Khan Academy", href: "https://www.khanacademy.org/" },
    ],
  },
  {
    title: "Language and communication",
    description: "Useful if you want spoken fluency, reading, and practice material.",
    links: [
      { label: "British Council Learn English", href: "https://learnenglish.britishcouncil.org/" },
      { label: "Open educational videos", href: "https://www.youtube.com/" },
    ],
  },
  {
    title: "Project building",
    description: "When you are ready to build, these guides help turn lessons into habits.",
    links: [
      { label: "Traversy Media", href: "https://traversymedia.com/" },
      { label: "MDN Web Docs", href: "https://developer.mozilla.org/" },
      { label: "React docs", href: "https://react.dev/learn" },
    ],
  },
];

const resources = [
  { icon: PlayCircle, title: "Watch with intent", text: "Pick one course, complete it, and use the community page to judge whether it is actually worthwhile." },
  { icon: BookMarked, title: "Take notes", text: "Write down questions, summaries, and code snippets while you learn so the lesson stays with you." },
  { icon: Globe2, title: "Mix sources", text: "The catalog already blends multiple creators, topics, and styles so the platform does not feel one-dimensional." },
];

const Resources = () => (
  <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,_hsl(var(--gold)_/_0.12),_transparent_25%),linear-gradient(180deg,_hsl(var(--background)),_hsl(var(--muted)))]">
    <Navbar />
    <main className="pt-24 pb-16 px-4">
      <div className="mx-auto max-w-6xl space-y-12">
        <section className="rounded-[2rem] border border-border bg-card p-8 shadow-[var(--shadow-elevated)] md:p-10">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            <Sparkles className="h-4 w-4" />
            Learning resources
          </div>
          <h1 className="mt-4 text-4xl font-bold text-foreground md:text-5xl">Everything you need to keep learning after the first click.</h1>
          <p className="mt-4 max-w-3xl text-lg text-muted-foreground">
            This page collects the most useful places to study, compare, and build. It is meant to support a habit of learning instead of a one-time browse.
          </p>
        </section>

        <section className="grid gap-6 md:grid-cols-3">
          {resources.map((resource, index) => (
            <motion.article
              key={resource.title}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              className="rounded-[1.75rem] border border-border bg-card p-6 shadow-[var(--shadow-card)]"
            >
              <resource.icon className="h-6 w-6 text-primary" />
              <h2 className="mt-4 text-xl font-semibold text-foreground">{resource.title}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{resource.text}</p>
            </motion.article>
          ))}
        </section>

        <section className="grid gap-6 xl:grid-cols-3">
          {resourceCards.map((card) => (
            <article key={card.title} className="rounded-[1.75rem] border border-border bg-card p-6 shadow-[var(--shadow-card)]">
              <h2 className="text-2xl font-bold text-foreground">{card.title}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{card.description}</p>
              <div className="mt-5 space-y-3">
                {card.links.map((link) => (
                  <a key={link.label} href={link.href} target="_blank" rel="noreferrer" className="flex items-center justify-between rounded-xl border border-border bg-background px-4 py-3 text-sm font-medium text-foreground transition hover:border-primary hover:text-primary">
                    <span>{link.label}</span>
                    <ArrowUpRight className="h-4 w-4" />
                  </a>
                ))}
              </div>
            </article>
          ))}
        </section>
      </div>
    </main>
    <Footer />
  </div>
);

export default Resources;
