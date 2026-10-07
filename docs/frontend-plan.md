# Online Store Frontend — Final Project

## Project Overview

The React frontend for a small online **fashion and beauty store** selling bags, makeup, skincare, jewellery, accessories, and perfumes.

The **backend is a separate, finished project** in another folder. This frontend project only builds the screens and communicates with that backend.

---

## Source of Truth

Two documents control the frontend:

- `docs/frontend-plan.md` — defines **what we build** and the task order.
- `docs/api.md` — defines **how the frontend communicates with the backend**.

Use only the endpoints, fields, request formats, response formats, and errors documented in `docs/api.md`.

**Do not invent endpoints, fields, or backend behavior.**

If the frontend needs something missing from `docs/api.md`, stop and tell the user so it can be added to the backend project.

**If this plan and `docs/api.md` disagree about a field, endpoint, or error, `docs/api.md` wins,** because it describes the backend as it was actually built.

---

## The Finished Backend (Summary)

The backend is built, tested, and deployed. The details are in `docs/api.md`; the main facts:

- **Live API:** `https://adorn-api.onrender.com` (free plan: the first request after a quiet period can take up to a minute). Locally: `http://localhost:5000`.
- **Catalogue:** 41 products in 6 categories (Bags, Makeup, Skincare, Jewellery, Accessories, Perfumes), each with an ImageKit photo. Makeup Setting Spray is the low-stock demo product; Pearl Stud Earrings is out of stock.
- **Login:** `POST /api/auth/login` returns either `{ user }` or `{ requiresCode: true }` (when login codes are switched on). The code step uses `verify-code` and `resend-code`, and relies on a short-lived challenge cookie, so it must happen in the same browser.
- **Cart:** guests and logged-in shoppers both have carts (cookies). Quantities must be sent as JSON numbers; each line is capped at 99; capped changes return a `message` (for example, "Only 2 available."); lines can be `isAvailable: false`, and the cart has `hasUnavailableItems`.
- **Money:** every amount is a whole number. GHS fields (`…Ghs`) are in pesewas; USD fields (`…Usd`) are in US cents and are display-only. Checkout always charges GHS and includes a `chargeNote`.
- **Checkout:** `POST /api/checkout` returns an `accessCode` (for the Paystack popup) and an `authorizationUrl`. `POST /api/checkout/verify` can take up to about 20 seconds; it answers success (200), still pending (202), failed (402, with a `reason`), sold out after payment and refunded (409), or try again (503).
- **Orders:** confirmation pages use a private token (`/order/confirmation/:token`, valid for 30 days). My Orders includes `canCancel`, status history, and refunds.
- **Admin:** dashboard with a period choice (default `7d`), separate `lowStock` and `outOfStock` lists, full and partial refunds with retry, review hide/unhide/delete (each needs a reason), and the low-stock threshold (`{ "value": 8 }`).

---

# What to Build

Build **only** what is listed in `docs/frontend-plan.md`.

Work through the tasks **one at a time and in order**.

Do not write backend code here.

Do not modify the backend project.

Keep the implementation simple. Choose the simplest solution that satisfies each task's acceptance criteria.

Stretch features are only built if the user explicitly asks for them.

---

# Admin Scope

Admin functionality is limited to:

### FE7 — Admin Orders

- Orders list
- Status filtering
- Date-range filtering
- Order details
- Allowed status buttons
- Refund form
- Refund information

### FE8 — Admin Reviews

- Reviews moderation page
- Visible/Hidden filtering
- Hide review
- Unhide review
- Delete review
- Required moderation reasons

### FE9 — Admin Dashboard

- Revenue
- Orders
- Average order value
- Period selection
- Low-stock alerts
- Out-of-stock products
- Low-stock threshold
- Pending-order count
- Hidden-review count
- Recent orders (latest 5)
- Refund information (total refunded, failed refunds)
- Low-stock badge

### Do Not Build

- Charts
- Analytics pages
- Extra widgets
- Extra admin pages
- Any admin feature not explicitly listed in FE7, FE8, or FE9

---

# Stack

Use only:

