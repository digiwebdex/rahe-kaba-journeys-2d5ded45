import { motion } from "framer-motion";
import { Plane, Building2, Bus, MapPin, BookOpen, CreditCard, Globe, Users } from "lucide-react";
import { useSiteContent } from "@/hooks/useSiteContent";

const iconMap: Record<string, any> = { BookOpen, Globe, CreditCard, Plane, Building2, Bus, MapPin, Users };

const defaultServices = [
  { icon: "BookOpen", title: "Hajj", desc: "Complete Hajj packages with expert guidance and spiritual support" },
  { icon: "Globe", title: "Umrah", desc: "Year-round Umrah packages for individuals, families and groups" },
  { icon: "CreditCard", title: "Visa", desc: "Hassle-free visa processing for Saudi Arabia and beyond" },
  { icon: "Plane", title: "Air Ticket", desc: "Best-price airline tickets with flexible booking options" },
  { icon: "Building2", title: "Hotel", desc: "Premium hotels near Haram with stunning views" },
  { icon: "Bus", title: "Transport", desc: "Comfortable ground transportation throughout your journey" },
  { icon: "MapPin", title: "Ziyara", desc: "Guided tours to all historical and sacred sites" },
  { icon: "Users", title: "Guide", desc: "Experienced multilingual guides for a seamless experience" },
];

const ServicesSection = () => {
  const { data: content } = useSiteContent("services");

  const sectionLabel = content?.section_label || "What We Offer";
  const heading = content?.heading || "Our";
  const headingHighlight = content?.heading_highlight || "Services";
  const description = content?.description || "Comprehensive travel services to make your sacred journey comfortable and memorable";
  const items = content?.items || defaultServices;

  return (
    <section id="services" className="py-24 islamic-pattern">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-primary text-sm font-medium tracking-[0.3em] uppercase">{sectionLabel}</span>
          <h2 className="font-heading text-3xl md:text-5xl font-bold mt-3 mb-4">
            {heading} <span className="text-gradient-gold">{headingHighlight}</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">{description}</p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map((service: any, i: number) => {
            const IconComp = iconMap[service.icon] || Globe;
            return (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group bg-card border border-border rounded-lg p-6 hover:border-primary/40 transition-all duration-300 hover:shadow-gold"
              >
                <div className="w-12 h-12 rounded-md bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <IconComp className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-heading text-lg font-semibold mb-2">{service.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{service.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
