import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Download } from "lucide-react";
import { generateReceipt, CompanyInfo, InvoicePayment } from "@/lib/invoiceGenerator";

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [generatingId, setGeneratingId] = useState<string | null>(null);

  const fetchPayments = () => supabase.from("payments").select("*, bookings(tracking_id, total_amount, paid_amount, due_amount, num_travelers, created_at, status, package_id, user_id, packages(name, type, duration_days))").order("created_at", { ascending: false }).then(({ data }) => setPayments(data || []));
  useEffect(() => { fetchPayments(); }, []);

  const markPaid = async (id: string) => {
    const { error } = await supabase.from("payments").update({ status: "completed", paid_at: new Date().toISOString() }).eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Payment marked as completed");
    fetchPayments();
  };

  const handleReceipt = async (p: any) => {
    setGeneratingId(p.id);
    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, phone, passport_number, address")
        .eq("user_id", p.user_id)
        .maybeSingle();

      const { data: allPayments } = await supabase
        .from("payments")
        .select("*")
        .eq("booking_id", p.booking_id);

      const { data: cms } = await supabase
        .from("site_content" as any)
        .select("content")
        .eq("section_key", "contact")
        .maybeSingle();

      const cmsContent = (cms as any)?.content || {};
      const company: CompanyInfo = {
        name: "RAHE KABA",
        phone: cmsContent.phone || "",
        email: cmsContent.email || "",
        address: cmsContent.location || "",
      };

      const booking = p.bookings || {};

      await generateReceipt(
        p as InvoicePayment,
        { ...booking, packages: booking.packages },
        profile || {},
        company,
        (allPayments || []) as InvoicePayment[]
      );
      toast.success("Receipt downloaded");
    } catch {
      toast.error("Failed to generate receipt");
    }
    setGeneratingId(null);
  };

  return (
    <div>
      <h2 className="font-heading text-xl font-bold mb-4">All Payments</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-muted-foreground">
              <th className="pb-3 pr-4">Booking</th>
              <th className="pb-3 pr-4">#</th>
              <th className="pb-3 pr-4">Amount</th>
              <th className="pb-3 pr-4">Due Date</th>
              <th className="pb-3 pr-4">Status</th>
              <th className="pb-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((p: any) => (
              <tr key={p.id} className="border-b border-border/50">
                <td className="py-3 pr-4 font-mono text-xs">{p.bookings?.tracking_id || p.booking_id.slice(0, 8)}</td>
                <td className="py-3 pr-4">{p.installment_number || "—"}</td>
                <td className="py-3 pr-4 font-medium">৳{Number(p.amount).toLocaleString()}</td>
                <td className="py-3 pr-4">{p.due_date ? new Date(p.due_date).toLocaleDateString() : "—"}</td>
                <td className="py-3 pr-4">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${p.status === "completed" ? "text-emerald bg-emerald/10" : p.status === "pending" ? "text-primary bg-primary/10" : "text-destructive bg-destructive/10"}`}>
                    {p.status}
                  </span>
                </td>
                <td className="py-3">
                  <div className="flex items-center gap-3">
                    {p.status === "pending" && (
                      <button onClick={() => markPaid(p.id)} className="text-xs text-primary hover:underline">Mark Paid</button>
                    )}
                    {p.status === "completed" && (
                      <button
                        onClick={() => handleReceipt(p)}
                        disabled={generatingId === p.id}
                        className="inline-flex items-center gap-1 text-xs text-primary hover:underline disabled:opacity-50"
                      >
                        <Download className="h-3 w-3" />
                        {generatingId === p.id ? "..." : "Receipt"}
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {payments.length === 0 && <p className="text-center text-muted-foreground py-12">No payments yet.</p>}
    </div>
  );
}