- React (with `react-dom`)
- Vite
- React Router (`react-router-dom`)
- **Tailwind CSS**, using Tailwind's official Vite plugin (check Tailwind's docs for the current Vite setup)
- Paystack popup using the **public** key (loaded from Paystack's official inline script)

Claude Code installs all of these in FE1 (after asking permission for each command).

**Do not add other libraries without asking first.**

### Tailwind and the Design Guide

- The Design Guide's colours, fonts, and radii are defined **once** as CSS variables in the global stylesheet, and registered in Tailwind's theme, so each variable gets matching Tailwind classes (for example, `--color-accent` gives `bg-accent` and `text-accent`) that use exactly those values.
- Use only theme colours: **no arbitrary hex values** in class names (for example, never `bg-[#B24C3B]`), and no colours outside the Design Guide.
- Keep class lists readable: when the same long set of classes repeats (for example, the main button), make a small shared component instead of copying it.

---

# Rules That Always Apply

## API Requests

All API requests must use one shared API helper.

The helper must:

- Read `VITE_API_URL`. In development it's empty and requests go to `/api` on the Vite dev server, which proxies them to the backend; in production it's also empty, because the Render static site rewrites `/api/*` to the backend. So the browser always talks to one site, and the login and cart cookies are first-party (Safari blocks third-party cookies).
- Send cookies with every request, using `credentials: "include"`
- Send this header with **every** request:

```js
"X-Requested-With": "XMLHttpRequest"
```

The backend rejects any `POST`, `PATCH`, or `DELETE` without this header (403). It's the backend's protection against cross-site attacks, so every request must go through the helper.

- Send and receive JSON.
- Handle errors in one place, as described in **Error Handling**.

Do not create unnecessary direct API calls inside components.

---

## Backend Is the Source of Truth

The backend is authoritative for:

- Prices
- Subtotals
- Delivery fees
- Totals
- Currency conversion
- Stock
- Cart state
- Order state
- Payment status
- Refund status
- Review eligibility
- Permissions
- Validation errors

The frontend must not duplicate business rules that belong to the backend.

---

## Never Calculate Prices in the Browser

Never calculate:

- Product prices
- Cart subtotals
- Delivery fees
- Order totals
- Refund amounts
- Currency conversion

Display the values returned by the backend.

Money must be clearly labelled:

```text
GH₵ 250.00
```

or:

```text
US$ 16.47
```

Never display a plain `$`.

---

## Environment Variables

The frontend may contain only:

```env
VITE_API_URL=
VITE_PAYSTACK_PUBLIC_KEY=
```

Never put these in the frontend:

- Paystack secret keys
- ImageKit private keys
- Database credentials
- JWT secrets
- SMTP credentials
- Any backend secret

---

# Images

The store uses **ImageKit**, not Cloudinary.

The backend provides the product image URLs.

The frontend must:

- Use the ImageKit URLs returned by the backend. The only exception is the hero slider, whose three ImageKit URLs are listed in `src/config/heroSlides.js`.
- Never contain the ImageKit private key.
- Never generate or modify secure ImageKit URLs itself.
- Provide meaningful `alt` text.
- Fall back to `/placeholder.svg` if an image fails to load.

**Image uploads are not part of this project.** Product photos are uploaded through ImageKit's own website, and their URLs are added to the backend's seed data. There is no admin products page.

---

# Error Handling

Every backend error documented in `docs/api.md` should have a clear user-facing message.

The backend always returns errors in this shape:

```json
{
  "error": {
    "code": "INVALID_REQUEST",
    "message": "The request is invalid.",
    "fields": { "email": "Enter a valid email address." }
  }
}
```

- Show `message` to the user.
- When `fields` is present, show each message next to its matching form input.
- Use `code` to decide special handling (see **Session Expiry** below).

## Session Expiry

Logins last one day. When any request returns `401` (`UNAUTHENTICATED`) on a page that needs a login:

- Clear the logged-in user from the app's state.
- Send the user to the login page with the message: `Your session has ended. Please log in again.`
- After login, return them to the page they were on.

When a request returns `403` (`FORBIDDEN`), for example a non-admin opening an admin page, show a clear "You don't have access to this page" message. Never show admin data based on the frontend's guess.

Do not expose:

- Stack traces
- SQL errors
- Internal implementation details
- Secrets
- Tokens
- Debug information

Show loading states while waiting for API requests.

Disable important action buttons while requests are processing when necessary to prevent accidental duplicate actions.

---

# Accessibility

The frontend must be usable with a keyboard.

Use:

- Proper labels for form fields
- Semantic buttons and links
- Keyboard-accessible controls
- Visible focus states
- Appropriate accessible names
- Screen-reader announcements for important changes

Examples:

```text
Added to cart
```

```text
Order cancelled
```

```text
4 out of 5 stars
```

Do not rely on colour alone to communicate important information.

---

# Responsive Design

Every page must work well on **every screen size**, from small phones to large desktop monitors. Most shoppers in Ghana use phones, so **build phone-first**: design the small layout first, then add Tailwind's breakpoint prefixes (`sm:`, `md:`, `lg:`, `xl:`, `2xl:`) for larger screens.

## Sizes to test

Test every task at these widths (browser DevTools → device toolbar):

| Width | Example |
|---|---|
| 360px | Small Android phone |
| 390px | Typical phone |
| 768px | Tablet (portrait) |
| 1024px | Tablet (landscape) or small laptop |
| 1280px | Laptop |
| 1920px | Large desktop monitor |

## Layout rules

- **Content width:** on large screens, keep content within a centred maximum width (about 1280px), so lines and grids don't stretch across huge monitors.
- **Header:** phones show the logo, cart icon, and a "Categories" menu button; laptops and larger show the full category menu.
- **Product grid:** 2 columns on phones, 3 on tablets, 4 on laptops and larger.
- **Category tiles:** 2 per row on phones, 3 on tablets, all 6 in one row on large screens.
- **Hero slider:** the photo fills the whole banner on every size, with the text on top. Phones: about 600px tall, text at the bottom over a bottom-to-top dark gradient, headline about 44px. Larger screens: full page width, about 680px tall, text on the left over a left-to-right dark gradient, headline about 84px.
- **Product page:** the gallery sits above the details on phones, beside them on laptops.
- **Cart and checkout:** the order summary sits below the form on phones, beside it on laptops.
- **Admin:** on phones, the sidebar becomes a menu at the top; tables scroll sideways inside their own box (the page itself never scrolls sideways).
- **Touch targets:** every button and link is at least 44px tall on every size.
- **Images** never overflow their container, and use a suitable ImageKit width for the screen.
- **Text** stays readable: body text at least 16px, and no text cut off at any width.

Every task's **Done when** includes checking its pages at a phone width (390px) and a laptop width (1280px), in both light and dark themes; FE10 checks all six widths, in both themes, across the whole app.

---

# Design Guide

The approved design is on the design canvas: https://claude.ai/artifact/G8zaeoSbynvYV935R1K1AV (home, product, checkout, phone home, and admin dashboard). Build every page in this style. Pages not shown there (cart, login, orders, admin orders and reviews) follow the same colours, fonts, and components.

**The feel:** a calm, modern boutique. Lots of white space, large product photos, rounded corners, and very little clutter.

## Colours

Define these once as CSS variables in a global stylesheet, register them in Tailwind's theme, and use them everywhere through Tailwind classes. Never type hex values inside components.

| Variable | Hex | Use |
|---|---|---|
| `--color-bg` | `#FAF7F2` | Page background (ivory) |
| `--color-text` | `#1F1B16` | Main text, main buttons, footer, admin sidebar (charcoal) |
| `--color-surface` | `#FFFFFF` | Cards, form fields, order summary |
| `--color-accent` | `#B24C3B` | Links, cart badge, "Only X left" labels, small headings (rose clay) |
| `--color-accent-dark` | `#8E3A2C` | Link hover, low-stock text, error messages |
| `--color-gold` | `#B8893E` | Star ratings and rating bars only. **Never for text.** |
| `--color-text-body` | `#3F382F` | Longer body text (descriptions, reviews) |
| `--color-text-muted` | `#5E554B` | Secondary text (counts, dates, labels) |
| `--color-placeholder` | `#6B6157` | Photo placeholder captions |
| `--color-border` | `#E8E2D9` | Card borders and dividers |
| `--color-input-border` | `#D8CFC3` | Form field and dropdown borders |
| `--color-disabled` | `#F1ECE4` | Disabled button background |
| `--color-admin-bg` | `#F4F0EA` | Admin page background |
| `--color-admin-active` | `#3A332B` | Active admin menu item |

**Category tints** (soft backgrounds behind category photos, matched by category slug; any new category gets a neutral fallback of `#EFE9E0`):

| Slug | Hex |
|---|---|
| `bags` | `#E9DFD3` |
| `makeup` | `#F1DDD8` |
| `skincare` | `#DDE9E6` |
| `jewellery` | `#EFE6D2` |
| `accessories` | `#E3E4DC` |
| `perfumes` | `#EFE3EC` |

**Status colours** (always shown with the status word, never colour alone):

| Status | Background | Text |
|---|---|---|
| Pending | `#F9F1E3` | `#7A5A1E` |
| Shipped | `#E3ECF6` | `#244C75` |
| Delivered, Verified purchase | `#E6EFE3` | `#2F5A2A` |
| Cancelled | `#EFE9E0` | `#5E554B` |
| Low stock, Out of stock, errors | `#F6E3DF` | `#8E3A2C` |

## Light and Dark Themes

The store has a **light theme** (the colours above, shown on the design canvas) and a **dark theme**. Both use the same layout, fonts, and components; only the colours change.

### How the theme is chosen

- **First visit:** follow the device's setting (`prefers-color-scheme`), so phones already in dark mode open the store in dark.
- **Theme button:** a sun/moon button in the header (and in the admin sidebar) switches between light and dark. It's at least 44px, has a clear label ("Switch to dark theme" / "Switch to light theme"), and uses `aria-pressed`.
- **Remembered:** the shopper's choice is saved in the browser (`localStorage`) and used on every later visit, overriding the device setting.
- **No flash:** a tiny inline script in `index.html` sets `data-theme="light"` or `"dark"` on `<html>` **before** React loads, so a dark-theme shopper never sees a white flash.

### How it's built

- Every colour is a CSS variable (as above). The light values sit on `:root`; the dark values on `[data-theme="dark"]`. Because Tailwind's theme uses these variables, **every Tailwind colour class switches automatically**, with no `dark:` variants needed for colours.
- **Main buttons** use the text colour as their background and the background colour as their text, so they invert automatically (charcoal buttons in light, ivory buttons in dark).
- **Text on the accent colour** (the cart count badge, "Only X left" labels) is white in light and `#17130F` in dark, using an `--color-on-accent` variable, because white on the lighter dark-theme accent would be too faint.
- **Photos don't change.** Product and hero photos look the same in both themes; the hero's dark gradient and ivory text are already dark-friendly.
- Never hardcode a colour that only works in one theme.

### Dark theme colours

| Variable | Light | Dark | Use |
|---|---|---|---|
| `--color-bg` | `#FAF7F2` | `#17130F` | Page background |
| `--color-text` | `#1F1B16` | `#F3EEE6` | Main text; main button background |
| `--color-surface` | `#FFFFFF` | `#221D18` | Cards, form fields, order summary |
| `--color-accent` | `#B24C3B` | `#E07A66` | Links, cart badge, small headings |
| `--color-accent-dark` | `#8E3A2C` | `#F09A87` | Link hover, low-stock text, errors |
| `--color-gold` | `#B8893E` | `#D4A85A` | Stars and rating bars only |
| `--color-text-body` | `#3F382F` | `#DCD3C7` | Longer body text |
| `--color-text-muted` | `#5E554B` | `#B3A897` | Secondary text |
| `--color-placeholder` | `#6B6157` | `#9C907F` | Placeholder captions |
| `--color-border` | `#E8E2D9` | `#3A322A` | Card borders and dividers |
| `--color-input-border` | `#D8CFC3` | `#4A4036` | Form field borders |
| `--color-disabled` | `#F1ECE4` | `#2C261F` | Disabled buttons |
| `--color-admin-bg` | `#F4F0EA` | `#120F0C` | Admin page background |
| `--color-admin-active` | `#3A332B` | `#3A332B` | Active admin menu item |
| `--color-on-accent` | `#FFFFFF` | `#17130F` | Text on accent backgrounds (badges, labels) |

The footer and admin sidebar are charcoal (`#1F1B16`) in light and near-black (`#0F0C0A`) in dark.

**Dark category tints:** `bags` `#3A3026`, `makeup` `#3D2A2A`, `skincare` `#243532`, `jewellery` `#3A3322`, `accessories` `#2E302A`, `perfumes` `#352A33` (fallback `#2C261F`).

**Dark status colours** (background / text): Pending `#3A2F1A` / `#F0C977`; Shipped `#1D2C3D` / `#9CC4F0`; Delivered and Verified purchase `#1F3320` / `#9FD49A`; Cancelled `#2C261F` / `#B3A897`; Low stock, out of stock, and errors `#3D2420` / `#F2A193`.

### Checking both themes

- All text must meet WCAG contrast (4.5:1 for normal text) in **both** themes; adjust a dark value slightly if a check fails. (The dark values above were checked: every text pair is at least 5.6:1.)
- Focus outlines must be clearly visible in both themes.
- Every task's **Done when** includes checking its pages in light and dark (DevTools can switch the device setting: Rendering → "Emulate CSS media feature prefers-color-scheme").

## Fonts

Load from Google Fonts, each with a fallback:

- **Headings and the logo:** Cormorant Garamond (weights 500, 600, 700), falling back to `Georgia, serif`.
- **Everything else:** DM Sans (weights 400, 500, 600, 700), falling back to `system-ui, sans-serif`.

## Logo

The logo (mark and wordmark), its files, the favicon, and how to build it are described in **`docs/logo.md`**. Follow that file exactly.

## Shapes and spacing

- **Buttons:** fully rounded (pill-shaped). Main buttons are charcoal with ivory text; secondary buttons have a charcoal outline. At least 44px tall.
- **Cards and photos:** rounded corners (about 14–24px). Cards are white with a thin border.
- **Form fields:** white, rounded (about 10px), with a visible label above each one.
- **Spacing:** generous. Desktop pages have about 64px of side padding; phones about 16px.

## Key components

- **Hero slider:** a full-width photo banner with the text on top: a dark gradient behind the text, ivory headline and text, an ivory main button with charcoal text, an ivory-outline second button, and light controls (arrows, dots, Pause) below the buttons. See **Hero Slider** in FE1.
- **Header:** logo, category menu (links on laptops; a "Categories" button on phones), currency switch, account icon, and cart icon with a count badge.
- **Product card:** photo (with an "Only X left" or "Out of stock" label on top when needed), category, name, stars with the rating and count, price, and an "Add to cart" button.
- **Order summary:** a white box beside the checkout form, with the **GH₵ total charged** in large bold text.
- **Admin:** a charcoal left sidebar (Dashboard, Orders, Reviews), white cards, and plain tables.

# Component Comments

Start each component with a short comment explaining:

1. What the component displays.
2. Which backend endpoints it uses.

Example:

```jsx
// Displays the product list and loads products from GET /api/products.
```

Add comments for non-obvious logic.

Do not add unnecessary comments to obvious code.

---

# How We Work

## Before Each Task

Before starting a task:

1. Read the relevant task in `docs/frontend-plan.md`.
2. Briefly explain the implementation plan.
3. Wait for the user's **OK**.

Do not begin coding before the user approves the plan.

## During the Task

Build only that task.

Do not start the next task automatically.

Do not add unrelated features.

If something required by the task is missing from `docs/api.md`:

1. Stop.
2. Tell the user exactly what is missing.
3. Do not invent a workaround that changes the backend contract.

## After Each Task

When the task is complete:

1. Check every item in its **Done when** list.
2. Tell the user how to test it in the browser.
3. Summarise what changed.
4. Stop.

Wait for the user to explicitly tell you to continue.

---

# Frontend Task Order

```text
FE0 → FE1 → FE2 → FE3 → FE4 → FE5 → FE6 → FE7 → FE8 → FE9 → FE10
```

---

# FE0 — Before Starting

Before FE1:

- **The folder has these files** (Claude Code doesn't know anything else about the project):

```text
store-frontend/
├── CLAUDE.md
└── docs/
    ├── frontend-plan.md
    ├── images.md
    └── api.md        ← copied from store-backend/docs/api.md (the latest version)
```

  Optionally, add screenshots of the design canvas in `docs/design/` (for example, `home-desktop.png`, `product.png`, `checkout.png`, `admin-dashboard.png`), so Claude Code can compare its pages with the design.
- Make sure the backend project is finished and running locally.
- **Git:** run `git init`, commit these documents, connect the empty `store_frontend` GitHub repository, push `main`, then create and push a `dev` branch. (Claude Code creates `.gitignore` in FE1; check that `.env` is ignored before pushing again.)
- Have the Paystack **public test key** ready.
- Put the provided `placeholder.svg` (a cream image with a bag outline) in `public/placeholder.svg`. If the `public` folder doesn't exist yet, create it.
- Make sure the backend `.env` has `CLIENT_URL` matching this frontend's address.

Vite normally starts at:

```text
http://localhost:5173
```

---

# FE1 — Setup, Layout, and Products

## Build

Build:

- Vite + React setup
- React Router
- Tailwind CSS (official Vite plugin), with the **Design Guide** colours, fonts, and radii as CSS variables registered in Tailwind's theme, and the two fonts loaded
- The Vite proxy: `/api` → `http://localhost:5000` (see **Same-site setup**)
- `.env.example`
- Shared API helper
- Header (including the **logo** and the **theme button**)
- The favicon and home-screen icon links in `index.html`
- Footer
- **Light and dark themes:** the light and dark colour variables, the inline no-flash script in `index.html`, and the theme button (see **Light and Dark Themes**)
- Home page hero slider
- Product list page
- Category pages
- Product details page
- Not-found page

### `.env.example`

```env
VITE_API_URL=
VITE_PAYSTACK_PUBLIC_KEY=
```

### Same-site setup (required)

- **Development:** in `vite.config.js`, proxy `/api` to `http://localhost:5000`, and leave `VITE_API_URL` empty, so requests go to `/api` on the Vite server.
- **Production (Render static site):** add a rewrite rule from `/api/*` to `https://<backend>.onrender.com/api/*` (check Render's docs for rewriting to an external address), plus a rewrite from `/*` to `/index.html` so React Router's pages work on refresh. Leave `VITE_API_URL` empty.
- Never call the backend's `onrender.com` address directly from the browser.

### Header

Include:

- Store name as styled text
- Category menu
- Cart icon with count
- Login/account links

### Hero Slider (home page)

A slider at the top of the home page, matching the design canvas. It shows 3 slides, each with a wide photo, a small heading, a headline, a short sentence, and a button:

| Slide | Headline | Button |
|---|---|---|
| 1 | Everyday luxury, delivered across Ghana. | Shop new arrivals → `/` |
| 2 | Glow starts with good skin. | Shop skincare → `/category/skincare` |
| 3 | A scent to remember. | Shop perfumes → `/category/perfumes` |

The image URLs, alt text, and sentences for each slide are in **`docs/images.md`**. Copy them into `src/config/heroSlides.js` exactly.

- **Slide content lives in one file**, `src/config/heroSlides.js`: image URL (ImageKit), alt text, heading, headline, sentence, button text, and link. Changing a slide means editing only that file.
- **Layout:** each slide's photo **fills the whole hero** (CSS `object-fit: cover`), and the text sits **on top of the photo**, matching the design canvas.
  - **Desktop and tablet:** full page width, about 680px tall; text on the left, vertically centred, within the page's content width.
  - **Phones:** about 600px tall; text at the bottom.
- **Readability (required):** a dark gradient sits between the photo and the text: from the left on larger screens (charcoal at about 85% opacity, fading to clear across the banner), and from the bottom on phones. The headline and text are ivory (`#FAF7F2`), the small heading blush (`#F1DDD8`). The text must meet WCAG contrast (4.5:1) on every slide; if a photo is too light, strengthen the gradient.
- **Buttons and controls on the photo:** the main button is ivory with charcoal text; the second is an ivory outline. Arrows, dots, and Pause are light (ivory outlines, a translucent fill, ivory icons), each at least 44px.
- **Photo focus:** set each slide's focal point (CSS `object-position`) so the important part stays visible when cropped: the model's face for slide 1 (use ImageKit's face-focused crop as well), the face and jar for slide 2, and the bottle for slide 3.
- **Changing slides:** every 6 seconds, with a gentle fade.
- **Controls:** previous and next arrows, a dot for each slide (the current one wider and darker), and a Pause/Play button. Every control is at least 44px and has a label (for example, "Show slide 2 of 3").
- **Pausing:** it pauses while the pointer is over it or keyboard focus is inside it, and stays paused after the shopper presses Pause.
- **Reduced motion:** if the shopper's device is set to reduce motion, it doesn't change slides by itself.
- **Accessibility:** the slider has `aria-roledescription="carousel"` and a label, and each slide is announced as "Slide X of 3." Automatic changes aren't announced out loud; changes the shopper makes are.
- **Loading:** only the first slide's photo loads straight away; the others load afterwards (lazy loading), so the page stays fast.
- **No extra library.** Build it as a small React component.
- **Headline style:** Cormorant Garamond, semi-bold (600), about 84px on desktop and 48px on phones.

### Category Tiles (home page)

The home page shows one tile per category from `GET /api/categories`. Each tile's photo is the **main image of the first product in that category, alphabetically**, taken from the product list, so no extra category images are needed. If a category has no products with images, show its tint colour with the category name.

### Image Sizes

Follow the image size rules in **`docs/images.md`**.

### Product List

Each product shows:

- Main image
- Name
- Price
- Rating later when FE8 is implemented

### Product Details

Show:

- Name
- Description
- Price
- Category
- Main image
- Small clickable gallery
- Stock state
- Category link

Use the backend's stock information for labels such as:

- `Out of stock`
- `Only X left`

Unknown products show the friendly not-found page.

### Categories

The category menu is **loaded from the backend** (`GET /api/categories`), in the order it returns. It starts with `All products`, followed by the categories (currently Bags, Makeup, Skincare, Jewellery, Accessories, and Perfumes). Never hardcode the category list.

On laptops, categories appear across the top.

On phones, categories appear behind a `Categories` button.

The current category must:

- Be highlighted
- Be announced as the current page
- Work with a keyboard

### Category Page

Route:

```text
/category/:slug
```

Shows:

- Category name
- Product count
- Products alphabetically

If empty:

- Friendly message
- Link to all products

If unknown:

- Not-found page

## Done When

- [ ] The hero slider changes slides, pauses on hover, focus, and the Pause button, and doesn't move with reduced motion.
- [ ] The theme follows the device setting on first visit; the theme button switches it, the choice is remembered after a reload, and there's no white flash in dark mode.
- [ ] Every FE1 page looks right and readable in both light and dark themes.
- [ ] All 41 products show on the home page.
- [ ] Every product page works.
- [ ] Each category shows only its products, and the menu is loaded from the backend.
- [ ] Category menu works on a phone-sized screen.
- [ ] Product images use backend ImageKit URLs.
- [ ] Missing/broken images fall back to `/placeholder.svg`.

## Commands

```bash
npm run dev
```

The backend must also be running from the `store-backend` folder.

---

# FE2 — Accounts

## Build

Build:

- Register page
- Verify-email page
- Login page
- Login-code step when requested by the backend
- Logout

## Acceptance Criteria

After registration:

```text
Check your email to verify your account.
```

Verification:

- Reads the token from the link.
- Shows success or a clear error.
- Provides `Resend verification email`.

Login:

- Clearly explains when an email is not verified.
- If the backend requests a login code, show the code screen.
- Include `Resend code`.
- Disable resend for 60 seconds after each send.

When logged in:

- Header shows the user's name.
- Logout button is available.

## Done When

- [ ] Register works.
- [ ] Verification from the Ethereal email link works.
- [ ] Login works.
- [ ] Login-code flow works when enabled/requested by the backend.
- [ ] Logout works.
- [ ] An expired session sends the user to login, then back to where they were.

---

# FE3 — Cart

## Build

Build:

- Add to cart
- Cart count
- Cart page
- Quantity controls
- Remove functionality

## Acceptance Criteria

Add to cart:

- Disabled for out-of-stock products.
- Shows `Added to cart`.
- Announces the change to screen readers.
- Cannot be double-tapped while adding.

Cart page shows:

- Image
- Product name
- Price
- Quantity controls
- `+`
- `−`
- Number field
- Line total
- Remove button
- Backend subtotal

Backend messages such as `Only X available` must be shown clearly.

Quantity `0` removes the item. Pressing `−` at quantity `1` removes it.

Empty cart:

- Friendly message
- `Keep shopping` link

The guest cart must survive closing/reopening the browser and merge into the user's account after login.

## Done When

- [ ] Add works.
- [ ] Change quantity works.
- [ ] Remove works.
- [ ] Totals match the backend.
- [ ] Guest cart survives browser reopening.
- [ ] Guest cart merges after login.

---

# FE4 — Checkout and Mobile Money

## Build

Build:

- Checkout page
- Paystack popup

## Acceptance Criteria

Checkout form:

- Name
- Email
- Phone
- Address

Email should be filled in when logged in.

Show backend field errors clearly.

Order summary displays:

- Subtotal
- Delivery fee
- Total in GHS

The GHS total is the actual amount charged.

When the shopper selects mobile money:

1. Call the checkout endpoint.
2. Use the response to open the Paystack popup.
3. Use only the public Paystack key in the frontend.

While waiting:

```text
Check your phone to approve the payment.
```

After Paystack:

1. Receive the payment reference/callback information.
2. Call the backend verification endpoint.
3. Let the backend determine whether payment succeeded.
4. On success, go to the confirmation page.
5. On failure, timeout, or popup close, show a clear message.
6. Allow retry.

The frontend must not treat a Paystack popup callback alone as proof of payment.

### Backup page: `/checkout/complete`

The popup (using the `accessCode` from the checkout response) is the main path. On some phones, Paystack sends the shopper to a page instead: `/checkout/complete?reference=...`. That page must:

- Read `reference` from the address.
- Show "Confirming your payment…" and call `POST /api/checkout/verify` with it.
- On success, go to the order confirmation page; on failure, show the backend's message and a link back to the cart.
- If there's no reference, show the not-found page.

The cart remains unchanged until the backend successfully fulfills the payment.

## Done When

- [ ] Opening `/checkout/complete?reference=...` after a test payment verifies it and shows the confirmation.
- [ ] Successful test payment reaches the confirmation page.
- [ ] Failed test payment shows a clear error.
- [ ] Failed payment can be retried.

---

# FE5 — Order Confirmation

## Build

Build:

```text
/order/confirmation/:token
```

Load the order using the private confirmation token in the URL.

Show:

- Order number
- Items
- Delivery address
- Total paid

Invalid token:

- Not-found page

Refreshing shows the same order.

## Done When

- [ ] Successful payment opens the confirmation page.
- [ ] Confirmation information is correct.
- [ ] Order email appears in Ethereal.
- [ ] Refresh works.
- [ ] Invalid token shows not-found.

---

# FE6 — Currency

## Build

Add a GHS/USD selector to the header.

## Acceptance Criteria

- GHS is the default.
- USD uses amounts returned by the backend.
- Currency choice is remembered in the browser.
- Checkout clearly shows the GHS amount charged.
- USD is only a guide.

The frontend must not calculate its own exchange rate.

## Done When

- [ ] Switching to USD updates every supported price.
- [ ] Switching back to GHS works.
- [ ] Currency persists after reopening the browser.
- [ ] Checkout clearly shows the GHS amount charged.

---

# FE7 — Orders, Cancellation, and Admin Orders

## Shopper

Build:

- My Orders
- Order details
- Cancel order

### My Orders

Show newest first, 10 at a time.

Each order includes:

- Date
- Order number
- Items
- Total
- Status

Use friendly status labels such as:

```text
Pending: we're preparing your order
```

No orders:

- Friendly message

### Order Details

Show:

- Items
- Prices paid
- Address
- Payment method
- Status history
- Status dates

### Cancellation

Show cancel only for Pending orders.

Ask for confirmation.

After cancellation:

```text
Order cancelled
```

Show the backend-provided refund timing message.

The backend remains the authority even if the frontend hides the button for non-Pending orders.

## Admin Orders

Admin-only.

### Orders List

20 per page.

Show:

- Order number
- Date
- Customer
- Total
- Status
- Refund status

Filters:

- Status
- Date range
- Clear filters

If end date is before start date, show a clear validation message.

### Admin Order Details

Show:

- Items
- Contact details
- Address
- Payment reference
- Status history
- Refunds

Provide:

- Buttons for the next allowed status.
- Refund form.

Refund form:

- Full or partial
- Amount
- Required reason
- Left-to-refund amount

Disable the refund button while refunding.

Show backend errors clearly.

## Done When

- [ ] Shopper order list works.
- [ ] Shopper order details work.
- [ ] Admin can filter orders.
- [ ] Admin can mark an order Shipped.
- [ ] Shopper sees updated status/history.
- [ ] Admin can issue a partial refund.
- [ ] Refund information updates correctly.
- [ ] Pending orders can be cancelled.
- [ ] Shipped orders do not show a cancel button.

---

# FE8 — Reviews

## Shopper

Build reviews on product pages.

Show:

- Average rating, e.g. `4.3 out of 5`
- Review count
- Star breakdown
- Reviews 5 at a time
- Sort choice

Sort choices:

- Most recent
- Highest rated
- Lowest rated

No reviews:

```text
No reviews yet.
```

Each review shows:

- Stars
- Plain-text review
- First name
- Last initial
- Date
- `Verified purchase`

If the backend says the shopper can review:

- Show `Write a review`.

If the shopper already has one:

- Show `Edit your review`.
- Show `Delete review`.

Star selection must be keyboard accessible and announced as:

```text
4 out of 5 stars
```

If a shopper's review is hidden:

```text
Hidden by the store
```

## Product List Ratings

Show:

- Average rating
- Review count

Products without reviews show no stars.

## Admin Reviews

Admin-only.

Table:

- Product
- Reviewer
- Stars
- Text
- Date
- Status

20 per page.

Filters:

- Visible
- Hidden

Actions:

- Hide
- Unhide
- Delete

Hide requires a reason.

Delete requires:

- Reason
- Confirmation

Nothing more is added to the admin reviews page.

## Done When

- [ ] Delivered-order shopper can write a review.
- [ ] Shopper can edit a review.
- [ ] Shopper can delete a review.
- [ ] Average and count update.
- [ ] Sorting works.
- [ ] Star breakdown works.
- [ ] Admin can hide a review.
- [ ] Hidden review disappears from public results.
- [ ] Average changes when hidden.
- [ ] Admin can unhide a review.
- [ ] Admin can delete a review.

---

# FE9 — Admin Dashboard

## Build

Build:

```text
/admin
```

This is the admin home page.

Add a low-stock badge to the admin menu.

## Sales Summary

Show:

- Revenue
- Orders
- Average order value

Use GH₵.

Periods:

- Today
- Last 7 days
- Last 30 days
- All time

Default:

```text
Last 7 days
```

With no orders:

```text
GH₵ 0.00
0 orders
—
```

## Low-Stock Alerts

Show:

- Product
- Stock
- Threshold

Sort lowest stock first.

Out-of-stock products must be identified in words, not only colour.

With no alerts:

```text
All products are well stocked.
```

## Recent Orders

Show the 5 most recent orders (order number, date, customer, total, status), each linking to its admin order details page.

## Refund Information

For the selected period, show the total refunded, and the number of failed refunds needing attention (linking to `/admin/orders`). With none: `No refunds in this period.`

## Threshold

Show the current low-stock threshold.

Allow the admin to change it.

Show the backend's error message if invalid.

## Admin Counts

Show:

- Pending order count
- Hidden review count

Link them to:

```text
/admin/orders
/admin/reviews
```

## Admin Menu Badge

Show the number of low-stock products.

Hide the badge when there are none.

## Do Not Add

- Charts
- Extra widgets
- Analytics
- Additional dashboard sections

## Done When

- [ ] Sales summary changes correctly for each period.
- [ ] Sales summary matches the backend.
- [ ] Low-stock products appear.
- [ ] Out-of-stock products appear clearly.
- [ ] Threshold changes update the list.
- [ ] Pending-order count works.
- [ ] Hidden-review count works.
- [ ] Low-stock badge works.
- [ ] Recent orders link to their details pages.
- [ ] Refund information matches the backend for each period.
- [ ] Cancelling an order causes returned stock to be reflected.

---

# FE10 — Polish and Demo Preparation

Add the **home-screen app** (web app manifest), following **Home-Screen App** in `docs/logo.md`.

Check every page on:

- All six widths in **Responsive Design**
- **Both light and dark themes** (including the admin pages and every status colour)
- Keyboard-only navigation

Run the complete demo script.

Fix issues found.

Create `README.md` containing:

- What the app does
- Setup instructions
- `.env` example
- Requirement that the backend must be running

## Done When

- [ ] Demo script runs without errors.
- [ ] Responsive checks pass.
- [ ] Keyboard navigation checks pass.
- [ ] README is complete.

---

# Demo Script

## 1. Browse

As a guest:

- Browse by category.
- Open a product page.
- Show the product gallery.
- Navigate back to the category.
- Show low-stock labels.
- Show out-of-stock labels.

## 2. Cart

- Add a product.
- Add the same product again.
- Change quantity.
- Remove an item.

## 3. Guest Cart Persistence

- Close the browser.
- Reopen it.
- Show the cart is still there.

## 4. Account

- Register.
- Verify using the Ethereal email.
- Log in.
- If login-code authentication is enabled, enter the emailed code.
- Confirm the guest cart moved into the account.

## 5. Currency

- Switch to USD.
- Switch back to GHS.

## 6. Checkout

- First use a failing test payment.
- Then use a working test payment.
- Show the confirmation page.
- Show the email in Ethereal.

## 7. Admin Order Flow

As admin:

- Open dashboard.
- Show sales summary.
- Switch periods.
- Show low-stock alerts and badge.
- Open admin orders.
- Filter orders.
- Mark an order Shipped.
- Show the status email.
- Issue a partial refund.
- Show the refund email.

As shopper:

- Show updated order status.

## 8. Cancellation

- Place another order.
- Cancel the Pending order.
- Show dashboard.
- Confirm returned stock is reflected.

## 9. Reviews

As shopper:

- Write a review.
- Edit it.
- Delete it.
- Show sorting.
- Show star breakdown.

As admin:

- Hide a review.
- Show the average changing.
- Delete another review.

## 10. Product Plan

Open:

```text
docs/backlog.md
```

in the backend project.

---

# If Time Runs Out

Complete tasks in this order:

```text
FE1
FE3
FE4
FE5
FE2
FE7
FE8
FE9
FE6
```

Cut from the end first.

Do not cut core payment verification, API correctness, or backend business rules to save frontend time.

---

# Important Engineering Rules

## Backend Authority

The frontend must never assume that a UI state proves an operation succeeded.

For example, the frontend must not assume that:

- An admin-looking page means the user is an admin.
- Having an order ID means the user owns the order.
- Clicking Paystack means payment succeeded.
- Closing Paystack means payment failed or succeeded.
- Showing a review form means the user is eligible.
- Changing a UI value changes the database.

The backend remains authoritative.

---

## Payment Flow

```text
Frontend
   ↓
POST /api/checkout
   ↓
Backend creates Paystack transaction
   ↓
Frontend opens Paystack popup
   ↓
Customer completes payment
   ↓
Frontend receives payment reference/callback
   ↓
POST /api/checkout/verify
   ↓
Backend verifies payment with Paystack
   ↓
Backend creates the order
   ↓
Frontend opens confirmation page
```

A Paystack popup callback alone is never treated as proof of payment.

---

## Currency

GHS is authoritative.

The frontend displays backend-provided currency values.

The frontend does not independently calculate exchange rates.

At checkout, clearly show the actual GHS amount charged.

---

## Confirmation Security

Use:

```text
/order/confirmation/:token
```

with the backend's private confirmation token.

Do not expose or rely on sequential database IDs as confirmation secrets.

---

# Final Frontend Definition of Done

- [ ] FE1–FE10 completed as required.
- [ ] Every endpoint used exists in `docs/api.md`.
- [ ] No invented API behavior.
- [ ] All requests use the shared API helper.
- [ ] Cookies and the `X-Requested-With` header are sent with every request.
- [ ] Backend errors show `message`, and `fields` appear next to form inputs.
- [ ] Expired sessions (401) send the user to login and back again.
- [ ] No frontend secrets are exposed.
- [ ] Prices and totals come from the backend.
- [ ] GHS is clearly identified.
- [ ] USD is clearly identified when used.
- [ ] ImageKit URLs come from the backend.
- [ ] `/placeholder.svg` handles broken/missing images.
- [ ] Loading states exist.
- [ ] Backend errors are shown clearly.
- [ ] Forms are accessible.
- [ ] Keyboard navigation works.
- [ ] Important changes are announced to screen readers.
- [ ] Phone and laptop layouts work.
- [ ] Shopper authorization is enforced by the backend.
- [ ] Admin authorization is enforced by the backend.
- [ ] Payment success is confirmed by the backend.
- [ ] No unnecessary libraries were added.
- [ ] No backend code was written in this project.
- [ ] No backend project was modified.
- [ ] README is complete.
- [ ] Demo script runs successfully.

---

# Working Rule

**One task at a time.**

Before each task:

```text
Read task → Explain plan → Wait for OK
```

Then:

```text
Build → Test → Check Done When → Explain browser test → Summarize → Stop
```

Never start the next task until the user explicitly says to continue.