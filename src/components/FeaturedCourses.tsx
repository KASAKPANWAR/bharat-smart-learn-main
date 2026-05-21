import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ArrowRight, Clock, Users, Star } from "lucide-react";
import { getCourses } from "@/lib/api";
import { getSessionUser } from "@/lib/session";

const FeaturedCourses = () => {
  const user = getSessionUser();
  const { data } = useQuery({
    queryKey: ["featured-courses", user.id],
    queryFn: () => getCourses(user.id),
  });

  const featuredCourses = data?.courses.slice(0, 4) ?? [];

  return (
  <section className="py-20">
    <div className="container mx-auto px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-14"
      >
        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
          Featured <span className="text-gradient-saffron">Courses</span>
        </h2>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Handpicked learning tracks designed to feel structured, credible, and worth coming back to.
        </p>
      </motion.div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {featuredCourses.map((course, i) => (
          <motion.div
            key={course.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="bg-card rounded-xl overflow-hidden shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-elevated)] transition-all group cursor-pointer"
          >
            <div className="h-36 relative flex items-center justify-center overflow-hidden">
              <img src={course.thumbnail} alt={course.title} className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-black/10" />
              <span className="absolute top-3 right-3 px-2.5 py-0.5 rounded-full bg-card/90 text-xs font-semibold text-foreground">
                {course.recommended ? "Popular" : course.enrolled ? "Owned" : "Featured"}
              </span>
            </div>
            <div className="p-5">
              <p className="text-xs font-semibold text-primary mb-1">{course.category}</p>
              <h3 className="font-semibold text-foreground mb-3 group-hover:text-primary transition-colors">
                {course.title}
              </h3>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{course.lecture_count} lectures</span>
                <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />Structured track</span>
                <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5 text-gold fill-gold" />{course.recommended ? "For you" : "New"}</span>
              </div>
              <div className="mt-4 flex gap-3">
                <Link to={`/courses/${course.id}`} className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline">
                  Preview <ArrowRight className="h-4 w-4" />
                </Link>
                <Link to={`/checkout/${course.id}`} className="text-sm font-semibold text-foreground/80 hover:text-primary">
                  Checkout
                </Link>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
  );
};

export default FeaturedCourses;
