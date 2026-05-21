import { BookOpen, Menu, X } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { clearSessionUser, hasSessionUser } from "@/lib/session";

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const signedIn = hasSessionUser();
  const links = [
    { label: "Courses", to: "/courses" },
    { label: "About", to: "/about" },
    { label: "Resources", to: "/resources" },
    { label: "Community", to: "/community" },
  ];

  const handleSignOut = () => {
    clearSessionUser();
    setOpen(false);
    navigate("/");
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg gradient-saffron flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-display text-xl font-bold text-foreground">स्वदेशी<span className="text-primary">Edu</span></span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {links.map((link) => (
            <Link key={link.label} to={link.to} className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
              {link.label}
            </Link>
          ))}
          {signedIn ? (
            <>
              <Link to="/profile" className="px-5 py-2 rounded-lg border border-border text-sm font-semibold text-foreground hover:border-primary hover:text-primary transition-colors inline-flex items-center justify-center">
                Profile
              </Link>
              <button onClick={handleSignOut} className="px-5 py-2 rounded-lg gradient-saffron text-primary-foreground font-semibold text-sm shadow-[var(--shadow-warm)] hover:opacity-90 transition-opacity inline-flex items-center justify-center">
                Sign out
              </button>
            </>
          ) : (
            <Link to="/login" className="px-5 py-2 rounded-lg gradient-saffron text-primary-foreground font-semibold text-sm shadow-[var(--shadow-warm)] hover:opacity-90 transition-opacity inline-flex items-center justify-center">
              Get Started
            </Link>
          )}
        </div>

        <button className="md:hidden text-foreground" onClick={() => setOpen(!open)}>
          {open ? <X /> : <Menu />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden bg-card border-b border-border overflow-hidden"
          >
            <div className="p-4 flex flex-col gap-3">
              {links.map((link) => (
                <Link key={link.label} to={link.to} className="text-sm font-medium text-muted-foreground py-2">
                  {link.label}
                </Link>
              ))}
              {signedIn ? (
                <>
                  <Link to="/profile" className="px-5 py-2 rounded-lg border border-border text-sm font-semibold text-foreground inline-flex items-center justify-center">
                    Profile
                  </Link>
                  <button onClick={handleSignOut} className="px-5 py-2 rounded-lg gradient-saffron text-primary-foreground font-semibold text-sm mt-2 inline-flex items-center justify-center">
                    Sign out
                  </button>
                </>
              ) : (
                <Link to="/login" className="px-5 py-2 rounded-lg gradient-saffron text-primary-foreground font-semibold text-sm mt-2 inline-flex items-center justify-center">
                  Get Started
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
