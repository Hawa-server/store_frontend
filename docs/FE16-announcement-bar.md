# FE16: Announcement Bar

An extra task: the screens for **BE30**. It is **separate from `docs/frontend-plan.md`**; follow `CLAUDE.md` and the plan's existing rules (Design Guide, light and dark themes, responsive design, the shared API helper, `docs/api.md` as the source of truth).

**Build this only after BE30 is done** and `docs/api.md` has been copied again from the backend project.

---

## The bar (shop pages)

- A thin full-width bar **above the header** on every **shop** page (not on admin pages).
- Loads `GET /api/announcement` once per visit. If the answer is `null`, or the request fails, **nothing is shown** (no error, no empty space).
- **Content:** the message as plain text (never as HTML) and, when there's a code, the code in a small **chip** with a **Copy code** button:
  > Use **WELCOME5** for 5% off your first order · [Copy code]
- **Copy code:** copies the code and briefly changes the button to "Copied" (announced to screen readers). If copying isn't allowed, select the code text instead.
- **Close (✕):** hides the bar, with the label "Close announcement". Remember the closed announcement's `id` in `localStorage` (wrapped in try/catch, working without it), so it stays closed on every page, and a **new** announcement (different `id`) appears again.
- **Look:** the theme's accent colour with text that passes contrast in both light and dark themes; one line on laptops; wraps neatly on phones (390px) without pushing the close button off screen. The ✕ and Copy buttons are at least 44px to tap.
- **Accessibility:** inside a `<section aria-label="Announcement">`, read once, never animated or flashing.

## Checkout helper

If the bar has a code and the shopper hasn't applied any code yet, the checkout's **"Have a discount code?"** box shows a small hint: "Use WELCOME5 from the announcement?" with an **Apply** button that fills the field and applies it. (The backend still checks it as usual.)

---

## Admin: announcement settings

On the **Discounts** page (`/admin/discounts`), above the codes list, an **Announcement bar** card:

- **Show announcement bar** switch.
- **Message** (5–120 characters, with a counter).
- **Discount code** (optional): a select of existing codes, showing each code's status in words, plus "No code".
- **Use suggested message** (shown when a code is selected): fills the message from the code's details, using the same wording as the discount form's preview line, starting with the code, for example "Use WELCOME5: 5% off, up to GH₵ 20.00, until 30 Dec 2026". The admin can edit it before saving. If the suggestion is longer than 120 characters, shorten it (drop "once per customer" first, then the minimum order).
- **End date** (optional; hidden when a code is linked, with the note "The code's own dates apply").
- **Live preview** of the bar exactly as shoppers will see it.
- **Save**. After saving, show the backend's state: "Showing on the shop now", or "Not showing: the linked code has expired" (the `isShowing` reason).
- Field errors from the backend appear under their fields.

---

## Done when

- [ ] With the bar switched on, every shop page shows the message and code; admin pages don't.
- [ ] Copy code works and is announced; closing hides the bar on every page until a new announcement is saved.
- [ ] When the bar is off, or its code stops working, nothing shows and no space is left.
- [ ] The checkout hint applies the announced code in one tap.
- [ ] The admin can edit the bar, fill the message from the code with "Use suggested message", see a live preview, and see why it isn't showing.
- [ ] Checked at 390px and 1280px, in light and dark, with the keyboard only; the build passes.
