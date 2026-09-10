# Security Audit Report -- Retain-ly

**Audit Date:** 2026-09-09
**Scope:** Full codebase at `/home/bradley/project/Retain-ly`

## Summary

| Severity | Count |
|----------|-------|
| Critical | 5 |
| High | 6 |
| Medium | 10 |
| Low | 8 |
| Info | 1 |
| **Total** | **30** |

---

## CRITICAL

### C1. PIN Stored in Plaintext -- No Hashing
**Files:** `supabase/migrations/003_users_pin_auth.sql:7`, `src/app/(auth)/login/page.tsx:44`

PIN stored as raw `TEXT`. Login query `.eq('pin', pinCode)` compares plaintext directly. Anyone with DB access reads every user's PIN.

**Fix:** Hash PINs with bcrypt. Use Supabase Edge Function for auth.

### C2. Login Fetches ALL User Fields Including PIN, Stores in localStorage
**Files:** `src/app/(auth)/login/page.tsx:42,50`

`.select('*')` returns every column including plaintext PIN. Serialized to localStorage. XSS = full credential theft.

**Fix:** Select only `id, username, role`. Never store credentials in localStorage.

### C3. Entire Auth System is Client-Side Spoofable
**Files:** `src/app/(app)/layout.tsx:169-174`

Auth check = `localStorage.getItem('retainly_user')`. Any user can run:
```js
localStorage.setItem('retainly_user', JSON.stringify({username:'admin',role:'admin'}))
```
No server-side session validation, no middleware, no Supabase Auth session check.

**Fix:** Use Supabase Auth with JWT sessions. Add Next.js middleware for `/app/*` routes.

### C4. RLS Policies Wide Open -- `FOR ALL USING (true)`
**Files:** `supabase/migrations/001_initial_schema.sql:47-48`, `supabase/migrations/003_users_pin_auth.sql:14`

All three tables (`customers`, `orders`, `users`) allow ALL operations for `anon` role unconditionally. RLS provides zero protection.

**Fix:** Implement proper per-user or server-gated RLS policies.

### C5. User Table Fully Accessible via Anon Key
**Files:** `supabase/migrations/003_users_pin_auth.sql:14`, `src/app/(auth)/login/page.tsx:40-45`

Anyone can `GET /rest/v1/users?select=*` and get all usernames, plaintext PINs, and roles.

**Fix:** Remove "Allow all for anon" from users table. Use Supabase Auth or Edge Functions.

---

## HIGH

### H1. No Route Protection / No Middleware
No `middleware.ts` exists. All `/app/*` routes protected only by client-side localStorage check. Content is server-rendered before redirect occurs.

**Fix:** Create `src/middleware.ts` checking Supabase session on every request.

### H2. Anon Key Exposed Client-Side with Full DB Access
Anon key embedded in client JS bundle (`NEXT_PUBLIC_*`). With RLS wide open, this grants full database access to anyone.

**Fix:** Fix RLS policies first. Use service role key only server-side.

### H3. Supabase Query Injection via Unsanitized Input
**Files:** `src/services/customerService.ts:19`, `src/hooks/useCustomerSearch.ts:32`

`.or(\`phone_normalized.ilike.%${query}%,name.ilike.%${query}%\`)` -- query interpolated directly. `%` wildcards and special characters not sanitized.

**Fix:** Sanitize: `query.replace(/[%_]/g, '\\$&')`. Limit query length.

### H4. Hardcoded Supabase Credentials in Git-Tracked Seed Script
**File:** `scripts/seed_dummy_750.js:3-4`

Supabase URL and anon key hardcoded and committed.

**Fix:** Move to environment variables. Don't commit seed scripts with credentials.

### H5. No Rate Limiting Anywhere
Zero rate limiting on any Supabase operation. PIN brute-force (1M combinations) queryable client-side.

**Fix:** Implement rate limiting at Edge Function gateway. Account lockout after N failures.

### H6. No Content Security Policy (CSP) Headers
No CSP, X-Frame-Options, or security headers configured. No XSS protection.

**Fix:** Add headers in `next.config.ts`:
```ts
{ key: 'Content-Security-Policy', value: "default-src 'self'; script-src 'self'" },
{ key: 'X-Frame-Options', value: 'DENY' },
{ key: 'X-Content-Type-Options', value: 'nosniff' },
```

---

## MEDIUM

### M1. Hardcoded Default Credentials in Migrations
**Files:** `supabase/migrations/001_initial_schema.sql:119-148`, `002_seed_admin_user.sql:4`, `003_users_pin_auth.sql:17`

