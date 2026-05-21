import { motion } from "framer-motion";
import { BookOpen, Code, Palette, Languages, Microscope, Music, Calculator, Leaf } from "lucide-react";

const categories = [
  { icon: Microscope, name: "Vedic Science", count: 24, color: "bg-saffron-light text-primary" },
  { icon: Code, name: "Technology", count: 42, color: "bg-green-india-light text-secondary" },
  { icon: Palette, name: "Indian Arts", count: 18, color: "bg-saffron-light text-primary" },
  { icon: Languages, name: "Languages", count: 35, color: "bg-green-india-light text-secondary" },
  { icon: Calculator, name: "Mathematics", count: 28, color: "bg-saffron-light text-primary" },
  { icon: Music, name: "Classical Music", count: 15, color: "bg-green-india-light text-secondary" },
  { icon: Leaf, name: "Ayurveda", count: 20, color: "bg-saffron-light text-primary" },
  { icon: BookOpen, name: "Philosophy", count: 22, color: "bg-green-india-light text-secondary" },
];

const CourseCategories = () => (
  <section id="courses" className="py-20 bg-muted/50">
    <div className="container mx-auto px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-14"
      >
        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
          Explore <span className="text-gradient-saffron">Knowledge Domains</span>
        </h2>
        <p className="text-muted-foreground max-w-xl mx-auto">
          From ancient Vedic sciences to cutting-edge technology — learn skills that make India self-reliant.
        </p>
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {categories.map((cat, i) => (
          <motion.div
            key={cat.name}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.05 }}
            className="bg-card rounded-xl p-6 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-elevated)] transition-shadow cursor-pointer group"
          >
            <div className={`w-12 h-12 rounded-lg ${cat.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
              <cat.icon className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-foreground mb-1">{cat.name}</h3>
            <p className="text-sm text-muted-foreground">{cat.count} courses</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default CourseCategories;
