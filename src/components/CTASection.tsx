import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const CTASection = () => (
  <section className="py-20">
    <div className="container mx-auto px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="rounded-2xl gradient-saffron p-12 md:p-16 text-center relative overflow-hidden"
      >
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-card blur-3xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-card blur-3xl" />
        </div>
        <div className="relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4 font-display">
            Join the Movement for Self-Reliant Education
          </h2>
          <p className="text-primary-foreground/80 max-w-lg mx-auto mb-8 text-lg">
            Be part of India's largest Swadeshi education platform. Learn, grow, and contribute to Atmanirbhar Bharat.
          </p>
          <Link to="/register" className="px-8 py-3.5 rounded-xl bg-card text-foreground font-semibold shadow-[var(--shadow-elevated)] hover:bg-card/90 transition-colors inline-flex items-center gap-2">
            Start Your Journey <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </motion.div>
    </div>
  </section>
);

export default CTASection;
