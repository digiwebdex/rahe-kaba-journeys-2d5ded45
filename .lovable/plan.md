

## Role Permission System

### Overview
Extend the existing role system to support three admin-level roles -- **Admin**, **Manager**, and **Staff** -- each with different access to admin panel sections. The current `app_role` enum (`admin | user`) will be expanded to include `manager` and `staff`.

### Role Access Matrix

| Section | Admin | Manager | Staff |
|---------|-------|---------|-------|
| Dashboard | Yes | Yes | Yes |
| Bookings | Yes | Yes | Yes |
| Customers | Yes | Yes | Yes |
| Packages | Yes | Yes | No |
| Hotels | Yes | Yes | No |
| Payments | Yes | Yes | Yes |
| Due Alerts | Yes | Yes | Yes |
| Accounting | Yes | No | No |
| Reports | Yes | Yes | No |
| CMS | Yes | No | No |
| Settings | Yes | No | No |

### Implementation

#### 1. Database Migration -- Expand `app_role` enum
Add `manager` and `staff` to the existing `app_role` enum:
```sql
ALTER TYPE public.app_role ADD VALUE 'manager';
ALTER TYPE public.app_role ADD VALUE 'staff';
```

#### 2. New Hook: `src/hooks/useUserRole.ts`
A shared hook to fetch and cache the current user's role from `user_roles`:
- Returns `{ role, loading }` where `role` is `"admin" | "manager" | "staff" | null`
- Queries `user_roles` for the current session user
- Prioritizes roles: admin > manager > staff

#### 3. Update `src/components/admin/AdminLayout.tsx`
- Replace the current admin-only check with a check for any of `admin`, `manager`, or `staff`
- Pass the user's role down via React context so child components can access it
- Create `AdminRoleContext` with `useAdminRole()` hook

#### 4. Update `src/components/admin/AdminSidebar.tsx`
- Add a `roles` array to each menu item defining which roles can see it
- Filter `menuItems` based on the current user's role from context
- Example: `{ title: "Accounting", url: "/admin/accounting", icon: Calculator, roles: ["admin"] }`

#### 5. Update `src/pages/Auth.tsx`
- Expand the login redirect logic to check for `manager` and `staff` roles in addition to `admin`
- All three roles redirect to `/admin`

#### 6. Route Guards on Individual Pages
- Each admin page that is role-restricted will check the role from context
- If unauthorized, show an "Access Denied" message instead of the page content
- This prevents direct URL access to restricted pages

#### 7. Admin Settings: Role Management UI (Admin only)
- Add a section in `AdminSettingsPage.tsx` for admins to assign roles
- List users from `profiles` with their current role
- Allow admin to set a user's role to `admin`, `manager`, or `staff`
- Uses service-level RLS (existing `has_role` function ensures only admins can modify `user_roles`)

### Files Changed

| File | Action |
|------|--------|
| Database migration | Add `manager` and `staff` to `app_role` enum |
| `src/hooks/useUserRole.ts` | New -- shared role fetching hook |
| `src/components/admin/AdminLayout.tsx` | Update to accept manager/staff, add role context |
| `src/components/admin/AdminSidebar.tsx` | Filter menu items by role |
| `src/pages/Auth.tsx` | Redirect manager/staff to `/admin` |
| `src/pages/admin/AdminSettingsPage.tsx` | Add role management UI |

### Technical Notes
- The `has_role` security definer function already exists and works with the enum, so it will automatically support new enum values
- RLS policies using `has_role(auth.uid(), 'admin')` remain unchanged -- only admins can manage data. Manager/staff access is controlled at the UI/route level
- The `user_roles` table RLS only allows users to SELECT their own roles; INSERT/UPDATE/DELETE requires admin (handled via existing policies)
- To allow admins to manage roles, we need a new RLS INSERT/UPDATE policy on `user_roles` for admins, or use the existing `has_role` check