Email `admin@retainly.app` / password `123456` committed to git. Both Supabase Auth and custom PIN table.

**Fix:** Remove from migrations. Use env vars or setup script. Force change on first login.

### M2. Customer Name Not Sanitized for Generated Files
**Files:** `src/utils/vcardGenerator.ts:9-10`, `src/utils/waLinkBuilder.ts:11`

User-supplied names inserted into vCard content and WA templates without sanitization.

**Fix:** Strip newlines and control characters.

### M3. Phone Number Validation Incomplete
**File:** `src/utils/normalizePhone.ts:5-25`

`isValidPhone()` exists but is never called during customer creation. Any string accepted.

**Fix:** Call `isValidPhone()` before database insert.

### M4. `.env.example` Has Wrong Variable Names
**File:** `.env.example:1-2`

Uses `VITE_` prefix instead of `NEXT_PUBLIC_`. Developers following example will fail.

**Fix:** Update to `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

### M5. Export N+1 Query Abuse
**File:** `src/app/(app)/app/export/page.tsx:36-49`

Fetches 10,000 customers, then individual order query per customer = 10,001 queries.

**Fix:** Single Supabase query with join. Server-side pagination.

### M6. Error Messages Leak Supabase Internals
**Files:** `src/app/(app)/app/customers/[id]/page.tsx:84`, `src/app/(app)/app/page.tsx:167`

Raw PostgREST errors shown to users (table names, RLS policy details).

**Fix:** Map to user-friendly messages. Log details server-side.

### M7. localStorage Auth Token XSS Risk
**Files:** `src/app/(auth)/login/page.tsx:50`, `src/app/(app)/layout.tsx:169,174`

`JSON.parse(stored)` does not validate shape. Any JSON can be injected.

**Fix:** Validate parsed object shape. Use httpOnly cookies.

### M8. No Session Timeout
Auth state in localStorage persists indefinitely until manual logout. On shared devices (POS terminals), this is a risk.

**Fix:** Add session timeout. Implement Supabase Auth with expiry.

### M9. Logout Incomplete
**File:** `src/app/(app)/layout.tsx:182-185`

Only removes `retainly_user`. Does not clear `retainly_settings`, Supabase session, or cached data.

**Fix:** Clear all related keys. Call `supabase.auth.signOut()`.

### M10. Threshold Settings Not Validated
**File:** `src/app/(app)/app/settings/page.tsx:118-138`

No validation that `activeDays < atRiskDays`. Setting active=60, atRisk=30 shows "61 - 30 hari" which is nonsensical.

**Fix:** Add min/max validation and cross-field constraint.

---

## LOW

### L1. PIN Input Validation is UI-Only
**File:** `src/app/(auth)/login/page.tsx:18-26`

`pattern="[0-9]"` and `inputMode="numeric"` but non-numeric characters can be pasted.

**Fix:** `pin.join('').replace(/\D/g, '').slice(0, 6)` before query.

### L2. Duplicate `normalizePhone` Implementation
**Files:** `src/utils/normalizePhone.ts:5-21`, `src/utils/index.ts:1-17`

Two identical functions. Maintenance risk if one is patched.

### L3. Untracked `session-ses_f837.md` Contains Development Logs
Not committed but should be gitignored or deleted.

### L4. Redundant Icon Libraries
**File:** `package.json:13,19`

Both `@phosphor-icons/react` and `lucide-react` declared but only phosphor is used.

### L5. `package.json.bak` Contains Old Vite Dependencies
Tracked in git, contains `react-router-dom`, `recharts`, `vite-plugin-pwa`.

### L6. Console.error in Production
**File:** `src/app/(app)/app/export/page.tsx:98`

### L7. No `httpOnly` Cookie for Session
All auth via localStorage. No Secure, HttpOnly, SameSite attributes.

### L8. No Formal `npm Audit` or Snyk Integration

---

## INFO

- **I1:** Dependencies appear up-to-date (`next@16.3.4`, `react@19.2.8`). No open redirect vulnerabilities found.

---

## TOP 5 PRIORITIZED REMEDIATIONS

1. **[CRITICAL]** Implement Supabase Auth with server-side session verification + Next.js middleware
2. **[CRITICAL]** Fix all RLS policies -- remove `FOR ALL USING (true)`, implement per-user access
3. **[CRITICAL]** Hash PINs with bcrypt/argon2 before database storage
4. **[HIGH]** Add CSP headers and security headers via `next.config.ts`
5. **[HIGH]** Implement rate limiting and PIN brute-force protection
