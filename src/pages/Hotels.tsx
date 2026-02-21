import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { Star, MapPin, Ruler } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import hotelFallback from "@/assets/hotel-makkah.jpg";

const Hotels = () => {
  const [hotels, setHotels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [cityFilter, setCityFilter] = useState("all");

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from("hotels")
        .select("*, hotel_rooms(id, price_per_night)")
        .eq("is_active", true)
        .order("star_rating", { ascending: false });
      setHotels(data || []);
      setLoading(false);
    };
    fetch();
  }, []);

  const cities = [...new Set(hotels.map((h) => h.city))];
  const filtered = cityFilter === "all" ? hotels : hotels.filter((h) => h.city === cityFilter);

  const getMinPrice = (hotel: any) => {
    const rooms = hotel.hotel_rooms || [];
    if (rooms.length === 0) return null;
    return Math.min(...rooms.map((r: any) => Number(r.price_per_night)));
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <span className="text-primary text-sm font-medium tracking-[0.3em] uppercase">Accommodation</span>
            <h1 className="font-heading text-3xl md:text-5xl font-bold mt-3 mb-4">
              Premium <span className="text-gradient-gold">Hotels</span>
            </h1>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Handpicked hotels near the Holy Haram for a comfortable and blessed stay
            </p>
          </motion.div>

          {/* City Filter */}
          {cities.length > 1 && (
            <div className="flex gap-2 justify-center mb-8 flex-wrap">
              <button
                onClick={() => setCityFilter("all")}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${cityFilter === "all" ? "bg-gradient-gold text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"}`}
              >
                All Cities
              </button>
              {cities.map((c) => (
                <button
                  key={c}
                  onClick={() => setCityFilter(c)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${cityFilter === c ? "bg-gradient-gold text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"}`}
                >
                  {c}
                </button>
              ))}
            </div>
          )}

          {loading ? (
            <div className="text-center py-20 text-muted-foreground">Loading hotels...</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">No hotels available yet. Check back soon!</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((hotel, i) => {
                const minPrice = getMinPrice(hotel);
                return (
                  <motion.div
                    key={hotel.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <Link
                      to={`/hotels/${hotel.id}`}
                      className="block bg-card border border-border rounded-xl overflow-hidden hover:border-primary/40 transition-all hover:shadow-gold group"
                    >
                      <div className="h-52 overflow-hidden">
                        <img
                          src={hotel.image_url || hotelFallback}
                          alt={hotel.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                      <div className="p-5">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h3 className="font-heading text-lg font-bold">{hotel.name}</h3>
                          <div className="flex items-center gap-0.5 flex-shrink-0">
                            {Array.from({ length: hotel.star_rating || 0 }).map((_, si) => (
                              <Star key={si} className="h-3.5 w-3.5 text-primary fill-primary" />
                            ))}
                          </div>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground mb-3">
                          <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {hotel.city}</span>
                          {hotel.distance_to_haram && (
                            <span className="flex items-center gap-1"><Ruler className="h-3.5 w-3.5" /> {hotel.distance_to_haram}</span>
                          )}
                        </div>
                        {hotel.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{hotel.description}</p>
                        )}
                        <div className="flex items-center justify-between">
                          {minPrice ? (
                            <p className="text-lg font-heading font-bold text-primary">
                              ৳{minPrice.toLocaleString()}<span className="text-xs font-body text-muted-foreground font-normal"> /night</span>
                            </p>
                          ) : (
                            <p className="text-sm text-muted-foreground">Contact for pricing</p>
                          )}
                          <span className="text-xs text-primary font-medium">View Details →</span>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Hotels;
