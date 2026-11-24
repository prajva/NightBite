# 🌙 NightBite • University Hostel Night Mess PWA

> **Full-stack, mobile-first Progressive Web App (PWA)** designed specifically for a university hostel night mess operating strictly from **10:30 PM to 12:00 AM IST**. Built with Next.js 14 (App Router), TypeScript, Tailwind CSS, Firebase Auth, and Cloud Firestore.

---

## ⚡ Key Highlights & Architecture

### 1. Visual Aesthetic & Mobile-First UX
- **Theme:** Ultra-clean, dark-mode-first, late-night editorial interface:
  - OLED Pitch Black (`#09090B`) background
  - Elevated Zinc (`#18181B`) cards & surfaces
  - Crisp `1px solid #27272A` borders
- **Accent Hierarchy:**
  - ⚡ **Electric Amber (`#F59E0B`)**: Primary CTAs, active countdown timers, order tokens
  - 🟢 **Emerald (`#10B981`)**: Live stock available, order accepted, food ready for pickup
  - 🔴 **Crimson (`#EF4444`)**: Sold-out items, declined orders, expired windows
- **Typography:** Clean geometric sans-serif (`Inter` / `Geist`) with `tabular-nums` for live stock counters, prices in ₹, and countdown clocks.
- **Mobile Ergonomics:** Large thumb-friendly tap targets (`min-height: 48px`), sticky bottom checkout bar, and PWA install prompt ("Add to Home Screen").

---

### 2. Authentication & Security
- **University Student Domain Lock:**
  - Configurable via `NEXT_PUBLIC_ALLOWED_DOMAIN="vitapstudent.ac.in"`.
  - Rejects personal `@gmail.com` or non-university accounts with a high-contrast rejection banner.
- **Admin Counter Whitelist:**
  - Configurable via `NEXT_PUBLIC_ADMIN_EMAILS="messadmin@vitap.ac.in,admin@nightbite.ac.in"`.
- **Demo Role Switcher:**
  - One-click testing toggle between:
    - `Kavya S.` (Student: `kavya.21bce@vitapstudent.ac.in`)
    - `Rahul V.` (Roommate: `rahul.21bce@vitapstudent.ac.in`)
    - `Mess Counter Admin` (`messadmin@vitap.ac.in`)
    - `John Doe` (`john.doe@gmail.com` to test domain lock rejection banner)

---

### 3. Concurrency & Anti-Rush Engine
Solves the rush condition when multiple students order simultaneously:
1. **Unreserved Cart, Atomic Submit:** Adding items to cart does *not* hold stock. Stock is locked at the exact millisecond the student taps **"Request Order"** via atomic database transactions (`runTransaction`).
2. **Partial Stock Conflict Resolution:** If student requests 5 rolls, but another student locks 3 milliseconds earlier leaving only 2, the transaction rejects cleanly and displays an instant modal:
   > *"Stock just updated! Only 2 Paneer Rolls remain. Update cart to 2 and retry?"*
3. **No Artificial Per-User Cap:** Supports roommate mass orders (5–8 items) up to live available stock, with optional roommate note (e.g., *"Room 304 - 2 spicy"*).
4. **Ghost-Reservation Protection (Auto-Release Timer):**
   - Once Admin accepts, an automatic **180s (3-minute) countdown** begins (or **150s** for large orders of 4+ items).
   - If payment is not submitted before `00:00`, order auto-cancels (`EXPIRED`), reserved stock is instantly restored, and active users see a live toast: *"Stock just freed up!"*.
5. **Duplicate UTR Prevention:** Checks all submitted UPI 12-digit transaction numbers to block fake or duplicate receipts.

---

### 4. End-to-End Order State Machine
```
[ Cart (Unreserved) ]
         │
         ▼ (Atomic Lock)
[ PENDING_APPROVAL ] ──(Admin Declines with Reason Pill)──► [ DECLINED (Stock Released) ]
         │
         ▼ (Admin Accepts)
[ AWAITING_PAYMENT ] ──(180s Timer Expires)───────────────► [ EXPIRED (Stock Returned) ]
         │
         ▼ (Student Submits 12-digit UTR)
[ PAYMENT_VERIFYING ]
         │
         ▼ (Admin Confirms UTR)
[ PREPARING ] ──(Assigned Token # & 4-digit Pickup PIN)
         │
         ▼ (Admin Marks Ready)
[ READY_FOR_PICKUP ] ──(Phone Audio & Browser Alert)
         │
         ▼ (Admin Enters 4-digit PIN at Counter)
[ COMPLETED ]
```

