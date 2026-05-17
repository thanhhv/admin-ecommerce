# Admin Dashboard — CLAUDE.md
**Stack:** Next.js 14 App Router + shadcn/ui + Tailwind CSS + TypeScript  
**Auth:** Email + Password (JWT — same backend, role: admin)  
**Project root:** `admin/` (standalone repo, sibling to `be/` and `client/`)

---

## IMPORTANT RULES FOR AGENT

- Always follow Clean Code principles: small focused components, descriptive names
- Use TypeScript strictly — no `any` types
- All API calls go through `lib/api/client.ts` (Axios instance)
- All server state via TanStack Query — no manual fetch in components
- All forms via React Hook Form + Zod validation
- Use shadcn/ui components first before writing custom UI
- Use `cn()` utility for all className merging
- Run `npm run build` and fix ALL errors before reporting phase done
- Run `npm run lint` and fix ALL warnings before reporting phase done
- Do NOT run dev server — just verify build passes

---

## Backend API Reference

```
Base URL: http://localhost:3000/api
Auth header: Authorization: Bearer <accessToken>
Admin routes prefix: /api/admin/*

Response format:
{
  success: true,
  data: <T>,
  message: "string",
  pagination: { page, limit, total, totalPages } | null
}

Error format:
{
  success: false,
  error: { code: "ERROR_CODE", message: "string", details: [] }
}
```

---

## Project Structure

```
admin/
├── app/
│   ├── (auth)/
│   │   └── login/
│   │       └── page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx                # Sidebar + Header shell
│   │   ├── page.tsx                  # Dashboard overview
│   │   ├── products/
│   │   │   ├── page.tsx              # Product list
│   │   │   ├── new/page.tsx          # Create product
│   │   │   └── [id]/page.tsx         # Edit product
│   │   ├── categories/
│   │   │   └── page.tsx
│   │   ├── orders/
│   │   │   ├── page.tsx              # Order list
│   │   │   └── [id]/page.tsx         # Order detail
│   │   ├── inventory/
│   │   │   └── page.tsx
│   │   └── users/
│   │       └── page.tsx
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── ui/                           # shadcn/ui (auto-generated)
│   ├── layout/
│   │   ├── Sidebar.tsx
│   │   ├── Header.tsx
│   │   └── Breadcrumb.tsx
│   ├── shared/
│   │   ├── DataTable.tsx             # Reusable TanStack Table wrapper
│   │   ├── PageHeader.tsx            # Title + action buttons
│   │   ├── ConfirmDialog.tsx         # Delete/action confirmation modal
│   │   ├── StatusBadge.tsx           # Colored status badge
│   │   ├── ImageUpload.tsx           # Dropzone + preview + upload
│   │   ├── Pagination.tsx
│   │   └── EmptyState.tsx
│   ├── dashboard/
│   │   ├── StatsCard.tsx
│   │   ├── RevenueChart.tsx          # Recharts AreaChart
│   │   ├── RecentOrdersTable.tsx
│   │   └── LowStockAlert.tsx
│   ├── products/
│   │   ├── ProductForm.tsx
│   │   ├── ProductFilters.tsx
│   │   └── ProductImageManager.tsx
│   ├── orders/
│   │   ├── OrderFilters.tsx
│   │   ├── OrderStatusStepper.tsx
│   │   └── OrderDetailCard.tsx
│   └── inventory/
│       └── StockAdjustmentDialog.tsx
├── lib/
│   ├── api/
│   │   ├── client.ts                 # Axios instance + interceptors
│   │   ├── auth.ts                   # login, logout, refresh
│   │   ├── products.ts
│   │   ├── categories.ts
│   │   ├── orders.ts
│   │   ├── inventory.ts
│   │   └── users.ts
│   ├── hooks/
│   │   ├── useProducts.ts
│   │   ├── useOrders.ts
│   │   ├── useInventory.ts
│   │   ├── useUsers.ts
│   │   └── useDashboardStats.ts
│   ├── stores/
│   │   └── authStore.ts              # Zustand: admin user + accessToken
│   ├── types/
│   │   ├── product.ts
│   │   ├── order.ts
│   │   ├── user.ts
│   │   └── common.ts
│   └── utils/
│       ├── formatCurrency.ts         # VND format: "1.200.000 ₫"
│       ├── formatDate.ts
│       └── cn.ts
└── middleware.ts                     # Redirect to /login if no token
```

