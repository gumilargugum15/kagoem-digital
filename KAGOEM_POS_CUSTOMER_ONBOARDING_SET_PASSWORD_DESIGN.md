# Kagoem POS Customer Onboarding — Set Password Design

## 1. Task Type

**DESIGN ONLY.** No application code, migration, database schema, route,
frontend, configuration, or dependency in `kagoem-digital` or
`kagoem-pos-saas` was created or modified while producing this document.
Both repositories were inspected read-only. This document is the basis
for a future implementation task.

## 2. Objective

Today, a customer who completes checkout + payment in Kagoem Digital and
gets provisioned into Kagoem POS SaaS has **no way to discover a working
password** for the POS app. Design the flow that lets that customer set
their own password after provisioning and log in to Kagoem POS SaaS.

## 3. Current Flow (as implemented today)

```text
Customer
    ↓
Kagoem Digital — Checkout
    ↓
Midtrans — Payment = PAID
    ↓
Subscription = ACTIVE   (OrderFulfillmentService::fulfillSubscription)
    ↓
ApplicationProvisioningService::provision()
    ↓
PosProvisioningAdapter::provision()
    ↓
POST {KAGOEM_POS_API_URL}/provisioning/tenants
    (Bearer KAGOEM_POS_SERVICE_TOKEN)
    ↓
Kagoem POS SaaS — ProvisioningController::store()
    ↓
TenantProvisioningService::provision()
    ↓
Tenant + Branch + Owner User created
    User.password = Str::random(40)         ← unusable, unknown to anyone
    set_password_token = Password::createToken($user)
    ↓
Response: { external_user_id, external_account_id,
            metadata: { tenant_id, tenant_slug, tenant_name, branch_id,
                        set_password_token,
                        set_password_expires_in_minutes: 60 } }
    ↓
Kagoem Digital — ApplicationProvisioningService::attempt()
    ↓
ApplicationAccount::updateOrCreate(..., ['metadata' => $result['metadata']])
    ↓
ApplicationProvisioning = COMPLETED
    ↓
(nothing further happens — metadata.set_password_token is
 never read again by any code path)
```

### 3.1 The gap, precisely

| # | Fact | Evidence |
|---|------|----------|
| 1 | `ApplicationAccount.metadata` (incl. the raw reset token) is stored but never read back anywhere in Kagoem Digital. | `MyProductsController::index()` eager-loads only `product.application:id,name,code,base_url,status` — never `applicationAccount`. No `Mail`/`Notification` call references `ApplicationAccount` anywhere. |
| 2 | Kagoem Digital sends no email at all after provisioning. | No notification is dispatched from `ApplicationProvisioningService::attempt()`. |
| 3 | Kagoem POS SaaS's own `Password::sendResetLink()` path exists but mail is inert in dev/prod-as-configured. | `pos-saas backend/.env`: `MAIL_MAILER=log` — nothing is ever delivered, only logged. |
| 4 | Even if a token reached the customer, Kagoem POS SaaS's frontend has no page to consume it. | `pos-saas frontend/src/routes/` has no `set-password.tsx`/`reset-password.tsx`; only `login.tsx` exists. The API client function `resetPassword()` in `frontend/src/api/auth.ts` is implemented but has **zero UI callers**. |
| 5 | The backend contract needed to *complete* a password reset already exists and works. | `POST /api/v1/auth/reset-password` → `AuthService::resetPassword()` → `Password::reset()`, validated by `ResetPasswordRequest` (`email`, `token`, `password`, `password_confirmation`). |

**Conclusion:** the missing pieces are (a) *sending* the customer a link, and
(b) a *page* on the POS side to submit that link's token. The password-reset
*mechanism* itself (broker, token table, validation, `User.password` update)
already works and needs no backend change for the MVP.

## 4. Scope

Design:
- How and when Kagoem Digital sends the customer an onboarding email
  containing a set-password link.
