# 🌿 Thế Giới Cây Xanh — Admin Dashboard

The internal admin panel for the Thế Giới Cây Xanh plant e-commerce platform. Manage products, orders, inventory, and users through a data-dense dashboard UI.

**Dev URL:** `http://localhost:3002`  
**Requires:** Backend API running at `http://localhost:3001`

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Setup](#setup)
- [Environment Variables](#environment-variables)
- [Pages](#pages)
- [Key Patterns](#key-patterns)
- [Scripts](#scripts)

---

## Features

- **Authentication** — Email + password login; JWT stored in localStorage via Zustand persist; session restore on page load via refresh token
- **Dashboard Overview** — Revenue chart (7 / 30 / 90-day toggle), KPI cards (revenue, today's orders, active products, low-stock alerts), recent orders table, low-stock alert list
- **Product Management** — Full CRUD; multi-image upload with drag-to-reorder and primary-image selection; Vietnamese slug auto-generation (500ms debounce); category assignment; pricing (base + sale); stock; active toggle; search and filter with URL state
- **Category Management** — Hierarchical categories with parent assignment; inline editing
- **Order Management** — Filter by status, date range, customer, and payment method; one-click status transitions (Pending → Confirmed → Shipping → Delivered / Cancelled); CSV export of all orders
- **Inventory Management** — Stock levels with color-coded alerts (≤10 orange, 0 red); per-product adjustment dialog with absolute-value input and reason selection; adjustment history
- **User Management** — Searchable user list; ban/unban with reason; status badges
- **Notifications** — Bell icon with unread count badge; mark-as-read per item or bulk

---

## Tech Stack

| Concern | Library | Version |
|---------|---------|---------|
| Framework | Next.js (App Router) | ^16.2 |
| Language | TypeScript | ^5 |
| Styling | Tailwind CSS | ^4 |
| UI Components | shadcn/ui + Radix UI | latest |
| Icons | Lucide React | ^1.16 |
| Server State | TanStack Query | ^5.100 |
| Data Tables | TanStack Table | ^8.21 |
| Client State | Zustand | ^5.0 |
| HTTP Client | Axios | ^1.16 |
| Forms | React Hook Form + Zod | ^7.76 / ^4.4 |
| Charts | Recharts | ^3.8 |
| File Upload | React Dropzone | ^15.0 |
| Date Utilities | date-fns | ^4.1 |
| Toasts | Sonner | ^2.0 |

---

## Project Structure

```
admin/
├── app/
│   ├── (auth)/
│   │   └── login/page.tsx          # Login page (email + password)
│   │
│   ├── (dashboard)/
│   │   ├── layout.tsx              # Dashboard shell — Sidebar + Header + <main>
│   │   ├── page.tsx                # Dashboard overview
│   │   ├── products/
│   │   │   ├── page.tsx            # Product list with filters, status toggle, delete
│   │   │   ├── new/page.tsx        # Create product form
│   │   │   └── [id]/page.tsx       # Edit product form
│   │   ├── categories/page.tsx     # Category management
│   │   ├── orders/
│   │   │   ├── page.tsx            # Order list with filters and CSV export
│   │   │   └── [id]/page.tsx       # Order detail with status stepper
│   │   ├── inventory/page.tsx      # Inventory levels and adjustment
│   │   └── users/page.tsx          # User list with ban/unban
│   │
│   ├── layout.tsx                  # Root layout — QueryProvider, Sonner toaster
│   └── globals.css                 # Tailwind base + CSS custom properties
│
├── components/
│   ├── ui/                         # shadcn/ui auto-generated components
│   ├── layout/
│   │   ├── Sidebar.tsx             # Collapsible dark navigation sidebar
│   │   ├── Header.tsx              # Breadcrumb + notification bell + user menu
│   │   └── Breadcrumb.tsx
│   ├── shared/
│   │   ├── DataTable.tsx           # Generic TanStack Table wrapper with skeleton
│   │   ├── PageHeader.tsx          # Page title + action button slot
│   │   ├── ConfirmDialog.tsx       # shadcn AlertDialog for destructive actions
│   │   ├── StatusBadge.tsx         # Color-mapped status badge
│   │   ├── ImageUpload.tsx         # Dropzone + preview + drag-to-reorder
│   │   ├── Pagination.tsx
│   │   └── EmptyState.tsx
│   ├── dashboard/
│   │   ├── StatsCard.tsx           # KPI card with trend indicator
│   │   ├── RevenueChart.tsx        # Recharts AreaChart with period toggle
│   │   ├── RecentOrdersTable.tsx
│   │   └── LowStockAlert.tsx
│   ├── products/
│   │   ├── ProductForm.tsx         # Full product form (React Hook Form + Zod)
│   │   ├── ProductFilters.tsx      # Search + category + status filters
│   │   └── ProductImageManager.tsx # Image upload with drag-to-reorder
│   ├── orders/
│   │   ├── OrderFilters.tsx        # Date range, status tabs, search, payment method
│   │   ├── OrderStatusStepper.tsx  # Horizontal step indicator
│   │   └── OrderDetailCard.tsx
│   └── inventory/
│       └── StockAdjustmentDialog.tsx # Set new absolute stock value + reason
│
├── lib/
│   ├── api/
│   │   ├── client.ts               # Axios instance — Bearer token + 401 refresh interceptor
│   │   ├── auth.ts                 # login, logout, refresh
│   │   ├── products.ts
│   │   ├── categories.ts
│   │   ├── orders.ts
│   │   ├── inventory.ts
│   │   └── users.ts
│   ├── hooks/
│   │   ├── useProducts.ts          # TanStack Query — products + mutations
│   │   ├── useOrders.ts
│   │   ├── useInventory.ts
│   │   ├── useUsers.ts
│   │   ├── useDashboardStats.ts
│   │   └── useNotifications.ts
│   ├── stores/
│   │   └── authStore.ts            # Zustand — admin user + accessToken + admin-session cookie
│   ├── types/
│   │   ├── product.ts
│   │   ├── order.ts
│   │   ├── user.ts
│   │   └── common.ts
│   └── utils/
│       ├── formatCurrency.ts       # "1.200.000 ₫" VND formatter
│       ├── formatDate.ts           # "16/05/2025 14:30"
│       └── cn.ts
│
├── proxy.ts                        # Next.js 16 middleware — protects all (dashboard) routes
├── next.config.ts
└── .env.local
```

---

## Setup

### Prerequisites

- Node.js 18+
- Backend API running (`cd ../be && npm run dev`)
- Admin credentials configured in the backend `.env` (`ADMIN_EMAIL`, `ADMIN_PASSWORD`)

### 1. Install dependencies

```bash
cd admin
npm install
```

### 2. Configure environment variables

```bash
echo "NEXT_PUBLIC_API_URL=http://localhost:3001" > .env.local
```

### 3. Start the development server

```bash
npm run dev -- -p 3002
```

Open `http://localhost:3002` and log in with the credentials set in `be/.env` (`ADMIN_EMAIL` / `ADMIN_PASSWORD`).

> Run on port 3002 to avoid conflicting with the customer storefront on port 3000.

---

## Environment Variables

```env
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:3001
```

---

## Pages

| Route | Description |
|-------|-------------|
| `/login` | Admin login (email + password) |
| `/` | Dashboard — KPI cards, revenue chart, recent orders, low-stock list |
| `/products` | Product list — search, filters, status toggle, delete |
| `/products/new` | Create product |
| `/products/:id` | Edit product |
| `/categories` | Category management |
| `/orders` | Order list — filter, sort, CSV export |
| `/orders/:id` | Order detail — status stepper, customer info, items |
| `/inventory` | Inventory levels — search, stock adjustment dialog |
| `/users` | User list — search, ban/unban |

All dashboard routes are protected by `proxy.ts`. Unauthenticated requests are redirected to `/login?redirect=<path>`.

---

## Key Patterns

### Authentication

- Access token stored in Zustand with `persist` middleware (localStorage key: `admin-auth`).
- On `setAuth`, a lightweight `admin-session=1` cookie is also set so the Next.js edge middleware (`proxy.ts`) can protect routes — edge middleware cannot read localStorage.
- On `logout`, the cookie is cleared alongside the Zustand state.
- The Axios interceptor handles 401 responses by attempting a token refresh (`POST /auth/refresh`) and replaying the failed request. Auth endpoints are excluded from the interceptor to avoid redirect loops on wrong-password errors.

### Data fetching

All server state is managed with **TanStack Query**. Each resource has a dedicated hook in `lib/hooks/`:

```ts
// Typical hook pattern
export function useProducts(filters: ProductFilters) {
  return useQuery({
    queryKey: ['admin', 'products', filters],
    queryFn: () => productApi.list(filters),
    staleTime: 1000 * 60,
  })
}

export function useDeleteProduct() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => productApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'products'] })
      toast.success('Đã xóa sản phẩm')
    },
  })
}
```

### URL-based filter state

All list-page filters (search, status, dates, page) are stored in URL search params so they are bookmarkable and the browser back button works correctly.

Search inputs use a **400ms debounce** via `useEffect` + `useRef` to avoid a fetch on every keystroke. The `searchParams` object is held in a `ref` (not listed as a dependency) to prevent the debounce effect from re-triggering after each `router.push`.

### Forms

All create/edit forms use **React Hook Form** with **Zod** schemas for validation. Server-side field errors (e.g. slug already taken) are surfaced by calling `setError(fieldName, { message })` inside the `catch` block.

---

## Scripts

```bash
npm run dev      # Start dev server (add -- -p 3002 to avoid port conflict)
npm run build    # Build for production
npm start        # Start production server
npm run lint     # ESLint check
```