---

### 5. PWA (Progressive Web App) Setup
- Installable manifest: [`public/manifest.json`](file:///c:/Users/Asus/OneDrive/Apps/Documents/MessApp/public/manifest.json)
- Service Worker: [`public/sw.js`](file:///c:/Users/Asus/OneDrive/Apps/Documents/MessApp/public/sw.js)
- Standalone display mode with offline app shell caching and Web Audio chimes.

---

## 🚀 Getting Started Locally

### 1. Clone or Open the Repository
```bash
git clone <your-repo-url>
cd MessApp
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```
*(The app works out of the box with zero external configuration using its built-in real-time synchronization engine!)*

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📦 Pushing to Your GitHub Repository

To push this codebase to your own GitHub account:

1. **Initialize Git (if not already initialized):**
   ```bash
   git init
   git add .
   git commit -m "feat: initial commit for NightBite University Mess PWA"
   ```

2. **Create a new repository on GitHub:**
   - Go to [github.com/new](https://github.com/new)
   - Name it `NightBite` or `night-bite-pwa`
   - Leave it empty (do not initialize with README or .gitignore since we already have them)

3. **Link and Push:**
   ```bash
   git branch -M main
   git remote add origin https://github.com/<YOUR_GITHUB_USERNAME>/NightBite.git
   git push -u origin main
   ```

---

## ☁️ Deploying to Vercel

1. Push your repository to GitHub as shown above.
2. Sign in to [Vercel](https://vercel.com) and click **"Add New Project"**.
3. Import your **NightBite** GitHub repository.
4. Add the following Environment Variables in Vercel project settings:
   - `NEXT_PUBLIC_ALLOWED_DOMAIN`: `vitapstudent.ac.in`
   - `NEXT_PUBLIC_ADMIN_EMAILS`: `messadmin@vitap.ac.in,admin@nightbite.ac.in`
   - *(Optional)* Firebase credentials (`NEXT_PUBLIC_FIREBASE_API_KEY`, etc.)
5. Click **Deploy**. Vercel will build and assign a global HTTPS production URL with automatic PWA support!

---

## 🛠️ Project Structure
```
├── public/
│   ├── manifest.json       # PWA manifest
│   ├── sw.js               # Service Worker
│   └── icons/              # Neon moon & bite icons (192, 512, maskable)
├── src/
│   ├── app/
│   │   ├── admin/page.tsx  # Direct admin counter tablet view
│   │   ├── globals.css     # OLED pitch black & high contrast styling
│   │   ├── layout.tsx      # PWA meta, AudioContext, Auth & Context Providers
│   │   └── page.tsx        # Responsive Student / Admin View
│   ├── components/
│   │   ├── ActiveOrderTracker.tsx # Pinned real-time order tracker & PIN
│   │   ├── AdminQueue.tsx         # Incoming queue, kitchen prep & digital ledger
│   │   ├── MenuGrid.tsx           # Category filters, live stock badges & cart
│   │   ├── Navbar.tsx             # Live IST mess status, hours modal & role switcher
│   │   ├── PwaInstallPrompt.tsx   # Add to Home Screen prompt
│   │   ├── RejectionBanner.tsx    # Domain restriction banner for @gmail.com
│   │   ├── StockConflictModal.tsx # Race-condition partial stock resolution
│   │   ├── StockFreedToast.tsx    # 180s auto-release stock freed toast
│   │   └── UpiPaymentSheet.tsx    # Mess UPI QR code & 12-digit UTR submit
│   ├── context/
│   │   ├── AuthContext.tsx        # Domain lock & demo switcher
│   │   └── NightBiteContext.tsx   # Global state, cart, orders & timers
│   ├── lib/
│   │   ├── firebaseConfig.ts      # Firebase Auth & Firestore setup
│   │   ├── initialMenu.ts         # Rolls, Maggi, Snacks & Drinks
│   │   ├── messHours.ts           # 10:30 PM - 12:00 AM IST logic & override
│   │   ├── orderService.ts        # Atomic submit, state machine & ghost timers
│   │   └── soundEffects.ts        # Web Audio API synthesizer for counter chimes
│   └── types/
│       └── index.ts               # Complete TypeScript types & order interfaces
├── .env.example
├── .gitignore
├── next.config.mjs
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```
