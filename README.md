# Adorn: Online Store Frontend

The React frontend for **Adorn**, a small online fashion and beauty store in Ghana selling bags, makeup, skincare, jewellery, accessories and perfumes. Shoppers pay with mobile money through Paystack, and staff manage orders, refunds, reviews and stock in an admin area.

This project is only the frontend. It talks to the separate **store backend** (the `STORE-BACKEND` project), which must be running for the app to work.

## What the app does

**For shoppers**

- Browse all 41 products, by category, with a photo slider on the home page.
- Product pages with a photo gallery, stock labels ("Only 2 left", "Out of stock") and reviews.
- A cart that works without logging in, survives closing the browser, and merges into your account when you log in.
- Checkout in two steps: enter your details, see the exact GH₵ total (including delivery) from the backend, then pay with mobile money in the Paystack popup. Payment is only confirmed by the backend, never by the popup alone.
- An order confirmation page (from a private link), plus My Orders with order details, a status timeline, refunds, and cancelling Pending orders.
- Accounts: register, verify your email, log in (with a 6-digit login code when the backend asks for one), log out.
- Reviews for products you've received: write, edit and delete your own, with star ratings, sorting and a star breakdown.
- Prices in GH₵ or US$ (a guide only; payments are always charged in GH₵).
- Light and dark themes, following your device's setting until you choose.

**For admins** (at `/admin`, admin accounts only)

- Dashboard: revenue, orders, average order value and refunds for today, the last 7 or 30 days, or all time; recent orders; low-stock alerts with an adjustable threshold; and counts that need attention. A badge in the menu shows how many products are low or out of stock.
- Orders: filter by status and dates, view details, mark as shipped or delivered, cancel, and make full or partial refunds (with Retry for failed refunds).
- Products: search and filter every product with its stock, add products (with a photo address from ImageKit), edit prices, stock, details and photos, and hide products from the shop. Stock changes are protected: if a sale changes the stock while you're editing, you're asked to check the number again.
- Reviews: filter visible or hidden reviews, hide or unhide them (with a reason), or delete them permanently.

## Tech stack

