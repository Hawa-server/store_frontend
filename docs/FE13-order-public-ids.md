# FE13: Order Addresses with UUIDs

An extra task, added after the presentation (teacher's feedback). The frontend side of **BE26**: order pages use a long random ID in the address (`/orders/3f2a9c1e-…`) instead of a counting number (`/orders/9`).

It is **separate from `docs/frontend-plan.md`**; follow `CLAUDE.md` and the plan's existing rules. **Build this only after BE26 is done** and `docs/api.md` has been copied again from the backend project.

---

## What changes

The backend now puts the UUID in each order's `id` field, so most links (`/orders/${order.id}`, `/admin/orders/${order.id}`) keep working without changes. Check and fix:

- **Routes:** `/orders/:orderId` and `/admin/orders/:orderId` accept any string; don't convert the parameter to a number (look for `Number(...)`, `parseInt(...)` or `+id` on order IDs and remove them).
- **What people see:** pages, headings, page titles and messages show the **order number** (`orderNumber`), never `id`. Look for anything like "Order #{order.id}" and change it to the order number.
- **Not found:** an old address such as `/orders/9` shows "Order not found" with a link to **My Orders** (the existing not-found handling, with that link added).
- **Admin actions:** status changes, refunds and cancellation use `order.id` (now the UUID) in their API calls; check each one still works.
- **Long addresses on phones:** nothing on screen prints the UUID, so nothing should overflow; check at 390px anyway.

---

## Done when

- [ ] Opening an order from My Orders, the admin list, and an email link shows a UUID in the address bar.
- [ ] No page shows an order's UUID or old number as its name; the order number is shown instead.
- [ ] `/orders/9` shows "Order not found" with a link to My Orders.
- [ ] Cancelling, status changes and refunds still work.
- [ ] Checked at 390px and 1280px, in light and dark, and the build passes.

---

## Prompt for Claude Code

```
BE26 is done and docs/api.md is updated. Start the extra task in
docs/FE13-order-public-ids.md (it's not in frontend-plan.md). Follow
CLAUDE.md and the plan's existing rules. Explain your plan first and wait
for my OK.
```
