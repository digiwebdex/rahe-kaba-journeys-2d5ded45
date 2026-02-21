import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import logoImg from "@/assets/logo.jpg";

export interface CompanyInfo {
  name?: string;
  phone?: string;
  email?: string;
  address?: string;
}

export interface InvoiceCustomer {
  full_name?: string | null;
  phone?: string | null;
  passport_number?: string | null;
  address?: string | null;
}

export interface InvoiceBooking {
  tracking_id: string;
  total_amount: number;
  paid_amount: number;
  due_amount: number | null;
  num_travelers: number;
  created_at: string;
  status: string;
  packages?: { name: string; type?: string; duration_days?: number | null } | null;
}

export interface InvoicePayment {
  id: string;
  amount: number;
  installment_number: number | null;
  status: string;
  due_date: string | null;
  paid_at: string | null;
  payment_method: string | null;
  booking_id: string;
}

const fmt = (n: number) => `BDT ${n.toLocaleString()}`;
const fmtDate = (d: string | null) => d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—";

function loadLogoBase64(): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0);
      resolve(canvas.toDataURL("image/jpeg"));
    };
    img.onerror = () => resolve("");
    img.src = logoImg;
  });
}

function addHeader(doc: jsPDF, company: CompanyInfo, logoBase64: string) {
  const pageWidth = doc.internal.pageSize.getWidth();

  if (logoBase64) {
    try { doc.addImage(logoBase64, "JPEG", 14, 10, 20, 20); } catch { /* skip logo */ }
  }

  const textX = logoBase64 ? 38 : 14;
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text(company.name || "RAHE KABA", textX, 20);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text("Hajj & Umrah Services", textX, 26);

  const contactParts: string[] = [];
  if (company.phone) contactParts.push(`Phone: ${company.phone}`);
  if (company.email) contactParts.push(`Email: ${company.email}`);
  if (contactParts.length) doc.text(contactParts.join("  |  "), textX, 31);
  if (company.address) doc.text(company.address, textX, 36);

  doc.setDrawColor(200);
  doc.line(14, 40, pageWidth - 14, 40);

  return 46;
}

