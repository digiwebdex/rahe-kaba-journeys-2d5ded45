import { motion } from "framer-motion";
import { ArrowRight, Star } from "lucide-react";
import heroImage from "@/assets/hero-kaaba.jpg";

const HeroSection = () => {
  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img src={heroImage} alt="Holy Kaaba" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center pt-20">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="flex items-center justify-center gap-2 mb-6">
            <Star className="h-4 w-4 text-primary fill-primary" />
            <span className="text-primary text-sm font-medium tracking-[0.3em] uppercase">
              Trusted Since 2010
            </span>
            <Star className="h-4 w-4 text-primary fill-primary" />
          </div>

          <h1 className="font-heading text-4xl sm:text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Your Sacred Journey{" "}
            <span className="text-gradient-gold">Begins Here</span>
          </h1>

          <p className="text-lg md:text-xl text-foreground/70 max-w-2xl mx-auto mb-10 font-light leading-relaxed">
            Experience the pilgrimage of a lifetime with RAHE KABA Tours & Travels.
            Premium Hajj & Umrah packages from Chittagong, Bangladesh.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="#packages"
              className="bg-gradient-gold text-primary-foreground font-semibold px-8 py-4 rounded-md text-base hover:opacity-90 transition-opacity shadow-gold inline-flex items-center justify-center gap-2"
            >
              Explore Packages
              <ArrowRight className="h-5 w-5" />
            </a>
            <a
              href="#contact"
              className="border border-primary/40 text-foreground font-semibold px-8 py-4 rounded-md text-base hover:bg-primary/10 transition-colors inline-flex items-center justify-center"
            >
              Contact Us
            </a>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto"
        >
          {[
            { value: "15+", label: "Years Experience" },
            { value: "10K+", label: "Happy Pilgrims" },
            { value: "50+", label: "Packages" },
            { value: "4.9", label: "Rating" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-3xl md:text-4xl font-heading font-bold text-primary">{stat.value}</p>
              <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