---

## Design System

```css
/* globals.css — neutral professional palette for admin */
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --card: 0 0% 100%;
  --card-foreground: 222.2 84% 4.9%;
  --primary: 142 71% 25%;        /* Forest green — same brand as user site */
  --primary-foreground: 0 0% 98%;
  --secondary: 210 40% 96.1%;
  --muted: 210 40% 96.1%;
  --muted-foreground: 215.4 16.3% 46.9%;
  --accent: 24 95% 45%;          /* Terracotta accent */
  --border: 214.3 31.8% 91.4%;
  --sidebar-bg: 222 47% 11%;     /* Dark sidebar */
  --sidebar-text: 210 40% 96%;
  --sidebar-active: 142 71% 25%;
}
```

**Typography:** Inter (system-friendly, data-dense admin UI)
**Layout:** Dark sidebar (240px) + white content area
**Components:** shadcn/ui default styling, customized via CSS variables

---

## Phase 0 — Project Setup & Layout Shell

### Tasks
- [ ] Init Next.js 14: `npx create-next-app@latest . --typescript --tailwind --app --src-dir=false`
- [ ] Init shadcn/ui: `npx shadcn-ui@latest init` with custom theme above
- [ ] Install dependencies:
  ```
  npm install @tanstack/react-query @tanstack/react-table zustand axios
  npm install react-hook-form @hookform/resolvers zod
  npm install recharts sonner react-dropzone date-fns lucide-react
  npm install class-variance-authority clsx tailwind-merge
  ```
- [ ] Setup `globals.css` with CSS variables
- [ ] Setup `cn.ts` utility
- [ ] Setup `formatCurrency.ts` — output: "1.200.000 ₫"
- [ ] Setup `formatDate.ts` — output: "16/05/2025 14:30"
- [ ] Setup Zustand `authStore`:
  ```typescript
  interface AuthStore {
    admin: { id: string; name: string; email: string } | null
    accessToken: string | null
    setAuth: (admin, token) => void
    logout: () => void
  }
  ```
- [ ] Setup Axios `client.ts`:
  - baseURL from `NEXT_PUBLIC_API_URL` env
  - Request interceptor: attach `Authorization: Bearer <token>` from authStore
  - Response interceptor: on 401 → call `POST /api/auth/refresh` → retry → if fail, redirect `/login`
- [ ] Setup TanStack Query provider in root `layout.tsx`
- [ ] Setup Sonner `<Toaster />` in root layout
- [ ] Build `Sidebar` component:
  - Dark background (`sidebar-bg`)
  - Logo + app name at top
  - Nav items with icons (lucide-react):
    - Dashboard (LayoutDashboard)
    - Products (Package)
    - Categories (Tag)
    - Orders (ShoppingCart)
    - Inventory (Warehouse)
    - Users (Users)
  - Active state: green highlight
  - Collapsible to icon-only (toggle button)
  - User info + logout button at bottom
- [ ] Build `Header` component:
  - Breadcrumb (left)
  - Notification bell placeholder (right)
  - Admin avatar + name (right)
- [ ] Build `(dashboard)/layout.tsx` — Sidebar + Header + `<main>` content area
- [ ] Build `PageHeader` shared component: title (H1) + optional action button slot
- [ ] Build `ConfirmDialog` shared component: shadcn AlertDialog wrapper with confirm/cancel
- [ ] Build `StatusBadge` shared component: variant prop maps to color
- [ ] Build `EmptyState` shared component: icon + message + optional CTA button
- [ ] Build `Pagination` shared component: prev/next + page numbers
- [ ] Setup `middleware.ts`: protect all `/(dashboard)` routes → redirect `/login`
- [ ] Setup `.env.local`: `NEXT_PUBLIC_API_URL=http://localhost:3000`
- [ ] Run `npm run build` — fix all errors

---

## Phase 1 — Authentication

### API Endpoints
```
POST /api/auth/admin/login     body: { email, password }  → { accessToken, admin: { id, name, email } }
POST /api/auth/logout          header: Bearer token
POST /api/auth/refresh         cookie: refreshToken        → { accessToken }
```

