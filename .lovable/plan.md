

## Due Alert System

### Overview
Add a dedicated "Due Alerts" page in the admin panel that displays overdue and upcoming payments, and allows the admin to send payment reminders via SMS (using existing Bulk SMS BD integration) or WhatsApp (via `wa.me` deep link).

### Implementation

#### 1. New Admin Page: `src/pages/admin/AdminDueAlertsPage.tsx`

**Two tabs:**

**A. Overdue Payments**
- Payments where `status = 'pending'` and `due_date < today`
- Columns: Tracking ID, Customer Name, Phone, Installment #, Amount, Due Date, Days Overdue, Actions
- Sorted by most overdue first
- Summary card at top: total overdue count + total overdue amount

**B. Upcoming Installments**
- Payments where `status = 'pending'` and `due_date >= today` (next 30 days)
- Columns: Tracking ID, Customer Name, Phone, Installment #, Amount, Due Date, Days Until Due, Actions
- Sorted by soonest due first
- Summary card: upcoming count + total upcoming amount

**Actions per row:**
- "Send SMS" button -- calls a new edge function to send a reminder SMS
- "WhatsApp" button -- opens `https://wa.me/{phone}?text={encoded_message}` in a new tab with a pre-filled reminder message
- "Mark Paid" button -- updates payment status to completed

**Data fetching:**
```
payments: select("*, bookings(tracking_id, user_id, packages(name))")
  .eq("status", "pending")

profiles: select("full_name, phone, user_id")
```
Join payments to profiles via `user_id` in application code.

#### 2. New Edge Function: `supabase/functions/send-reminder/index.ts`

Sends a payment reminder SMS using the existing Bulk SMS BD integration (secrets `BULKSMSBD_API_KEY` and `BULKSMSBD_SENDER_ID` already configured).

**Input:** `{ phone, customer_name, tracking_id, amount, due_date, installment_number }`

**Message template:**
```
Dear {customer_name}, your installment #{installment_number} of ৳{amount} for booking {tracking_id} is due on {due_date}. Please make your payment at the earliest. Thank you!
```

**Auth:** Requires admin role -- validates JWT and checks `has_role` via service role client.

#### 3. Add Route + Sidebar Entry

**`src/App.tsx`:** Add route `<Route path="due-alerts" element={<AdminDueAlertsPage />} />` under `/admin`.

**`src/components/admin/AdminSidebar.tsx`:** Add menu item `{ title: "Due Alerts", url: "/admin/due-alerts", icon: AlertTriangle }` after Payments.

#### 4. Customer Dashboard Enhancement

**`src/pages/Dashboard.tsx`:** The existing "due" tab already shows overdue payments. No changes needed there.

### Files Changed

| File | Action |
|------|--------|
| `src/pages/admin/AdminDueAlertsPage.tsx` | New -- main due alerts page with overdue/upcoming tabs |
| `supabase/functions/send-reminder/index.ts` | New -- SMS reminder edge function |
| `supabase/config.toml` | Add `[functions.send-reminder]` with `verify_jwt = false` |
| `src/App.tsx` | Add due-alerts route |
| `src/components/admin/AdminSidebar.tsx` | Add Due Alerts menu item |

### Technical Notes

- SMS uses existing Bulk SMS BD credentials (already in secrets)
- WhatsApp uses the free `wa.me` deep link -- no API key needed, opens WhatsApp on admin's device with a pre-filled message
- Phone numbers from the `profiles` table are used for both SMS and WhatsApp
- The edge function validates that the caller is an admin before sending
- No new database tables needed -- all data comes from existing `payments`, `bookings`, and `profiles` tables
