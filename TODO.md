# Land Registry Project TODO

This file tracks the errors and incomplete work we identified during the project audit.
We will fix these items one by one.

## Priority 1: Critical backend and integration fixes

- [x] Fix frontend/backend user shape mismatch
  - Backend returns `userId`, while frontend reads `user.id`
  - Update frontend auth state and all dependent flows

- [x] Secure admin-only backend actions
  - Restrict pending land view to `ADMIN`
  - Restrict land verification to `ADMIN`
  - Restrict transfer approval to `ADMIN`

- [ ] Fix land registration ownership handling
  - Stop trusting `ownerId` from the client
  - Derive owner from the authenticated user/token

- [ ] Complete transfer approval workflow
  - Validate land existence
  - Validate seller ownership
  - Validate buyer identity
  - Update land owner on approval
  - Write land history entry for transfer
  - Prepare blockchain integration point or remove false claims

- [ ] Remove insecure password reset flow
  - Remove public reset endpoint or secure it properly
  - Remove frontend hardcoded reset-to-`admin123` behavior

## Priority 2: Frontend functional fixes

- [ ] Replace dashboard mock fallback with explicit error handling
  - Avoid silently masking backend failures
  - Show user-friendly API failure states

- [ ] Implement real search functionality
  - Wire survey number search input to backend or local filtered data

- [ ] Implement real document upload flow
  - Add file input handling in frontend
  - Add backend support for document metadata/upload strategy

- [ ] Remove fake map coordinates
  - Use only real coordinates
  - Show a clear empty-state if coordinates are unavailable

- [ ] Replace hardcoded dashboard stats
  - Remove the static `Pending Transfers: 12`
  - Pull real counts from backend or compute correctly

## Priority 3: Code quality and lint fixes

- [ ] Fix frontend lint errors
  - Remove unused imports and variables
  - Fix `react-hooks/purity` issues in chatbot and map view
  - Fix fast-refresh warning in auth context
  - Fix hook dependency warning in history modal

- [ ] Fix text encoding issues
  - Repair corrupted rupee symbols
  - Repair corrupted emoji/text rendering

- [ ] Clean up demo-only and misleading text
  - Review blockchain references in UI
  - Remove demo-only wording where functionality is not real

## Priority 4: Backend model and API cleanup

- [ ] Improve transfer request date handling
  - Replace string date with typed date/time field

- [ ] Review `LandHistory` model construction safety
  - Ensure Mongo serialization/deserialization is stable

- [ ] Add backend validation and better error responses
  - Validate request payloads
  - Return proper HTTP status codes instead of generic runtime failures

## Priority 5: Testing and documentation

- [ ] Add backend tests
  - Auth service tests
  - Land service tests
  - Transfer service tests
  - Controller/security tests

- [ ] Add frontend tests
  - Auth flow
  - Dashboard flow
  - Protected routes
  - Service integration behavior

- [ ] Replace placeholder frontend README
  - Document setup steps
  - Document backend/frontend run instructions
  - Document environment requirements

## Suggested order for fixing

1. User shape mismatch
2. Admin authorization
3. Insecure password reset flow
4. Land registration ownership handling
5. Transfer approval workflow
6. Frontend lint cleanup
7. Search, upload, map, and stats fixes
8. Tests and documentation