export async function generateInvoice(
  booking: InvoiceBooking,
  customer: InvoiceCustomer,
  payments: InvoicePayment[],
  company: CompanyInfo
) {
  const doc = new jsPDF();
  const logoBase64 = await loadLogoBase64();
  let y = addHeader(doc, company, logoBase64);
  const pageWidth = doc.internal.pageSize.getWidth();

  // Invoice title
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("INVOICE", 14, y);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(`Invoice #: ${booking.tracking_id}`, 14, y + 6);
  doc.text(`Date: ${fmtDate(new Date().toISOString())}`, pageWidth - 14 - 60, y + 6);
  y += 14;

  // Customer details
  doc.setDrawColor(230);
  doc.setFillColor(248, 248, 248);
  doc.rect(14, y, pageWidth - 28, 24, "F");
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("Bill To:", 18, y + 6);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(`Name: ${customer.full_name || "N/A"}`, 18, y + 12);
  doc.text(`Phone: ${customer.phone || "N/A"}`, 100, y + 12);
  doc.text(`Passport: ${customer.passport_number || "N/A"}`, 18, y + 18);
  doc.text(`Address: ${customer.address || "N/A"}`, 100, y + 18);
  y += 30;

  // Package details
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("Package Details", 14, y);
  y += 6;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  const pkg = booking.packages;
  doc.text(`Package: ${pkg?.name || "N/A"}  |  Type: ${pkg?.type || "N/A"}  |  Duration: ${pkg?.duration_days ? pkg.duration_days + " Days" : "N/A"}  |  Travelers: ${booking.num_travelers}`, 14, y);
  y += 4;
  doc.text(`Total Amount: ${fmt(Number(booking.total_amount))}`, 14, y);
  y += 8;

  // Payment schedule table
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("PAYMENT SCHEDULE", 14, y);
  y += 4;

  const sorted = [...payments].sort((a, b) => (a.installment_number || 0) - (b.installment_number || 0));

  autoTable(doc, {
    startY: y,
    head: [["#", "Amount", "Due Date", "Status", "Paid Date", "Method"]],
    body: sorted.map((p) => [
      p.installment_number || "—",
      fmt(Number(p.amount)),
      fmtDate(p.due_date),
      p.status.charAt(0).toUpperCase() + p.status.slice(1),
      fmtDate(p.paid_at),
      p.payment_method || "—",
    ]),
    styles: { fontSize: 8 },
    headStyles: { fillColor: [40, 46, 56] },
    margin: { left: 14, right: 14 },
  });

  y = (doc as any).lastAutoTable?.finalY || y + 20;
  y += 8;

  // Summary
  const totalPaid = Number(booking.paid_amount);
  const totalDue = Number(booking.due_amount || 0);
  const totalAmount = Number(booking.total_amount);

  doc.setFillColor(40, 46, 56);
  doc.rect(14, y, pageWidth - 28, 18, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text(`Total: ${fmt(totalAmount)}`, 18, y + 7);
  doc.text(`Paid: ${fmt(totalPaid)}`, 80, y + 7);
  doc.text(`Due: ${fmt(totalDue)}`, 140, y + 7);
  doc.setTextColor(0, 0, 0);

  doc.save(`Invoice_${booking.tracking_id}.pdf`);
}

export async function generateReceipt(
  payment: InvoicePayment,
  booking: InvoiceBooking,
  customer: InvoiceCustomer,
  company: CompanyInfo,
  allPayments?: InvoicePayment[]
) {
  const doc = new jsPDF();
  const logoBase64 = await loadLogoBase64();
  let y = addHeader(doc, company, logoBase64);
  const pageWidth = doc.internal.pageSize.getWidth();

  // Receipt title
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("PAYMENT RECEIPT", 14, y);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  const receiptNum = `${booking.tracking_id}-${payment.installment_number || "P"}`;
  doc.text(`Receipt #: ${receiptNum}`, 14, y + 6);
  doc.text(`Date: ${fmtDate(payment.paid_at || new Date().toISOString())}`, pageWidth - 14 - 60, y + 6);
  y += 14;

  // Customer
  doc.setFillColor(248, 248, 248);
  doc.rect(14, y, pageWidth - 28, 18, "F");
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("Received From:", 18, y + 6);
  doc.setFont("helvetica", "normal");
  doc.text(`${customer.full_name || "N/A"}  |  Phone: ${customer.phone || "N/A"}`, 18, y + 12);
  y += 24;

  // Payment details
  autoTable(doc, {
    startY: y,
    head: [["Description", "Details"]],
    body: [
      ["Booking ID", booking.tracking_id],
      ["Package", booking.packages?.name || "N/A"],
      ["Installment #", String(payment.installment_number || "—")],
      ["Amount Paid", fmt(Number(payment.amount))],
      ["Payment Date", fmtDate(payment.paid_at)],
      ["Payment Method", payment.payment_method || "Manual"],
    ],
    styles: { fontSize: 9 },
    headStyles: { fillColor: [40, 46, 56] },
    columnStyles: { 0: { fontStyle: "bold", cellWidth: 50 } },
    margin: { left: 14, right: 14 },
  });

  y = (doc as any).lastAutoTable?.finalY || y + 40;
  y += 8;

  // Running balance
  const paidPayments = (allPayments || []).filter((p) => p.status === "completed");
  const totalPaidSoFar = paidPayments.reduce((s, p) => s + Number(p.amount), 0);
  const remaining = Number(booking.total_amount) - totalPaidSoFar;

  doc.setFillColor(40, 46, 56);
  doc.rect(14, y, pageWidth - 28, 18, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text(`Total Paid So Far: ${fmt(totalPaidSoFar)}`, 18, y + 7);
  doc.text(`Remaining Due: ${fmt(Math.max(0, remaining))}`, 120, y + 7);
  doc.setTextColor(0, 0, 0);

  y += 26;
  doc.setFontSize(8);
  doc.setFont("helvetica", "italic");
  doc.text("This is a computer-generated receipt and does not require a signature.", 14, y);

  doc.save(`Receipt_${receiptNum}.pdf`);
}
