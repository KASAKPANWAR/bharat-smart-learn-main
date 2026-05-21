import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import CourseCategories from "@/components/CourseCategories";
import FeaturedCourses from "@/components/FeaturedCourses";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";

const Index = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <HeroSection />
    <CourseCategories />
    <FeaturedCourses />
    <CTASection />
    <Footer />
  </div>
);

export default Index;
