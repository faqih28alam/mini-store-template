# 🛒 mini-store-template

A modern, high-performance E-commerce starter kit built with the **Next.js App Router**, **Supabase**, and **Midtrans**. This template features real-time inventory updates, secure authentication, and a seamless checkout flow.

---

## 🚀 Tech Stack

### Frontend
- **Framework:** [Next.js 14 (App Router)](https://nextjs.org/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/)
- **State Management:** [Zustand](https://docs.pmnd.rs/zustand/) (Cart & Global State)
- **Form Handling:** [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/)

### Backend & Infrastructure
- **Database:** [PostgreSQL (Supabase)](https://supabase.com/)
- **Real-Time:** [Supabase Realtime](https://supabase.com/realtime) (WebSocket inventory sync)
- **Auth:** [Supabase Auth](https://supabase.com/auth)
- **Storage:** [Supabase Storage](https://supabase.com/storage) (Product Images)
- **Deployment:** [Vercel](https://vercel.com/)

### Payment & Notifications
- **Payment Gateway:** [Midtrans](https://midtrans.com/) (Snap Integration)
- **Emails:** [Resend](https://resend.com/)

---

## ✨ Features

- **Real-time Inventory:** Product stock updates instantly across all clients using Supabase Broadcast.
- **Optimistic Cart:** Smooth shopping experience powered by Zustand.
- **Secure Checkout:** Integrated with Midtrans Sandbox for safe payment testing.
- **Dynamic Routing:** SEO-friendly product pages and category filtering.
- **Admin Dashboard:** (Optional/Planned) Manage products and track orders.
- **Responsive Design:** Fully optimized for mobile, tablet, and desktop.

---

## 📸 Screenshots

---

## 🛠️ Getting Started

### 1. Clone the repository
```bash
git clone [https://github.com/your-username/mini-store-template.git](https://github.com/your-username/mini-store-template.git)
cd mini-store-template
```
### 2. Install dependencies
```bash
npm install
# or
bun install
```
### 3. Create Environment Variables
Create a .env.local file in the root directory and fill in your credentials:
```txt
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Midtrans
NEXT_PUBLIC_MIDTRANS_CLIENT_KEY=your_client_key
MIDTRANS_SERVER_KEY=your_server_key

# Resend
RESEND_API_KEY=your_resend_key
```
### 4. Database Setup
Run the SQL queries found in /supabase/migrations (or the SQL Editor) to set up:
```txt
Run the SQL queries found in /supabase/migrations (or the SQL Editor) to set up:
- products table
- orders table
- profiles table
- Row Level Security (RLS) policies
```
### 5. Run the development server
```bash
npm run dev
```

---

## 🤝 Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

--- 

