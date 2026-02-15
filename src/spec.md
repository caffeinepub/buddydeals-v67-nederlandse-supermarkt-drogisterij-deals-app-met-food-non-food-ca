# Specification

## Summary
**Goal:** Rebuild and redeploy the existing BuddyDeals draft v70 so it opens in preview again, without changing functionality, UI, routing, or stored backend state.

**Planned changes:**
- Rebuild and redeploy the current application version as-is (no feature or design changes).
- Verify the Motoko backend redeploys without resetting/breaking existing persisted user data.
- Only perform a backend state upgrade/migration if strictly required for successful redeploy (keeping all logic in `backend/main.mo`, adding `backend/migration.mo` only if necessary).

**User-visible outcome:** The BuddyDeals v70 preview becomes accessible again and behaves the same as before, with existing user data intact.
