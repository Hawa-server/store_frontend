# Project: Online Store Frontend (Final Project)

The React frontend for a small online **fashion and beauty store** (bags, makeup, skincare, jewellery, accessories, and perfumes), for a class final project. The **backend is a separate, finished project** in another folder. This project only builds the screens and talks to that backend.

## Source of truth

- **`docs/frontend-plan.md`** defines what to build, the rules, and the task order (FE0–FE10). Follow it exactly.
- **`docs/api.md`** defines how to talk to the backend. Use only the endpoints, fields, and errors it lists. Never invent endpoints or backend behavior. If something is missing, stop and tell me.
- Don't write backend code here, and don't change the backend project.

## Rules that always apply

- **Stack:** React, Vite, React Router, Tailwind CSS (official Vite plugin), and the Paystack popup (public key only). Don't add other libraries without asking.
- **If the plan and `docs/api.md` disagree, `docs/api.md` wins:** it describes the backend as actually built.
- **One shared API helper** for every request. It reads `VITE_API_URL` (normally empty, so requests go to `/api` on the same site through the Vite proxy or the `vercel.json` rewrite; never call the backend's address directly), sends cookies (`credentials: "include"`), and sends `X-Requested-With: XMLHttpRequest` on every request (the backend rejects changes without it).
- **The backend is in charge:** never calculate prices, totals, currency conversion, or refund amounts, and never treat a UI state (like the Paystack popup closing) as proof of anything.
- **Errors:** show the backend's `error.message`, and show `error.fields` next to their form inputs. On `401`, send the user to login and back afterwards; on `403`, show "You don't have access to this page."
- **Money** is always labelled "GH₵" or "US$," never a plain "$."
- **Secrets:** only `VITE_API_URL` and `VITE_PAYSTACK_PUBLIC_KEY` go in `.env`.
- **Images:** use the ImageKit URLs the backend returns for products, and the hero slide URLs from `docs/images.md` (copied into `src/config/heroSlides.js`), always with alt text and a smaller width setting; fall back to `/placeholder.jpg`. There's no image uploading in this project.
- **Admin pages:** only what FE7, FE8, and FE9 describe. No charts or extra widgets.
- **Design:** follow the **Design Guide** section of `docs/frontend-plan.md`: its colours, fonts, shapes, and components, defined as CSS variables and used through Tailwind's theme. No arbitrary hex values in class names, and no other colours or fonts.
- **Accessibility:** labels, keyboard access, visible focus, screen-reader announcements, and no colour-only meaning.
- **Every screen size:** build phone-first with Tailwind's breakpoints, following **Responsive Design** in the plan. Before finishing any task, check its pages at 390px (phone) and 1280px (laptop) widths, and tell me what you checked.
- **Light and dark themes:** every colour comes from the theme variables in **Light and Dark Themes**, so pages switch automatically. Never hardcode a colour that only works in one theme. Check each task's pages in both themes.

## Comments

Start each component with a short comment saying what it shows and which endpoints it uses. Explain non-obvious logic.

## How to work

1. Read the task in `docs/frontend-plan.md`, explain your plan briefly, and wait for my OK.
2. Build only that task.
3. Check every **Done when** item, tell me how to test it in the browser, and summarise what changed.
4. Stop. Don't start the next task until I say so.

## Commands

Fill these in during FE1:

- Start the app: `npm run dev`
- (The backend must also be running, from the `store-backend` folder.)