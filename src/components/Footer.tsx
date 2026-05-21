import { BookOpen } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => (
  <footer className="bg-accent text-accent-foreground py-12">
    <div className="container mx-auto px-4">
      <div className="flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg gradient-saffron flex items-center justify-center">
            <BookOpen className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-display text-lg font-bold">स्वदेशी<span className="text-saffron">Edu</span></span>
        </div>
        <p className="text-sm text-accent-foreground/60">
          © 2026 स्वदेशीEdu. Empowering Atmanirbhar Bharat through Smart Education.
        </p>
        <div className="flex gap-6 text-sm text-accent-foreground/60">
          <Link to="/privacy" className="hover:text-saffron transition-colors">Privacy</Link>
          <Link to="/terms" className="hover:text-saffron transition-colors">Terms</Link>
          <Link to="/contact" className="hover:text-saffron transition-colors">Contact</Link>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
