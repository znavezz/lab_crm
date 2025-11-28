# Repository Pattern Implementation Plan

**Goal:** Make database access SOLID-compliant and deployment-flexible  
**Timeline:** 2-3 hours  
**Status:** Ready to Execute

## Why Repository Pattern?

**Current Problem:**
- 12 API routes directly import `prisma`
- Tightly coupled to PostgreSQL
- Can't switch databases without changing all files
- Can't easily test without real database
- Violates Dependency Inversion Principle

**Solution:**
- Create abstract interfaces (IUserRepository, ISmsCodeRepository, etc.)
- Implement Prisma repositories (current functionality)
- Use factory pattern for dependency injection
- **Future:** Just add new repository implementation and change `.env`

---

## Implementation Steps

### ✅ Step 1: Create Repository Interfaces (20 min)
**Files to create:**
- `src/repositories/interfaces/IUserRepository.ts`
- `src/repositories/interfaces/ISmsCodeRepository.ts`
- `src/repositories/interfaces/IWebAuthnRepository.ts`

**What:** Define contracts for data access operations

---

### ✅ Step 2: Implement Prisma Repositories (45 min)
**Files to create:**
- `src/repositories/prisma/PrismaUserRepository.ts`
- `src/repositories/prisma/PrismaSmsCodeRepository.ts`
- `src/repositories/prisma/PrismaWebAuthnRepository.ts`

**What:** Wrap existing Prisma calls in repository classes

---

### ✅ Step 3: Create Repository Factory (15 min)
**File to create:**
- `src/repositories/factory.ts`

**What:** Central place to get repository instances based on config

---

### ✅ Step 4: Refactor API Routes (60 min)
**Files to update** (12 files):
- `src/app/api/auth/password/set/route.ts`
- `src/app/api/auth/password/check/route.ts`
- `src/app/api/auth/phone/add/route.ts`
- `src/app/api/auth/phone/verify/route.ts`
- `src/app/api/auth/sms/send/route.ts`
- `src/app/api/auth/webauthn/register-options/route.ts`
- `src/app/api/auth/webauthn/register/route.ts`
- `src/app/api/auth/webauthn/authenticate-options/route.ts`
- `src/app/api/auth/webauthn/authenticate/route.ts`
- `src/app/api/auth/methods/route.ts`
- `src/lib/auth.ts` (password & SMS providers)
- `src/lib/jobs/cleanup-auth.ts`

**What:** Replace `prisma` imports with repository calls

---

### ✅ Step 5: Test & Verify (20 min)
**Actions:**
- Restart Docker
- Test authentication flows
- Verify no functionality broken
- Check for lint errors

---

## Future Deployment (When Ready)

### Option A: Lab Server PostgreSQL
```bash
# .env.local
DATABASE_TYPE=prisma
DATABASE_URL="postgresql://user:pass@lab-server.edu:5432/lab_crm"
```
**Changes needed:** 0 files ✅

### Option B: Lab Server REST API
```bash
# .env.local
DATABASE_TYPE=lab-api
LAB_API_URL="https://lab-server.edu/api"
LAB_API_KEY="your-api-key"
```
**Files to create:**
- `src/repositories/lab/LabApiUserRepository.ts` (1 new file)
- `src/repositories/lab/LabApiSmsCodeRepository.ts` (1 new file)
- `src/repositories/lab/LabApiWebAuthnRepository.ts` (1 new file)

**Files to modify:** 1 (factory.ts to add new case)

### Option C: MySQL/Different Database
```bash
# .env.local
DATABASE_TYPE=mysql
DATABASE_URL="mysql://user:pass@host:3306/lab_crm"
```
**Files to create:**
- MySQL repository implementations (3 new files)

**Files to modify:** 1 (factory.ts)

---

## Benefits

| Aspect | Before | After |
|--------|--------|-------|
| Switch DB | Change 50+ files | Change .env only |
| Add new DB | Impossible | Add 3 files |
| Testing | Mock Prisma (hard) | Mock interface (easy) |
| Deployment | Rewrite code | Add config |
| SOLID Grade | D (violated) | A (compliant) |

---

## Backwards Compatibility

- ✅ All existing functionality preserved
- ✅ No breaking changes to API
- ✅ Same Prisma under the hood (for now)
- ✅ Zero downtime migration
- ✅ Can rollback easily

---

## Estimated Time

- Step 1 (Interfaces): 20 min
- Step 2 (Prisma Repos): 45 min  
- Step 3 (Factory): 15 min
- Step 4 (Refactor Routes): 60 min
- Step 5 (Testing): 20 min

**Total:** ~2.5 hours

---

## Success Criteria

✅ All auth flows work identically  
✅ No direct `prisma` imports in API routes  
✅ Factory returns correct repository  
✅ Tests pass  
✅ Docker starts successfully  
✅ Ready for lab server deployment