### Tasks
- [ ] Build `lib/api/auth.ts`:
  ```typescript
  login(email: string, password: string): Promise<{ accessToken, admin }>
  logout(): Promise<void>
  refresh(): Promise<{ accessToken }>
  ```
- [ ] Build `/login` page:
  - Centered card layout, full screen height
  - Logo + "Admin Dashboard" title
  - React Hook Form + Zod:
    ```typescript
    const schema = z.object({
      email: z.string().email("Invalid email"),
      password: z.string().min(6, "Min 6 characters"),
    })
    ```
  - Email input, password input (show/hide toggle)
  - Submit button with loading spinner
  - Error message display (wrong credentials)
  - On success: store token + admin in authStore → redirect `/`
- [ ] Session restore on app load:
  - In root layout (client component): on mount, if no accessToken → silently call refresh → if success, restore session → if fail, stay on login
- [ ] Logout: clear authStore → call logout API → redirect `/login`
- [ ] Run `npm run build` — fix all errors

---

## Phase 2 — Dashboard Overview

### API Endpoints
```
GET /api/admin/dashboard/stats
→ {
    totalRevenueThisMonth: number,
    revenueChangePercent: number,      // vs last month
    totalOrdersToday: number,
    totalActiveProducts: number,
    lowStockCount: number
  }

GET /api/admin/orders?limit=10&sort=newest
GET /api/admin/inventory?lowStock=true&limit=5
```

### Tasks
- [ ] Build `useDashboardStats` hook (TanStack Query, staleTime: 5min)
- [ ] Build `StatsCard` component:
  - Props: title, value, change (%), icon, color variant
  - 4 cards: Revenue, Orders Today, Active Products, Low Stock Alerts
  - Green if change positive, red if negative
- [ ] Build `RevenueChart` component:
  - Recharts `AreaChart`, last 30 days
  - Gradient fill (green, low opacity)
  - Tooltip showing date + revenue (formatted VND)
  - Toggle buttons: 7 days / 30 days / 90 days
- [ ] Build `RecentOrdersTable` component:
  - Last 10 orders
  - Columns: Order ID, Customer, Total, Status badge, Time (relative: "2 hours ago")
  - Click row → navigate to `/orders/:id`
- [ ] Build `LowStockAlert` component:
  - List of products with stock ≤ 10
  - Product name + current stock (red if ≤ 5)
  - Link to inventory page
- [ ] Build dashboard `/` page — assemble all components above
- [ ] Run `npm run build` — fix all errors

---

## Phase 3 — Product Management

### API Endpoints
```
GET    /api/admin/products?page=1&limit=20&q=&categoryId=&isActive=&sort=
POST   /api/admin/products          body: CreateProductDTO
PUT    /api/admin/products/:id      body: UpdateProductDTO
DELETE /api/admin/products/:id
PATCH  /api/admin/products/:id/status   body: { isActive: boolean }

GET    /api/admin/categories
POST   /api/admin/categories        body: { name, slug, parentId? }
DELETE /api/admin/categories/:id

POST   /api/admin/upload/image      multipart/form-data → { url: string }
```

### Tasks

**Shared — DataTable component:**
- [ ] Build `DataTable` wrapper around TanStack Table:
  - Generic `<DataTable<T> columns rows isLoading />` 
  - Loading: skeleton rows (same height as real rows)
  - Empty state slot
  - Column visibility toggle (dropdown)
  - Checkbox column for bulk select (optional prop)

**Product List `/products`:**
- [ ] Build `useProducts(filters)` hook — TanStack Query with filter params
- [ ] Build `ProductFilters` component:
  - Search input (debounced 400ms, updates URL param)
  - Category select
  - Status tabs: All / Active / Inactive
  - All filters stored in URL search params
- [ ] Build `FilterChips` — active filters as removable pills
- [ ] Product list page with DataTable:
  - Columns: checkbox, image thumbnail (40x40), name+slug, category, base price, sale price, stock (red ≤5), status Switch, actions (Edit | Delete)
  - Status Switch: inline PATCH call, optimistic update
  - Delete: ConfirmDialog → DELETE call → invalidate query
  - Bulk actions bar (shown when rows selected): Activate / Deactivate / Delete
  - "New Product" button → `/products/new`

