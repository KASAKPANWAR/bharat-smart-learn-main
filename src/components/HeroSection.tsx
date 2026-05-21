import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import heroImage from "@/assets/hero-illustration.png";
import { Link } from "react-router-dom";

const HeroSection = () => (
  <section className="relative pt-28 pb-16 md:pt-36 md:pb-24 overflow-hidden">
    {/* Decorative tricolor bar */}
    <div className="absolute top-16 left-0 right-0 h-1 gradient-tricolor opacity-60" />

    <div className="container mx-auto px-4 grid md:grid-cols-2 gap-12 items-center">
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7 }}
      >
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-saffron-light text-primary text-sm font-semibold mb-6">
          <Sparkles className="w-4 h-4" />
          आत्मनिर्भर भारत
        </div>

        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-foreground mb-6">
          Empowering India Through{" "}
          <span className="text-gradient-saffron">Smart Education</span>
        </h1>

        <p className="text-lg text-muted-foreground mb-8 max-w-lg leading-relaxed">
          Learn from India's finest educators. Master skills rooted in our heritage, 
          powered by modern technology. Build a self-reliant future.
        </p>

        <div className="flex flex-wrap gap-4">
          <Link to="/courses" className="px-8 py-3.5 rounded-xl gradient-saffron text-primary-foreground font-semibold shadow-[var(--shadow-warm)] hover:opacity-90 transition-opacity flex items-center gap-2">
            Start Learning <ArrowRight className="w-4 h-4" />
          </Link>
          <Link to="/courses" className="px-8 py-3.5 rounded-xl border-2 border-secondary text-secondary font-semibold hover:bg-green-india-light transition-colors inline-flex items-center justify-center">
            Explore Courses
          </Link>
        </div>

        <div className="flex items-center gap-8 mt-10">
          {[
            ["50K+", "Students"],
            ["200+", "Courses"],
            ["100+", "Mentors"],
          ].map(([num, label]) => (
            <div key={label}>
              <div className="text-2xl font-bold font-display text-foreground">{num}</div>
              <div className="text-sm text-muted-foreground">{label}</div>
            </div>
          ))}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, delay: 0.2 }}
        className="flex justify-center"
      >
        <img
          src={heroImage}
          alt="Indian students learning together"
          className="w-full max-w-lg animate-float"
        />
      </motion.div>
    </div>
  </section>
);

export default HeroSection;
