# FE11: Admin Product Management

An extra task, added after FE10. It gives the admin a **Products** section to see every product with its stock, add products, and edit them. It is **separate from `docs/frontend-plan.md`**; follow `CLAUDE.md` and the plan's existing rules (Design Guide, light and dark themes, responsive design, the shared API helper, `docs/api.md` as the source of truth).

**Build this only after BE23 is done** and `docs/api.md` has been copied again from the backend project (it must include the `/api/admin/products` endpoints).

---

## What's in and out

| In | Out (later) |
|---|---|
| A **Products** list with search, category and status filters, showing every product's **stock** | Uploading images (the admin uploads photos in ImageKit first, then pastes the address) |
| **Add product** and **Edit product** pages | Deleting products (deactivate instead) |
| An **Active / Inactive** switch | Variants (sizes, shades, colours) |
| A clear message when stock changed while editing | |

---

## Sidebar

Menu order: **Dashboard, Orders, Products, Reviews**. "Products" is active on every `/admin/products` page. The dashboard's low-stock badge is unchanged; after a product save, refresh it (through the existing `AdminStatsContext`).

---

## `/admin/products`: product list

- **Header:** "Products", the total count, and an **Add product** button (main button style).
- **Filters** (kept in the address bar, so reload and Back keep them):
  - a **Search** field (product name), applied on Enter or after the shopper stops typing (about 400 ms), with a clear button
  - a **Category** select (from `GET /api/categories`)
  - a **Status** button group: All / Active / Inactive (`aria-pressed`)
  - **Clear filters**
- **Table**, in its own sideways-scrolling box on small screens:

| Column | Shows |
|---|---|
| Product | Small photo (ImageKit `?tr=w-120`, placeholder fallback) and the name, linked to its edit page |
| Category | Category name |
| Price | GH₵ (always GH₵ in the admin) |
| Stock | The number, plus a label in words: **"Out of stock"** (alert colours) at 0, **"Low"** (pending colours) from 1 up to the dashboard's threshold, nothing otherwise |
| Status | **Active** or **Inactive** badge, always with the word |
| Updated | Date in Ghana time |

- 20 per page, with the shared pagination component.
- **Empty states:** "No products match these filters." (with Clear filters) or, with no products at all, "No products yet." (with Add product).
- **Loading:** grey placeholder rows. **Error:** the message with Try again.
- **Phones:** the table can become stacked cards (photo, name, price, stock label, status, Edit), as long as nothing scrolls the whole page sideways.

---

## `/admin/products/new` and `/admin/products/:id`: product form

One shared form component for both pages. Page titles: **"Add product"** and **"Edit product: {name}"**.

**Fields** (each with a visible label, as in the checkout form):

| Field | Input | Notes |
|---|---|---|
| Name | Text, 2–150 characters, with a counter | |
| Category | Select from `GET /api/categories` | |
| Price (GH₵) | Text with `inputmode="decimal"` | Up to 2 decimal places, greater than 0. Converted to pesewas **by reading the digits** (for example, "120.5" → 12050), never by multiplying a decimal |
| Stock | Number, whole numbers 0–100,000 | On the edit page, shows "Current stock: X" |
| Description | Textarea, 1–2,000 characters, with a counter | |
| Image address | Text (URL) | Must start with `https://ik.imagekit.io/`. Shows a live **preview** of the image (with the placeholder if it fails to load) |
| Image description (alt text) | Text, 1–200 characters, with a counter | Explained in a hint: "Describe the photo for people using screen readers." |
| Active | A switch or checkbox: "Show this product in the shop" | |

**Help line under the image fields:** "Upload the photo in ImageKit first, then paste its address here."

**Checks before sending** (shown under each field, the same wording as the backend where possible): required fields, lengths, price format, whole-number stock, ImageKit address. All numbers are sent as **JSON numbers**.

**Saving:**

- **Add:** `POST /api/admin/products`, then go to the new product's edit page with "Product added." announced.
- **Edit:** `PATCH /api/admin/products/:id` with **only the changed fields**. If **stock** changed, also send `expectedStock`: the stock value loaded when the page opened.
- The Save button is disabled and shows "Saving…" while it works. On success: "Changes saved" (announced), and the form reloads from the backend's response.
- **Backend errors:** `fields` messages appear under their fields; a duplicate name (409) shows under Name.
- **Stock changed meanwhile (409 with `currentStock`):** show a clear notice: "Stock changed since you opened this product. It's now X. Check the number and save again." Update "Current stock" and `expectedStock` to the new value, keep the admin's other edits, and don't save until they press Save again.
- **Leaving with unsaved changes:** ask "Leave without saving?" (the browser's own prompt is fine).

**Deactivating** (switching Active off on an existing product): confirm first with the shared dialog: "Hide this product from the shop? Shoppers won't be able to buy it until you make it active again. Past orders aren't affected." Reactivating needs no confirmation.

**Edit page extras:** a "View in shop" link (opens the public product page; for inactive products, note "Hidden from the shop"), and the created and updated dates.

**Unknown product ID:** the not-found page.

---

## Access

The existing `RequireAdmin` guard: not logged in → login and back; not an admin, or any 403 → "You don't have access to this page."

---

## Layout

- **Laptops:** the form in two columns (details on the left; image, preview and status on the right), Save at the bottom right.
- **Phones:** one column; the image preview under the image fields; Save full width.
- Both themes, using only the theme colours. Every button at least 44px.

---

## Files

- **New:** `src/pages/admin/AdminProductsPage.jsx`, `src/pages/admin/AdminProductFormPage.jsx` (add and edit), `src/components/admin/ProductForm.jsx`.
- **Changed:** `AdminLayout.jsx` (the Products menu item), `App.jsx` (the three routes), and the money helper only if a GH₵-to-pesewas parser doesn't exist yet.

---

## Done when

- [ ] The admin sees every product with its stock, and can search and filter by category and status (kept in the address bar).
- [ ] Out-of-stock and low-stock products are labelled in words, not colour alone.
- [ ] Adding a product with an ImageKit image makes it appear in the shop straight away.
- [ ] Editing price, stock, details and image saves correctly; only changed fields are sent.
- [ ] A stock conflict (409) shows the current stock and keeps the admin's other edits.
- [ ] Deactivating asks first, and hides the product from the shop; reactivating brings it back.
- [ ] Invalid input shows clear messages before sending; backend errors appear under their fields.
- [ ] The dashboard's low-stock badge updates after a stock change.
- [ ] Checked at 390px and 1280px, in light and dark, and the build passes.

## Testing

As admin: add a test product (use an existing ImageKit image address), find it with search and filters, edit its price and stock, then check the shop and the dashboard. Change its stock in a second tab and save the first tab to see the stock-conflict message. Deactivate and reactivate it. As a shopper, check the product appears, disappears, and comes back. Afterwards, deactivate the test product (it can't be deleted).