**Product Form `/products/new` and `/products/[id]`:**
- [ ] Build `ImageUpload` component:
  - react-dropzone, accept: image/*
  - Upload immediately on drop: POST /api/admin/upload/image
  - Show preview grid, loading spinner per image
  - Drag to reorder (CSS drag-and-drop, no library)
  - Mark primary image (star icon)
  - Delete image (X button)
- [ ] Build `ProductForm` component with sections:
  1. **Basic Info:** Name, Slug (auto-gen from name, editable), Brand, Category (select), Description (textarea)
  2. **Pricing:** Base Price (number input), Sale Price (optional), "On Sale" toggle
  3. **Inventory:** Stock quantity (number)
  4. **Images:** `ImageUpload` component
  5. **Status:** Active/Inactive toggle
- [ ] Zod schema for product form — all validations
- [ ] Slug auto-generation: watch `name` field → debounce 500ms → slugify → set `slug` field (user can override)
- [ ] Create page: POST on submit → toast success → redirect to `/products`
- [ ] Edit page: prefill form with existing data → PUT on submit → toast success
- [ ] Unsaved changes warning: `useBeforeUnload` hook

**Categories `/categories`:**
- [ ] Inline table: name, slug, parent category, actions (edit inline | delete)
- [ ] Add category form at top of page (inline, not modal)
- [ ] Delete: ConfirmDialog

- [ ] Run `npm run build` — fix all errors

---

## Phase 4 — Order Management

### API Endpoints
```
GET /api/admin/orders?page=&status=&from=&to=&q=&paymentMethod=
GET /api/admin/orders/:id
PUT /api/admin/orders/:id/status    body: { status: OrderStatus }
GET /api/admin/orders/export        → CSV file download
```

### OrderStatus enum
```typescript
type OrderStatus = 'PENDING' | 'CONFIRMED' | 'SHIPPING' | 'DELIVERED' | 'CANCELLED'
```

### Tasks

**Order List `/orders`:**
- [ ] Build `useOrders(filters)` hook
- [ ] Build `OrderFilters` component:
  - Date range picker (2 date inputs: from / to)
  - Status filter: Tab pills (All / Pending / Confirmed / Shipping / Delivered / Cancelled)
  - Search: order ID or customer name
  - Payment method filter: All / COD / Bank Transfer
  - All filters in URL params
- [ ] Order list DataTable:
  - Columns: Order ID (link), Customer name, Items count, Total (VND), Payment method badge, Status badge, Created at, Actions (View)
  - Status badge colors: Pending=yellow, Confirmed=blue, Shipping=purple, Delivered=green, Cancelled=red
- [ ] Export CSV button: GET /api/admin/orders/export → trigger file download

**Order Detail `/orders/[id]`:**
- [ ] Build `OrderStatusStepper` component:
  - Horizontal stepper: Pending → Confirmed → Shipping → Delivered
  - Current step highlighted green
  - Cancelled: show separate red badge, stepper grayed out
- [ ] Build order detail page layout:
  - Left column (2/3 width):
    - OrderStatusStepper
    - Status action button: context-aware
      - PENDING → "Confirm Order" button
      - CONFIRMED → "Mark as Shipping" button  
      - SHIPPING → "Mark as Delivered" button
      - DELIVERED / CANCELLED → no button
    - Cancel button (only if PENDING): ConfirmDialog with reason
    - Order notes section
    - Items table: image, product name, quantity, unit price, line total
    - Price summary: subtotal, shipping fee, total
  - Right column (1/3 width):
    - Customer info card: name, email, phone
    - Shipping address card
    - Payment method + status card
- [ ] Status update: PUT call → toast success → refetch order → stepper updates
- [ ] Run `npm run build` — fix all errors

---

## Phase 5 — Inventory Management

### API Endpoints
```
GET /api/admin/inventory?page=&lowStock=&q=
PUT /api/admin/inventory/:productId/adjust    body: { quantityChange: number, reason: string, notes?: string }
GET /api/admin/inventory/:productId/history
```

### Tasks
- [ ] Build `useInventory(filters)` hook
- [ ] Build inventory summary row: Total Products | In Stock | Low Stock | Out of Stock (from stats API)
- [ ] Build `StockAdjustmentDialog` component:
  - shadcn Dialog
  - Current stock display (read-only)
  - Quantity change input (+/- number, can be negative)
  - Live preview: "10 → 15" as user types
  - Reason select: Restock / Damage / Return / Manual / Other
  - Notes textarea (optional)
  - Submit → PUT call → toast → close dialog → refetch
- [ ] Inventory DataTable:
  - Columns: product image + name, category, stock (red if ≤10, bold red if 0), last adjusted date, "Adjust" button
  - Filter: search by product name, toggle "Low Stock only"
- [ ] Stock history tab per product (optional, in dialog):
  - Table: date, quantity change (+5 / -2), reason, admin name
- [ ] Run `npm run build` — fix all errors

---

## Phase 6 — User Management

### API Endpoints
```
GET /api/admin/users?page=&q=&status=
PUT /api/admin/users/:id/ban      body: { reason: string }
PUT /api/admin/users/:id/unban
```

### Tasks
- [ ] Build `useUsers(filters)` hook
- [ ] User list DataTable:
  - Columns: avatar + name, email, phone, registered date, orders count, status badge (Active/Banned), actions
  - Filter: search by name/email, status filter (All/Active/Banned)
- [ ] Ban flow:
  - Click "Ban" → ConfirmDialog with required reason textarea
  - PUT /api/admin/users/:id/ban → optimistic update status badge → toast
- [ ] Unban:
  - Click "Unban" → ConfirmDialog (no reason needed)
  - PUT /api/admin/users/:id/unban → optimistic update → toast
- [ ] Run `npm run build` — fix all errors

---

## Shared Patterns Reference

### TanStack Query hook pattern
```typescript
// lib/hooks/useProducts.ts
export function useProducts(filters: ProductFilters) {
  return useQuery({
    queryKey: ['admin', 'products', filters],
    queryFn: () => productApi.list(filters),
    staleTime: 1000 * 60,
  })
}

export function useUpdateProductStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      productApi.updateStatus(id, isActive),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'products'] })
      toast.success('Updated successfully')
    },
    onError: () => toast.error('Update failed'),
  })
}
```

### URL filter state pattern
```typescript
// Always sync filters to URL — shareable, back button works
const searchParams = useSearchParams()
const router = useRouter()

const filters = {
  q: searchParams.get('q') ?? '',
  status: searchParams.get('status') ?? 'all',
  page: Number(searchParams.get('page') ?? 1),
}

function updateFilter(key: string, value: string) {
  const params = new URLSearchParams(searchParams)
  params.set(key, value)
  params.set('page', '1') // reset page on filter change
  router.push(`?${params.toString()}`)
}
```

### Error handling
- API errors → `toast.error(error.response?.data?.error?.message ?? 'Something went wrong')`
- 401 → Axios interceptor handles silently (refresh or redirect)
- 403 → show "Access Denied" inline message
- Network error → toast with retry button

### Loading states
- Page-level data: skeleton loaders (not spinners) matching real content shape
- Mutations: `isPending` on Button → disabled + spinner inside button
- Optimistic updates for status toggles (instant feedback)

---

## Phase Summary

| Phase | Focus | Status |
|---|---|---|
| 0 | Setup, design system, sidebar layout, shared components | TODO |
| 1 | Login (email+password), JWT, session restore | TODO |
| 2 | Dashboard stats, revenue chart, recent orders | TODO |
| 3 | Product + Category CRUD, image upload | TODO |
| 4 | Order list, order detail, status management | TODO |
| 5 | Inventory monitoring, stock adjustment | TODO |
| 6 | User list, ban/unban | TODO |

---

## Dependencies

```json
{
  "next": "^14.x",
  "react": "^18.x",
  "typescript": "^5.x",
  "tailwindcss": "^3.x",
  "@tanstack/react-query": "^5.x",
  "@tanstack/react-table": "^8.x",
  "react-hook-form": "^7.x",
  "@hookform/resolvers": "^3.x",
  "zod": "^3.x",
  "zustand": "^4.x",
  "axios": "^1.x",
  "recharts": "^2.x",
  "sonner": "^1.x",
  "react-dropzone": "^14.x",
  "date-fns": "^3.x",
  "lucide-react": "latest",
  "class-variance-authority": "latest",
  "clsx": "latest",
  "tailwind-merge": "latest"
}
```

---

*Agent instruction: Read this entire file before writing any code. Start from Phase 0, complete each phase fully (build passes), then move to next. Mark each phase TODO → IN PROGRESS → DONE in your responses.*
~
