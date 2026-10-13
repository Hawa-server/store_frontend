# FE12: Delivery Areas and Linked Guest Orders

An extra task, added after the presentation (teacher's feedback). It covers the screens for two backend tasks:

- **BE24:** delivery fees by region and town (checkout, order pages, and an admin page to set fees).
- **BE25:** guest orders and carts linked to a new account (a message after verifying or logging in).

It is **separate from `docs/frontend-plan.md`**; follow `CLAUDE.md` and the plan's existing rules (Design Guide, light and dark themes, responsive design, the shared API helper, `docs/api.md` as the source of truth).

**Build this only after BE24 and BE25 are done** and `docs/api.md` has been copied again from the backend project.

---

## Part A: Delivery areas (BE24)

### Checkout

Add a **Delivery area** section above the address field:

| Field | Input | Notes |
|---|---|---|
| Region | Select, from `GET /api/delivery-areas` | Required: "Choose a delivery region." |
| Town | Select, the chosen region's towns plus **"Other town in this region"** | Disabled until a region is chosen; resets when the region changes |
| Address | The existing field | Hint changes to: "House number, street, or a landmark" |

- Each option shows its fee: "Kumasi — GH₵ 10.00" (or US$ when the shopper uses US$).
- The order summary's **Delivery** line updates as soon as a town is chosen; before a region is chosen it shows "Choose a delivery area".
- These amounts are for display only. The checkout sends `deliveryRegionId` and `deliveryTownId` (`null` for "Other town"), and the **backend's** total is what's charged and shown after payment.
- If the areas fail to load: the error message with **Try again**; checkout can't continue without them.
- For logged-in shoppers, remember the last region and town in the browser (`localStorage`, wrapped in try/catch) and pre-select them next time.

### Order pages and emails

Order confirmation, My Orders details and admin order details show **"Delivery to: Kumasi, Ashanti"** beside the delivery fee. Old orders without an area show "Delivery area: not recorded".

### Admin: `/admin/delivery`

Add **Delivery** to the admin menu (order: Dashboard, Orders, Products, Delivery, Reviews).

- **Regions list:** each region with its fee and towns. Edit the region fee in place (GH₵, up to 2 decimals, converted to pesewas **by reading the digits**, as in FE11); **Save** per region.
- **Towns:** under each region, each town shows **its own fee** or "Uses region fee (GH₵ 15.00)". Edit the name and fee; a **"Use region fee"** checkbox sends `feePesewas: null`; an **Active** switch hides or shows the town.
- **Add town:** name and an optional fee, under its region.
- A help line: "Fees are charged from Kumasi. Changing a fee only affects new orders."
- Duplicate names (409) and invalid fees show under their fields; saves announce "Saved".
- Hiding a region or town asks first: "Hide Tamale from checkout? Past orders aren't affected."
- Phones: one column, each region collapsible.

---

## Part B: Linked guest orders (BE25)

After **verifying an email** or **logging in**, if the response's `linked` object isn't all zeros, show a one-time notice (an announced banner, dismissible):

- Orders only: **"We found 2 earlier orders placed with your email and added them to My Orders."** with a **View my orders** link.
- Cart items: **"We also added 3 items you left in your cart."**
- If some were reduced: "Some quantities were reduced because of stock."

Refresh the cart badge after a cart merge. In My Orders, linked orders look like any other order (no special label for shoppers).

On the **guest confirmation page**, add a line under the order details: "Create an account with **ama@test.com** to track this order and your future orders in one place." with a **Create account** button that opens the register page with the email filled in.

---

## Done when

- [ ] Checkout requires a region; the town list follows the region; "Other town in this region" works.
- [ ] The delivery line and total update with the chosen town, in GH₵ and US$, and match the backend's total after payment.
- [ ] Orders and the confirmation page show the delivery area; old orders show "not recorded".
- [ ] The admin can change region and town fees, add a town, use the region fee, and hide or show a town.
- [ ] After verifying or logging in with an email that had guest orders, the notice appears once, and the orders and cart items are there.
- [ ] The guest confirmation page offers to create an account with the email filled in.
- [ ] Checked at 390px and 1280px, in light and dark, and the build passes.

## Testing

As a guest: check out to Kumasi, Accra and Tamale, and to "Other town" in Ashanti; compare each total with the email. As admin: change Tamale's fee, add a town, hide it and check checkout. Then: pay as a guest, leave an item in the cart, register with the same email on another browser, verify, and check the notice, My Orders and the cart.
