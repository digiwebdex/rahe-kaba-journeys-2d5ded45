import { useEffect, useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { ArrowLeft, Package, Users, CreditCard, Check } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Booking = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const packageId = searchParams.get("package");

  const [user, setUser] = useState<any>(null);
  const [pkg, setPkg] = useState<any>(null);
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [numTravelers, setNumTravelers] = useState(1);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Please sign in to book");
        navigate("/auth");
        return;
      }
      setUser(session.user);

      const [pkgRes, planRes] = await Promise.all([
        packageId
          ? supabase.from("packages").select("*").eq("id", packageId).eq("is_active", true).single()
          : Promise.resolve({ data: null }),
        supabase.from("installment_plans").select("*").eq("is_active", true).order("num_installments"),
      ]);

      setPkg(pkgRes.data);
      setPlans(planRes.data || []);
      setLoading(false);
    };
    init();
  }, [packageId, navigate]);

  const totalAmount = pkg ? Number(pkg.price) * numTravelers : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pkg || !user) return;

    setSubmitting(true);
    try {
      const { data: booking, error } = await supabase
        .from("bookings")
        .insert({
          user_id: user.id,
          package_id: pkg.id,
          total_amount: totalAmount,
          num_travelers: numTravelers,
          installment_plan_id: selectedPlan || null,
          notes: notes.trim() || null,
        })
        .select()
        .single();

      if (error) throw error;

      // Generate installment schedule if plan selected
      if (selectedPlan) {
        const plan = plans.find((p) => p.id === selectedPlan);
        if (plan) {
          await supabase.rpc("generate_installment_schedule", {
            p_booking_id: booking.id,
            p_total_amount: totalAmount,
            p_num_installments: plan.num_installments,
            p_user_id: user.id,
          });
        }
      }

      toast.success(`Booking created! Tracking ID: ${booking.tracking_id}`);
      navigate(`/track?id=${booking.tracking_id}`);
    } catch (err: any) {
      toast.error(err.message || "Booking failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center pt-32 text-muted-foreground">Loading...</div>
      </div>
    );
  }

  const inputClass = "w-full bg-secondary border border-border rounded-md px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40";

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <button onClick={() => navigate(-1)} className="text-sm text-muted-foreground hover:text-primary mb-6 inline-flex items-center gap-1">
            <ArrowLeft className="h-4 w-4" /> Back
          </button>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
            <span className="text-primary text-sm font-medium tracking-[0.3em] uppercase">Book Now</span>
            <h1 className="font-heading text-3xl md:text-4xl font-bold mt-3 mb-3">
              Complete Your <span className="text-gradient-gold">Booking</span>
            </h1>
          </motion.div>

          {!pkg ? (
            <div className="text-center py-12 bg-card border border-border rounded-xl">
              <Package className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
              <p className="text-muted-foreground mb-4">No package selected</p>
              <Link to="/packages" className="text-primary hover:underline">Browse Packages →</Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Package Summary */}
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="bg-card border border-border rounded-xl p-6">
                <h2 className="font-heading text-lg font-bold mb-4 flex items-center gap-2">
                  <Package className="h-5 w-5 text-primary" /> Package Details
                </h2>
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-heading font-bold text-lg">{pkg.name}</p>
                    <p className="text-sm text-muted-foreground capitalize">{pkg.type} • {pkg.duration_days} Days</p>
                  </div>
                  <p className="text-xl font-heading font-bold text-primary">৳{Number(pkg.price).toLocaleString()}<span className="text-xs font-body text-muted-foreground font-normal"> /person</span></p>
                </div>
              </motion.div>

              {/* Travelers */}
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
                className="bg-card border border-border rounded-xl p-6">
                <h2 className="font-heading text-lg font-bold mb-4 flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" /> Travelers
                </h2>
                <div className="flex items-center gap-4">
                  <label className="text-sm text-muted-foreground">Number of Travelers</label>
                  <input type="number" min={1} max={20} value={numTravelers}
                    onChange={(e) => setNumTravelers(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-24 bg-secondary border border-border rounded-md px-3 py-2 text-sm text-foreground text-center focus:outline-none focus:ring-2 focus:ring-primary/40" />
                </div>
                <div className="mt-4 p-4 bg-secondary/50 rounded-lg flex justify-between">
                  <span className="text-sm text-muted-foreground">Total Amount</span>
                  <span className="text-lg font-heading font-bold text-primary">৳{totalAmount.toLocaleString()}</span>
                </div>
              </motion.div>

              {/* Payment Plan */}
              {plans.length > 0 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
                  className="bg-card border border-border rounded-xl p-6">
                  <h2 className="font-heading text-lg font-bold mb-4 flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-primary" /> Payment Plan
                  </h2>
                  <div className="space-y-3">
                    <button type="button"
                      onClick={() => setSelectedPlan(null)}
                      className={`w-full text-left p-4 rounded-lg border transition-colors ${!selectedPlan ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"}`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm">Full Payment</p>
                          <p className="text-xs text-muted-foreground">Pay the full amount at once</p>
                        </div>
                        {!selectedPlan && <Check className="h-5 w-5 text-primary" />}
                      </div>
                    </button>
                    {plans.map((plan) => (
                      <button type="button" key={plan.id}
                        onClick={() => setSelectedPlan(plan.id)}
                        className={`w-full text-left p-4 rounded-lg border transition-colors ${selectedPlan === plan.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"}`}>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-sm">{plan.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {plan.num_installments} installments • ৳{Math.round(totalAmount / plan.num_installments).toLocaleString()}/month
                            </p>
                          </div>
                          {selectedPlan === plan.id && <Check className="h-5 w-5 text-primary" />}
                        </div>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Notes */}
              <div>
                <textarea placeholder="Special requests or notes (optional)" maxLength={500} rows={3}
                  value={notes} onChange={(e) => setNotes(e.target.value)}
                  className={`${inputClass} resize-none`} />
              </div>

              <button type="submit" disabled={submitting}
                className="w-full bg-gradient-gold text-primary-foreground font-semibold py-4 rounded-md text-sm hover:opacity-90 transition-opacity shadow-gold disabled:opacity-50">
                {submitting ? "Processing..." : `Confirm Booking — ৳${totalAmount.toLocaleString()}`}
              </button>
            </form>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Booking;
