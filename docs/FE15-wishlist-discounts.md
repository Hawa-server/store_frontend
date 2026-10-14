# FE15: Wishlist and Discount Codes

An extra task with two parts. It is **separate from `docs/frontend-plan.md`**; follow `CLAUDE.md` and the plan's existing rules (Design Guide, light and dark themes, responsive design, the shared API helper, `docs/api.md` as the source of truth, the backend decides all money).

- **Part A (wishlist)** needs **BE28** done.
- **Part B (discount codes)** needs **BE29** done.

Copy `docs/api.md` again from the backend project before starting each part.

---

## Part A: Wishlist (BE28)

### The ♡ button

- On **product cards** (top-right corner of the photo) and on the **product page** (beside Add to cart).
- An outline heart when not saved, a filled heart when saved. The accessible name says what it does: "Save Black Canvas Tote Bag to wishlist" / "Remove … from wishlist", with `aria-pressed`.
- **Logged-in:** tapping saves or removes straight away (the heart changes immediately, and changes back with a message if the request fails). Announce "Saved to wishlist" / "Removed from wishlist".
- **Guests:** tapping opens a small prompt: "Log in to save products to your wishlist." with **Log in** (and back to this page afterwards).
- At least 44px to tap, and it never triggers the card's link underneath.
- After login, load `GET /api/wishlist/ids` once and keep it in a small `WishlistContext`, so every ♡ on the page knows its state without extra requests.

### Header

A ♡ **Wishlist** link beside the cart, with a count badge (hidden when 0), for logged-in shoppers.

### `/wishlist` page

- Title "Your wishlist" and the count.
- A grid of saved products (the usual product card) with the current price and stock label, a **Move to cart** button (adds 1, then removes it from the wishlist) and a **Remove** button.
- Unavailable products (inactive) show "No longer available" and only **Remove**. Out-of-stock ones show "Out of stock" and **Move to cart** is disabled.
- Empty: "Your wishlist is empty. Tap ♡ on any product to save it." with **Browse products**.
- `WISHLIST_FULL` shows the backend's message.
- Logged out: redirect to login, then back.

---

## Part B: Discount codes (BE29)

### Checkout

- Under the order summary: **"Have a discount code?"** which opens a field and an **Apply** button.
- **Apply** calls `POST /api/discounts/check`:
  - Success: show the code as a removable chip ("ADORN10 ✕") and a green line "You save GH₵ 24.00"; the summary gains a **Discount** line between Subtotal and Delivery, and the total updates (display only).
  - Error: the backend's message under the field ("This code has expired.").
- The code is sent with checkout as `discountCode`. If checkout returns `fields.discountCode` (for example, already used by this email), show the message under the field, remove the chip, and let the shopper continue without it.
- If the cart changes after applying, check the code again (the discount may change, or fall under the minimum).
- The amount actually charged is always the backend's total.
- Order confirmation, My Orders details and the admin order page show the **Discount** line when there is one.

### Admin: `/admin/discounts`

Add **Discounts** to the admin menu (after Delivery).

- **List:** code, type and value ("20% off, max GH₵ 50" / "GH₵ 20 off"), dates, "Used 12 / 100", and a status badge in words (**Active**, **Scheduled**, **Expired**, **Used up**, **Off**). Filter by status. 20 per page.
- **Create / edit form:** code (uppercased as typed), type (percent or fixed), value, optional cap, optional minimum order, optional start and end dates, optional usage limit, "Once per customer" (on by default), and Active. Money typed in GH₵ and converted to pesewas by reading the digits.
- A **preview line** explains the code in plain words: "20% off orders over GH₵ 200, at most GH₵ 50, once per customer, until 31 Oct."
- For a code that's been used, the code, type and value fields are read-only, with the note "This code has been used. Create a new code to change its discount."
- **Details:** the last 20 redemptions (order number linking to the order, email, discount, date).
- Switching a code off asks first: "Turn off ADORN10? Shoppers won't be able to use it."

---

## Done when

- [ ] Logged-in shoppers can save and remove products from cards and product pages; guests are asked to log in.
- [ ] The Wishlist page shows saved products with current prices, Move to cart, Remove, and clear unavailable/out-of-stock states.
- [ ] A valid code shows the saving and updates the summary; invalid codes show the backend's message; the charged total matches the backend.
- [ ] The discount line appears on the confirmation page, My Orders and admin orders.
- [ ] The admin can create, list, edit and switch off codes, with statuses in words and read-only values once used.
- [ ] Everything works with the keyboard, has visible labels, and is checked at 390px and 1280px, in light and dark; the build passes.