- [React](https://react.dev/) 19 and [React Router](https://reactrouter.com/) 7
- [Vite](https://vite.dev/) 8
- [Tailwind CSS](https://tailwindcss.com/) 4 (official Vite plugin), with every colour, font and radius defined once as CSS variables in `src/index.css`
- [lucide-react](https://lucide.dev/) for icons
- [Paystack InlineJS](https://paystack.com/docs/developer-tools/inlinejs/) (loaded from Paystack's own script) for the mobile-money popup
- Fonts: Cormorant Garamond and DM Sans from Google Fonts
- Product photos are served by ImageKit, using the URLs the backend returns

## Getting started (local)

### What you need

- Node.js 20 or newer (built with Node 22)
- The backend project, set up and running locally on port 5000 (see its own README)
- A Paystack **test** public key (`pk_test_…`)

### 1. Install

```bash
npm install
```

### 2. Create `.env`

Copy `.env.example` to `.env` and fill in your Paystack public key:

```env
VITE_API_URL=
VITE_PAYSTACK_PUBLIC_KEY=pk_test_your_public_key
```

- Leave `VITE_API_URL` empty. In development, Vite forwards every `/api` request to `http://localhost:5000` (see `vite.config.js`), so the login and cart cookies belong to the same site as the app.
- Only the **public** key goes here. Never put a Paystack secret key or any other backend secret in this project.
- `.env` is listed in `.gitignore`; don't commit it.

### 3. Start the backend, then the frontend

**The backend must be running first.** In the `STORE-BACKEND` folder:

```bash
npm start
```

Then, in this folder:

```bash
npm run dev
```

Open http://localhost:5173. The backend's `CLIENT_URL` must be `http://localhost:5173`, so its links (email verification, order emails) point here.

### Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Starts the development server at http://localhost:5173 |
| `npm run build` | Builds the production site into `dist/` |
| `npm run preview` | Serves the built `dist/` folder locally to check it |

## Testing locally

### Local demo login

The backend's local seed data includes a demo shopper. **Use it only on your local setup:**

- Email: `ama.mensah@example.com`
- Password: `DemoShopper123`

This password is for the local database only. The deployed site must use its own accounts and passwords, which should never be written in this README. Admin logins are created from the backend's own settings and aren't listed here either.

### Rate limits

The backend limits how often some actions can be repeated from one IP address, for example 10 logins per 15 minutes and 5 registrations per hour (see the Auth section of `docs/api.md`). If you test repeatedly and see "Too many attempts. Please wait a while and try again.", wait for the window to pass.

### Emails

In development the backend sends its emails (verification links, login codes, order confirmations, shipping and refund notices) to **[Ethereal](https://ethereal.email/)**, a fake inbox for testing. Open the Ethereal inbox set up in the backend to read them and click their links.

### Test payments

Use your Paystack **test** keys. In the Paystack popup, use Paystack's test mobile-money numbers (listed in Paystack's test-payments documentation) to simulate successful and failed payments. This project was tested with `0551234987`.

### Demo script

1. **Browse:** open a category, a product page and its gallery; find the "Only X left" label (Makeup Setting Spray) and the "Out of stock" label (Pearl Stud Earrings).
2. **Cart:** add a product, add it again, change the quantity, remove it.
3. **Guest cart:** add something, close the browser, reopen it, and the cart is still there.
4. **Account:** register, open the verification email in Ethereal, log in (enter the emailed code if login codes are on), and check the guest cart moved into your account.
5. **Currency:** switch to US$ and back to GH₵.
6. **Checkout:** pay with a failing test payment first, then a working one; see the confirmation page and the email in Ethereal.
7. **Admin orders:** open the dashboard, switch periods, check the low-stock alerts and badge; filter orders, mark one Shipped (check the email), and make a partial refund (check the email). As the shopper, see the new status.
8. **Cancellation:** place another order, cancel it while it's Pending, and check the returned stock on the dashboard.
9. **Reviews:** write, edit and delete a review; try the sorting and star breakdown. As admin, hide one (the average changes) and delete another.

## Deploying to Vercel

The frontend is hosted on **Vercel**; the backend stays on **Render** (`https://adorn-api.onrender.com`).

1. In Vercel, **Add New → Project** and import this repository. Vercel detects Vite; keep its settings:
   - Framework preset: **Vite**
   - Build command: `npm run build`
   - Output directory: `dist`
2. **Before the first deploy**, open **Environment Variables** and add:
   - `VITE_PAYSTACK_PUBLIC_KEY` = your Paystack public key (`pk_test_…` for testing, `pk_live_…` when going live).
   - `VITE_API_URL` = leave empty, or don't add it at all.

   Vite writes `VITE_` variables into the build, so they must exist **before** building. If you add or change one later, redeploy for it to take effect.
3. **Deploy.** The rewrites in `vercel.json` are applied automatically:

   | Source | Destination | Why |
   |---|---|---|
   | `/api/:path*` | `https://adorn-api.onrender.com/api/:path*` | API requests go through the frontend's own address, so the login and cart cookies work in every browser (including Safari, which blocks cookies from other sites) |
   | `/(.*)` | `/index.html` | React Router's pages load when refreshed or opened from a link |

   Never call the backend's `onrender.com` address directly from the app. If the backend's address ever changes, update it in `vercel.json`.
4. **After the first deploy**, open the backend's settings on Render, change its `CLIENT_URL` to the frontend's live Vercel address (for example `https://adorn.vercel.app`), and redeploy the backend. This makes the backend accept requests from the live site and puts the right address in its emails (verification links, order links).

**Notes**

- Use the production address (the one set as `CLIENT_URL`) for testing. Vercel's preview deployments get their own addresses, which the backend won't recognise, so logins and checkout won't work there.
- On Render's free plan the backend sleeps when idle, so the first request after a quiet period can take up to a minute. Open `/api/health` on the live site before a demo to wake it up.

## Project structure

```text
public/                 placeholder image, logo, favicon, app icons, web app manifest
src/
  main.jsx, App.jsx     entry point and routes
  index.css             Tailwind, theme colours (light and dark), fonts, base styles
  config/heroSlides.js  the home page slides (images, text, links)
  lib/                  shared API helper, money and date formatting, Paystack loader
  context/              theme, auth, cart, currency, categories, screen-reader announcements, admin badge
  hooks/                data loading, countdowns, payment confirmation, page titles
  components/           layout, header, footer, buttons, forms, product cards, reviews, checkout, admin layout
  pages/                one file per page; admin pages in pages/admin/
docs/                   the frontend plan, the FE11 spec and the backend API reference
vercel.json             Vercel rewrites: /api/* to the backend, everything else to index.html
```

## Accessibility, screen sizes and themes

- Every page is built phone-first and checked at 360, 390, 768, 1024, 1280 and 1920px wide.
- Everything works with a keyboard, with visible focus outlines, a "Skip to content" link, labelled form fields, and screen-reader announcements for changes such as "Added to cart" or "Order cancelled".
- Text meets WCAG contrast in both themes, and status colours always come with words.
- The photo slider pauses on hover, keyboard focus or its Pause button, and doesn't move by itself if your device is set to reduce motion.

## Known limitations

- **Failed refunds for sold-out checkouts can't be retried from the admin pages yet.** When a shopper pays but an item sells out before the payment is confirmed, the backend refunds them automatically without creating an order. If that refund fails, it's counted in the dashboard's "Failed refunds", but it isn't attached to any order, so there's no Refunds section where an admin can press **Retry**. It has to be handled in the Paystack dashboard for now.
- The admin orders list can't be filtered to show only orders with failed refunds. To retry a failed refund on an order, open the order and use **Retry** in its Refunds section.
- There's no offline mode: the home-screen app still needs an internet connection.

## Photo credits

The hero and product photos are stock images. Some come from Freepik, whose licence requires a credit.

_The full credits list will be added here._
