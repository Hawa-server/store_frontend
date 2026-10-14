# FE14: Forgot Password and Delete Account

An extra task: the pages for **BE27**. It is **separate from `docs/frontend-plan.md`**; follow `CLAUDE.md` and the plan's existing rules (Design Guide, light and dark themes, responsive design, the shared API helper, the shared confirmation dialog, `docs/api.md` as the source of truth).

**Build this only after BE27 is done** and `docs/api.md` has been copied again from the backend project.

---

## Forgot password

### Login page

Add a **"Forgot your password?"** link under the password field, going to `/forgot-password`.

### `/forgot-password`

- Title "Reset your password", one **Email** field (filled in if the shopper already typed it on the login page), and **Send reset link**.
- After sending, always show the backend's message: "If an account exists for this email, we've sent a link to reset your password. Check your inbox and spam folder. The link expires in 30 minutes."
- **Send again** is disabled for 60 seconds after each send.
- A link back to **Log in**.

### `/reset-password?token=…`

- Title "Choose a new password". Fields: **New password** and **Confirm new password**, with show/hide buttons and the same password rules and hints as registration. The two must match before sending.
- On success: go to the login page with the message "Your password has been changed. Please log in with your new password."
- On `RESET_LINK_INVALID`: "This link has expired or has already been used." with a **Send a new link** button (to `/forgot-password`).
- A missing token in the address shows the same message.
- Remove the token from the address bar once the page has read it (`history.replaceState`), so it isn't left in the browser history.

---

## Delete account

### Where

A new **Account** page (`/account`), linked from the header's account menu, with the shopper's name and email and a **Danger zone** section at the bottom. (Admins don't see the delete section.)

### Flow

1. **Delete my account** (alert-coloured button) opens the shared dialog:
   - "Delete your Adorn account?"
   - What happens, in a short list: you'll be logged out everywhere; your reviews will be removed; your cart will be emptied; your past orders are kept for the store's records, but you won't be able to see them; **this can't be undone**.
   - **Password** field and a field "Type DELETE to confirm". The **Delete account** button stays disabled until both are filled and the second says exactly `DELETE`.
2. On success: clear the user and cart state, go to the home page, and show "Your account has been deleted."
3. Errors:
   - Wrong password: under the password field.
   - `ORDERS_IN_PROGRESS`: the backend's message with a link to **My Orders**.
   - Anything else: the message with Try again.

---

## Done when

- [ ] "Forgot your password?" leads to a working reset request, with the same message for any email.
- [ ] The reset link opens the new-password page, works once, and leads to logging in with the new password.
- [ ] An expired or used link shows a clear message and a way to get a new one.
- [ ] The Account page shows the delete option to shoppers only, with a clear warning, the password and "DELETE" checks.
- [ ] Deleting logs the shopper out and clears their cart and details from the screen; orders in progress show the right message.
- [ ] Every new page works with the keyboard, has visible labels, and is checked at 390px and 1280px, in light and dark; the build passes.

---

## Prompt for Claude Code

```
BE27 is done and docs/api.md is updated. Start the extra task in
docs/FE14-forgot-password-delete-account.md (it's not in frontend-plan.md).
Follow CLAUDE.md and the plan's existing rules. Explain your plan first and
wait for my OK.
```