- The exact link/URL contract between Kagoem Digital and Kagoem POS SaaS.
- The new Kagoem POS SaaS frontend page that consumes that link.
- The one small backend contract addition needed on the Kagoem POS SaaS
  side to distinguish "brand-new POS user" from "existing POS user reused
  as owner" (needed so Kagoem Digital doesn't silently reset an existing,
  in-use password).
- Idempotency rules: exactly when the onboarding email is (and is not)
  sent, across retries and re-subscriptions.
- Security and expiry considerations for the link.

## 5. Explicit Out of Scope

- Recurring billing, renewal, auto-debit, refund, cancellation flows.
- Subscription expiry automation (`Subscription.status → expired`) —
  tracked separately in `prompt_subscription_expiry.md`.
- Suspending/revoking POS access when a subscription lapses — no
  deprovisioning capability exists on either side today; out of scope here.
- Self-service "resend onboarding email" from the customer-facing
  frontend (flagged as a follow-up in §10; this design covers an
  admin-triggered resend only).
- Any change to how `PosProvisioningAdapter` authenticates or to the
  `provisioning/tenants` request payload — only the **response** contract
  gains one new field (§7.1).
- Multi-application generalization (Inventory, Accounting, ...) beyond
  making sure nothing in this design is POS-specific by accident.

## 6. Design Principles

1. **Reuse what already works.** Kagoem Digital already has a working
   Mailtrap SMTP pipeline and a proven `ShouldQueue` notification pattern
   (`OrderCreatedNotification`, `ResetPasswordNotification`). Kagoem POS
   SaaS already has a working, validated `reset-password` endpoint and a
   typed frontend API client for it. The design should add a notification
   + one frontend page, not new plumbing.
2. **Kagoem Digital sends the email, not Kagoem POS SaaS.** POS SaaS's
   mail driver is `log` (nothing delivered) and it has no branded
   templates. Digital's Mailtrap pipeline is proven. The trigger point
   (`ApplicationProvisioningService::attempt()`) already lives in Digital
   and already has `$subscription->user`, `$application`, and the fresh
   `$account->metadata` in scope.
3. **Reuse `Application.base_url` as the link's origin.** No new config
   value is needed: `Application.base_url` (already surfaced today as
   the "Buka Aplikasi" target) is exactly the POS frontend's public URL.
   Building the onboarding link as `{application->base_url}/set-password?...`
   keeps one source of truth and generalizes to future applications for
   free, provided each downstream app implements the same `/set-password`
   contract.
4. **Never let onboarding email failure affect subscription/provisioning
   state.** Matches `ApplicationProvisioningService`'s existing
   "never throws" philosophy: the notification must be queued and must
   log-and-swallow failures (`failed()` hook), exactly like
   `OrderCreatedNotification`.
5. **Send the email exactly once per (user, application) unless an admin
   explicitly resends it.** Not once per subscription, not once per
   provisioning attempt/retry — see §8 for the precise gating rule.

## 7. Proposed Flow

```text
Customer's Subscription → ACTIVE
    ↓
ApplicationProvisioningService::attempt()
    ↓
PosProvisioningAdapter::provision()  (UNCHANGED)
    ↓
POST /provisioning/tenants  (UNCHANGED request; ONE new response field, §7.1)
    ↓
ApplicationAccount::updateOrCreate(...)
    ↓
┌─────────────────────────────────────────────────────────┐
│ NEW: was this ApplicationAccount row just created,       │
│ AND did Kagoem POS SaaS report the owner User itself      │
│ was newly created (not a reused pre-existing account)?    │
└─────────────────────────────────────────────────────────┘
    ↓ yes                                   ↓ no
Dispatch PosAccountOnboarding          Do nothing further
Notification (queued) to               (existing POS user keeps
$subscription->user                    their existing password)
    ↓
Notification builds URL:
{application->base_url}/set-password
    ?email={user.email}
    &token={metadata.set_password_token}
    ↓
Mailtrap (dev) / SMTP (prod) delivers email
    ↓
Customer clicks link
    ↓
Kagoem POS SaaS frontend — NEW /set-password route
    ↓
Form: password + password_confirmation
    ↓
POST /api/v1/auth/reset-password   (UNCHANGED endpoint)
    { email, token, password, password_confirmation }
    ↓
AuthService::resetPassword() → Password::reset()  (UNCHANGED)
    ↓
User.password updated, token consumed
    ↓
Redirect to /login with success message, email prefilled
    ↓
Customer logs in with their own password
```

### 7.1 One backend contract addition (Kagoem POS SaaS)

`ProvisioningController::store()` currently returns `metadata` without
indicating whether the **owner User** (as opposed to the Tenant) was
newly created. `TenantProvisioningService::provision()` already knows
this internally (`resolveOwnerUser()` takes the "create" branch vs. the
`findByEmail()` branch), it just isn't surfaced. Add one boolean field:

```json
{
  "metadata": {
    "tenant_id": 34,
    "tenant_slug": "acme-corp",
    "tenant_name": "Acme Corp",
    "branch_id": 56,
    "set_password_token": "...",
    "set_password_expires_in_minutes": 60,
    "user_was_created": true
  }
}
```

This is the **only** backend change proposed on the Kagoem POS SaaS side.
Everything else (`reset-password`, `forgot-password`, the token broker)
is reused as-is.

## 8. Idempotency Rule (exactly when the email is sent)

Gate the notification dispatch on:

```php
$account->wasRecentlyCreated && ($account->metadata['user_was_created'] ?? false)
```

Rationale, walked through against every real scenario:

| Scenario | `wasRecentlyCreated` | `user_was_created` | Email sent? | Why this is correct |
|---|---|---|---|---|
| First-ever successful provisioning for this user+application | true | true | **Yes** | Exactly the case we're solving. |
| `attempt()` retried after a prior failed attempt (no `ApplicationAccount` row existed yet) | true | true | **Yes** | The failed attempt never inserted a row (it's created only after a successful adapter call), so the eventual success is correctly seen as "first". |
| `retry()` called on an already-`Completed` provisioning | n/a | n/a | No | Both `provision()` and `retry()` already short-circuit before `attempt()` runs at all when status is `Completed` — `attempt()` never re-executes. |
| User re-subscribes to the same POS-linked product after their first subscription lapsed, and they *did* set their password the first time | false | (irrelevant) | No | They already have working credentials; resending would be noise. |
| Owner email happened to already exist as a POS user (e.g. reused across tenants) | true (new `ApplicationAccount` row on Digital's side) | **false** | No | Sending a reset link here would silently invalidate a password the person is already using elsewhere. Flagged as a real, if narrow, edge case — see §9. |

## 9. Known Limitation / Follow-up (flag, do not silently solve)

If a customer re-subscribes to the same POS-linked product **and never
completed the original set-password flow** (link expired, email lost),
the rule in §8 will **not** re-send an onboarding email, because
`wasRecentlyCreated` is false the second time — the `ApplicationAccount`
row already exists from the first (incomplete) onboarding. They would be
stuck with no visible way to get in.

This cannot be fixed cleanly without a new signal for "has this POS
account's password actually been set" (Kagoem POS SaaS has no
`password_set_at`/`onboarded_at` field today; a random 40-char password
looks indistinguishable from a real one from Digital's side). Two options
for the next implementation phase, not decided here:

- **(a)** Add a nullable `password_set_at` timestamp to POS SaaS's `users`
  table, set it inside `AuthService::resetPassword()`, and surface it back
  through a lightweight status-check endpoint Digital can poll/query.
- **(b)** Rely entirely on the admin-triggered resend (§10) as the escape
  hatch for this case, and accept it as a manual-support scenario for v1.

Recommendation: **(b)** for v1 (matches this task's scope discipline —
don't build speculative infrastructure for an edge case with a manual
workaround), revisit **(a)** if support volume justifies it.

## 10. Resend Mechanism

**Admin-triggered only for v1**, not self-service. Rationale: a
self-service "resend my onboarding email" button on the customer-facing
"Produk Saya" page would need to work for a customer who, by definition,
cannot yet log into the thing being resent — the request would have to be
authenticated purely via their Kagoem Digital session (which is fine,
they're logged into Digital already) but then needs a fresh call to the
adapter to mint a new token, i.e. essentially re-running `attempt()`
outside the provisioning-retry semantics. That's a reasonable v2 feature,
but v1 can reuse the **already-planned admin provisioning-retry
capability** (currently dead code: `ApplicationProvisioningService::retry()`
has no caller or admin UI — noted separately in this project's history) by
extending it: an admin "Resend onboarding email" action on a subscription
record calls the same notification-dispatch logic in §8 unconditionally
(bypassing the `wasRecentlyCreated` gate, since this is an explicit,
deliberate resend), regenerating a token via the existing `provision()`
adapter call chain (which — per §3, POS SaaS issues a fresh token on
*every* call to `/provisioning/tenants` — naturally invalidates the old
token to prevent multiple valid links coexisting confusingly).

## 11. Components to Build (next implementation phase)

### Kagoem Digital (backend)
- `App\Notifications\PosAccountOnboardingNotification` — modeled directly
  on `OrderCreatedNotification` (`implements ShouldQueue`, `tries = 3`,
  `backoff()`, `failed()` → `Log::error`, no throw). Constructor takes
  the `Subscription` (or just `User` + `Application` + `metadata` array —
  keep it minimal). `toMail()` builds:
  `"{$application->base_url}/set-password?email=".urlencode($user->email)."&token={$metadata['set_password_token']}"`.
- New blade view `resources/views/emails/pos-onboarding.blade.php`,
  cloned from the existing `emails/password-reset.blade.php` layout
  (header/footer partials already established), copy adjusted for
  "your POS account is ready — set your password" framing, including
  `set_password_expires_in_minutes` in the body text.
- One new call site in `ApplicationProvisioningService::attempt()`,
  immediately after `ApplicationAccount::updateOrCreate(...)`, implementing
  the gate in §8.
- Admin action for §10 (route + controller method; UI can be a button on
  a future admin Subscriptions page — no such page exists yet per earlier
  investigation, so this may need to piggyback on the Applications admin
  page or a new minimal Subscriptions admin view; left as an
  implementation-phase decision).

### Kagoem POS SaaS (backend)
- One field addition to `ProvisioningController::store()`'s response,
  per §7.1 (`metadata.user_was_created`), sourced from
  `TenantProvisioningService::resolveOwnerUser()`'s existing
  create-vs-reuse branch.
- Recommended (not required) hardening: add `throttle` middleware to
  `POST /api/v1/auth/reset-password` (currently has none, unlike
  `login`/`forgot-password` which use `throttle:login`).

### Kagoem POS SaaS (frontend)
- New route `src/routes/set-password.tsx` (TanStack Router file-based,
  matching the existing `login.tsx` pattern: react-hook-form + zod +
  shadcn `Form`/`Card`). Public, unauthenticated. Reads `email`/`token`
  from the query string, form fields for `password` +
  `password_confirmation`, calls the **already-implemented**
  `resetPassword()` wrapper from `src/api/auth.ts` (no new API client
  code needed — types already match: `ResetPasswordPayload`). On success,
  redirect to `/login` with a success toast and the email prefilled. On
  an expired/invalid-token error from the API, show a clear message
  ("link sudah kedaluwarsa, hubungi Kagoem Digital untuk mengirim ulang")
  rather than a generic error, since there is no self-service resend (§10).

### Configuration decision (flag for stakeholder sign-off, not implemented here)
- Kagoem POS SaaS's password-reset token expiry is currently
  `config('auth.passwords.users.expire') = 60` minutes — a sensible
  default for a "forgot password" recovery flow, but arguably tight for
  a "welcome, set up your account" email that a customer might not open
  immediately. Recommend evaluating raising it (e.g. to 1440 minutes / 24
  hours) specifically for this use case before implementation, understanding
  this broker config is shared with POS SaaS's own ordinary forgot-password
  flow (no separate broker exists today for "onboarding" vs. "recovery" —
  introducing one is an option but adds complexity for a first version).

## 12. Sequence Diagram (happy path, first-time customer)

```text
Customer          Kagoem Digital              Kagoem POS SaaS API      Kagoem POS SaaS Frontend      Mail
   |                     |                              |                        |                     |
   |--checkout+pay------>|                              |                        |                     |
   |                     |--fulfill subscription-------->|                        |                     |
   |                     |--POST /provisioning/tenants-->|                        |                     |
   |                     |<--{metadata incl. token,------|                        |                     |
   |                     |    user_was_created:true}     |                        |                     |
   |                     |--ApplicationAccount saved     |                        |                     |
   |                     |--dispatch PosAccountOnboarding|                        |                     |
   |                     |  Notification (queued) ------------------------------------------------------->|
   |                     |                              |                        |    email delivered   |
   |<---------------------------------------------------------------------------------------------------|
   |--click link (base_url/set-password?email&token)------------------------------->|                     |
   |                     |                              |<--render form----------|                     |
   |--submit new password------------------------------------------------------->|                     |
   |                     |                              |<--POST reset-password--|                     |
   |                     |                              |--200 OK---------------->|                     |
   |                     |                              |                        |--redirect /login--->|
   |--login with own password------------------------------------------------->|                        |
```

## 13. Testing Plan (for the implementation phase)

- New Application Account (`wasRecentlyCreated=true`, `user_was_created=true`)
  → notification dispatched with correct URL/token/expiry.
- Provisioning retry on an already-`Completed` record → `attempt()` never
  re-runs → no duplicate email (already guaranteed by existing early
  returns in `provision()`/`retry()`; add a regression test asserting
  `Notification::assertNothingSent()` here).
- First attempt fails, second attempt (retry) succeeds → exactly one
  email sent, from the successful attempt.
- Owner email reused from an existing POS user (`user_was_created=false`)
  → no email sent.
- Re-subscription where `ApplicationAccount` already existed
  (`wasRecentlyCreated=false`) → no email sent (documented limitation,
  §9 — covered by a test asserting current, accepted behavior).
- `/set-password` frontend: valid token → success → redirect to `/login`;
  expired/invalid token → POS SaaS's existing `Password::reset()` error
  surfaced as a clear, non-generic message.
- Notification `failed()` path (mail server unreachable) → provisioning
  status remains `Completed`, error only logged, subscription/order state
  untouched.
- Admin resend action (§10) → always dispatches regardless of the
  `wasRecentlyCreated` gate, and results in the previously issued token
  no longer working (superseded by POS SaaS's own createToken-per-call
  behavior).

## 14. Open Questions Requiring Sign-off Before Implementation

1. Keep the 60-minute reset-token expiry, or raise it for this onboarding
   use case (§11, Configuration decision)?
2. Where should the admin "resend onboarding email" action live, given no
   admin Subscriptions page exists yet — new minimal page, or bolt onto
   the existing admin Applications page (`frontend/src/pages/admin/Applications.tsx`)?
3. Copy/branding for the onboarding email and the `/set-password` page
   (non-technical, needs product/marketing input).
4. Whether to build §9's option (a) (`password_set_at` tracking) now or
   defer — recommendation above is to defer.

## 15. Final Review Checklist

```text
[x] Both repositories inspected read-only; no code/config/schema changed
[x] Existing architecture reused (Mailtrap pipeline, ShouldQueue pattern,
    reset-password broker, existing frontend API client) — no duplicate
    plumbing designed
[x] Exact hook point identified (ApplicationProvisioningService::attempt())
[x] Idempotency rule specified and walked through against every known
    scenario, including retries and re-subscriptions
[x] One precise, minimal backend contract addition identified (§7.1)
[x] Known limitation flagged explicitly rather than silently glossed over
    (§9)
[x] Security/expiry tradeoffs surfaced as an explicit decision, not
    silently assumed
[x] Out-of-scope items enumerated (expiry automation, deprovisioning,
    self-service resend, multi-app generalization)
[x] Testing plan enumerates both the happy path and every edge case
    discussed
```
