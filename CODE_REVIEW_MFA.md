# Multi-Factor Authentication - Code Review

## Executive Summary

The multi-factor authentication implementation is **functional** but has several areas that need improvement for production readiness. This review covers SOLID principles, security concerns, redundant code, and missing features.

---

## 🔴 CRITICAL ISSUES

### 1. WebAuthn Challenge Storage Hack

**Location:** 
- `src/app/api/auth/webauthn/register-options/route.ts:56`
- `src/app/api/auth/webauthn/authenticate-options/route.ts:52`
- `src/app/api/auth/webauthn/register/route.ts:38`
- `src/app/api/auth/webauthn/authenticate/route.ts:31`

**Problem:**
```typescript
// TEMPORARY HACK - challenge stored in image field
await prisma.user.update({
  where: { id: user.id },
  data: { image: options.challenge },
});
```

**Why It's Bad:**
- ❌ Overwrites user's actual profile image
- ❌ No expiration - challenges should expire quickly
- ❌ Race condition if user registers multiple devices simultaneously
- ❌ Challenge visible in user profile queries
- ❌ Violates Single Responsibility Principle

**Solution:**
Create a dedicated `WebAuthnChallenge` model:

```prisma
model WebAuthnChallenge {
  id        String   @id @default(cuid())
  userId    String
  challenge String
  expiresAt DateTime
  type      String   // 'registration' | 'authentication'
  
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  createdAt DateTime @default(now())
  
  @@index([userId])
  @@index([challenge])
}
```

**Migration Path:**
1. Create new model in Prisma schema
2. Run migration
3. Update all WebAuthn routes to use new model
4. Add cleanup job to delete expired challenges

---

### 2. No Rate Limiting

**Location:** All authentication API routes

**Problem:**
- ❌ No protection against brute force attacks on password endpoint
- ❌ No protection against SMS code enumeration
- ❌ No protection against credential stuffing

**Solution:**
Implement rate limiting middleware:

```typescript
// src/middleware/rate-limit.ts
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, '10 m'), // 5 attempts per 10 minutes
})

export async function checkRateLimit(identifier: string) {
  const { success, remaining } = await ratelimit.limit(identifier)
  return { allowed: success, remaining }
}
```

**Alternative (Free):**
Use in-memory rate limiting with `lru-cache`:

```typescript
import LRU from 'lru-cache'

const loginAttempts = new LRU<string, number>({
  max: 10000,
  ttl: 1000 * 60 * 10, // 10 minutes
})

export function checkLoginAttempts(ip: string, maxAttempts = 5): boolean {
  const attempts = loginAttempts.get(ip) || 0
  if (attempts >= maxAttempts) return false
  
  loginAttempts.set(ip, attempts + 1)
  return true
}
```

---

## 🟡 SOLID PRINCIPLE VIOLATIONS

### 1. Single Responsibility Principle (SRP)

**Violation:** `src/lib/auth-utils.ts` has too many responsibilities

**Current Structure:**
```typescript
// Password utilities
export function hashPassword()
export function verifyPassword()
export function checkPasswordStrength()

// Phone utilities
export function validatePhoneNumber()
export function sanitizePhoneNumber()

// SMS utilities
export function generateSmsCode()
export function verifySmsCode()

// General utilities
export function sanitizeEmail()
```

**Solution:** Split into focused modules:

```
src/lib/auth/
├── password-service.ts    # Password hashing, verification, strength
├── phone-service.ts       # Phone validation, formatting
├── sms-service.ts         # SMS code generation, verification, sending
└── validation.ts          # Common validation utilities
```

**Benefits:**
- ✅ Easier to test individual services
- ✅ Better code organization
- ✅ Easier to mock in tests
- ✅ Clear separation of concerns

---

### 2. Dependency Inversion Principle (DIP)

**Violation:** Direct Prisma dependencies in API routes

**Problem:**
Every API route directly imports and uses `prisma`:

```typescript
// src/app/api/auth/password/set/route.ts
import { prisma } from '@/lib/prisma';

const user = await prisma.user.findUnique({...});
await prisma.user.update({...});
```

**Solution:** Create repository pattern:

```typescript
// src/repositories/user-repository.ts
export interface IUserRepository {
  findById(id: string): Promise<User | null>
  findByEmail(email: string): Promise<User | null>
  findByPhone(phone: string): Promise<User | null>
  updatePassword(userId: string, hashedPassword: string): Promise<void>
  updatePhone(userId: string, phone: string): Promise<void>
}

export class PrismaUserRepository implements IUserRepository {
  constructor(private prisma: PrismaClient) {}
  
  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id } })
  }
  
  // ... other methods
}
```

**Usage in API routes:**
```typescript
import { getUserRepository } from '@/repositories'

const userRepo = getUserRepository()
const user = await userRepo.findById(session.user.id)
```

**Benefits:**
- ✅ Easier to test (mock the repository)
- ✅ Easier to switch databases
- ✅ Centralized data access logic
- ✅ Better type safety

---

### 3. Open/Closed Principle (OCP)

**Violation:** SMS provider is not extensible

**Current:**
```typescript
// src/lib/sms.ts
export async function sendSmsCode(phone: string, code: string) {
  console.log(`[SMS STUB] Code for ${phone}: ${code}`);
  return { success: true };
}
```

**Problem:** To add a real SMS provider, you'd need to modify this file.

**Solution:** Use Strategy Pattern:

```typescript
// src/lib/sms/types.ts
export interface ISmsProvider {
  sendCode(phone: string, code: string): Promise<{ success: boolean; error?: string }>
}

// src/lib/sms/providers/console-provider.ts
export class ConsoleSmsProvider implements ISmsProvider {
  async sendCode(phone: string, code: string) {
    console.log(`[SMS] Code for ${phone}: ${code}`)
    return { success: true }
  }
}

// src/lib/sms/providers/twilio-provider.ts
export class TwilioSmsProvider implements ISmsProvider {
  constructor(private accountSid: string, private authToken: string) {}
  
  async sendCode(phone: string, code: string) {
    // Real Twilio implementation
  }
}

// src/lib/sms/index.ts
export function getSmsProvider(): ISmsProvider {
  const provider = process.env.SMS_PROVIDER || 'console'
  
  switch (provider) {
    case 'twilio':
      return new TwilioSmsProvider(
        process.env.TWILIO_ACCOUNT_SID!,
        process.env.TWILIO_AUTH_TOKEN!
      )
    case 'console':
    default:
      return new ConsoleSmsProvider()
  }
}
```

**Benefits:**
- ✅ Easy to add new SMS providers
- ✅ Can switch providers via environment variable
- ✅ Easy to mock for testing
- ✅ Follows dependency inversion

---

## 🟠 REDUNDANT CODE

### 1. Legacy Token Functions

**Location:** `src/lib/auth.ts:182-203`

**Problem:**
```typescript
// These are NOT used anywhere in the codebase
export function setAuthToken(token: string) { ... }
export function getAuthToken(): string | null { ... }
export function clearAuthToken() { ... }
export function isAuthenticated(): boolean { ... }
```

**Why They're Redundant:**
- You're using NextAuth with JWT sessions
- These localStorage functions are client-side only
- No code references them
- They're confusing and misleading

**Solution:** **DELETE THEM**

```bash
# Remove lines 181-203 from src/lib/auth.ts
```

---

### 2. Unnecessary signIn Callback

**Location:** `src/lib/auth.ts:158-161`

```typescript
async signIn() {
  // Allow all sign-in attempts
  return true;
},
```

**Problem:** This callback does nothing - it's the default behavior.

**Solution:** Remove it:

```typescript
callbacks: {
  // Remove signIn callback - it's redundant
  async jwt({ token, user }) { ... },
  async session({ session, token }) { ... },
}
```

---

### 3. Duplicate Email Sanitization

**Problem:** Email sanitization is done multiple places:

```typescript
// In auth.ts:69
credentials.email.toLowerCase().trim()

// In auth-utils.ts:175
export function sanitizeEmail(email: string): string {
  return email.toLowerCase().trim();
}
```

**Solution:** Use the utility function consistently:

```typescript
import { sanitizeEmail } from './auth-utils'

const user = await prisma.user.findUnique({
  where: { email: sanitizeEmail(credentials.email) },
})
```

---

## 🟢 MISSING FEATURES

### 1. Password Reset Flow

**Currently Missing:**
- No way for users to reset forgotten passwords
- No "Forgot Password?" link on signin page

**Required:**
1. "Forgot Password" button on signin page
2. API endpoint to send reset email
3. Reset token model in database
4. Password reset page with token validation
5. API endpoint to update password with token

---

### 2. Account Lockout

**Currently Missing:**
- No account lockout after multiple failed attempts
- No temporary ban for suspicious activity

**Required:**
```prisma
model User {
  // ... existing fields
  failedLoginAttempts Int      @default(0)
  lockedUntil         DateTime?
}
```

---

### 3. Security Audit Log

**Currently Missing:**
- No logging of authentication events
- Can't track suspicious activity
- Can't show user "Your account was accessed from..."

**Required:**
```prisma
model AuthenticationLog {
  id        String   @id @default(cuid())
  userId    String
  action    String   // 'login', 'logout', 'password_change', etc.
  method    String   // 'password', 'sms', 'webauthn', 'email'
  ipAddress String?
  userAgent String?
  success   Boolean
  metadata  Json?    // Extra context
  
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now())
  
  @@index([userId])
  @@index([createdAt])
}
```

---

### 4. SMS Code Cleanup

**Currently Missing:**
- Old SMS codes are never deleted
- Database will grow infinitely

**Solution:** Add cleanup job:

```typescript
// src/jobs/cleanup-auth.ts
import { prisma } from '@/lib/prisma'

export async function cleanupExpiredAuthData() {
  const now = new Date()
  
  // Delete expired SMS codes
  await prisma.smsVerificationCode.deleteMany({
    where: {
      OR: [
        { expiresAt: { lt: now } },
        { verified: true, createdAt: { lt: new Date(Date.now() - 24 * 60 * 60 * 1000) } }
      ]
    }
  })
  
  // Delete expired WebAuthn challenges (once implemented)
  await prisma.webAuthnChallenge.deleteMany({
    where: { expiresAt: { lt: now } }
  })
}
```

**Run via:**
- Cron job (production)
- Next.js API route with cron (Vercel)
- Background worker (Docker)

---

### 5. Environment Variable Validation

**Currently Missing:**
- No validation that required env vars are present
- App crashes at runtime if missing

**Solution:**

```typescript
// src/lib/env.ts
import { z } from 'zod'

const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().url(),
  
  // Auth
  NEXTAUTH_URL: z.string().url(),
  NEXTAUTH_SECRET: z.string().min(32),
  AUTH_SECRET: z.string().min(32),
  
  // Email
  EMAIL_SERVER_HOST: z.string(),
  EMAIL_SERVER_PORT: z.coerce.number(),
  EMAIL_SERVER_USER: z.string(),
  EMAIL_SERVER_PASSWORD: z.string(),
  EMAIL_FROM: z.string().email(),
  
  // WebAuthn
  WEBAUTHN_RP_NAME: z.string().default('Lab CRM'),
  WEBAUTHN_RP_ID: z.string().default('localhost'),
  WEBAUTHN_ORIGIN: z.string().url().default('http://localhost:3000'),
  
  // SMS (optional)
  SMS_PROVIDER: z.enum(['console', 'twilio']).default('console'),
  TWILIO_ACCOUNT_SID: z.string().optional(),
  TWILIO_AUTH_TOKEN: z.string().optional(),
})

export const env = envSchema.parse(process.env)
```

**Usage:**
```typescript
import { env } from '@/lib/env'

// TypeScript knows this is a string and exists
const dbUrl = env.DATABASE_URL
```

---

## 🔵 CODE QUALITY IMPROVEMENTS

### 1. Error Handling Consistency

**Problem:** Inconsistent error responses across API routes:

```typescript
// Some routes return:
{ error: 'Message' }

// Others return:
{ error: 'Message', feedback: [...] }

// No standard error codes
```

**Solution:** Create error response utility:

```typescript
// src/lib/api-errors.ts
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public code?: string,
    public details?: any
  ) {
    super(message)
  }
}

export function errorResponse(error: unknown) {
  if (error instanceof ApiError) {
    return NextResponse.json(
      {
        error: error.message,
        code: error.code,
        details: error.details,
      },
      { status: error.statusCode }
    )
  }
  
  console.error('Unexpected error:', error)
  return NextResponse.json(
    { error: 'Internal server error' },
    { status: 500 }
  )
}

// Usage in routes:
try {
  // ... logic
} catch (error) {
  return errorResponse(error)
}
```

---

### 2. Type Safety for API Requests

**Problem:** API request bodies are validated at runtime only:

```typescript
const body = await request.json();
const { password, currentPassword } = body; // No type checking
```

**Solution:** Use Zod for request validation:

```typescript
import { z } from 'zod'

const setPasswordSchema = z.object({
  password: z.string().min(8),
  currentPassword: z.string().optional(),
})

export async function POST(request: NextRequest) {
  const body = await request.json()
  
  // Validate with Zod
  const validation = setPasswordSchema.safeParse(body)
  if (!validation.success) {
    return NextResponse.json(
      { error: 'Invalid request', details: validation.error.issues },
      { status: 400 }
    )
  }
  
  const { password, currentPassword } = validation.data // Typed!
  // ... rest of logic
}
```

---

### 3. Logging and Monitoring

**Problem:** Only `console.log` and `console.error` - no structured logging

**Solution:** Use a proper logger:

```typescript
// src/lib/logger.ts
import pino from 'pino'

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  ...(process.env.NODE_ENV === 'development' && {
    transport: {
      target: 'pino-pretty',
    },
  }),
})

// Usage:
logger.info({ userId, action: 'password_change' }, 'User changed password')
logger.error({ error, userId }, 'Failed to verify SMS code')
```

---

## 📊 RECOMMENDED PRIORITIES

### Immediate (Before Production)
1. 🔴 **Fix WebAuthn challenge storage** - Critical data integrity issue
2. 🔴 **Add rate limiting** - Critical security issue
3. 🟡 **Remove redundant code** - Quick win, reduces confusion
4. 🟢 **Add cleanup jobs** - Prevents database bloat

### Short Term (Next Sprint)
5. 🟡 **Split auth-utils.ts** - Better code organization
6. 🟢 **Add password reset flow** - Expected feature
7. 🟢 **Add auth audit logging** - Security requirement
8. 🔵 **Standardize error handling** - Better DX

### Medium Term (Next Month)
9. 🟡 **Implement repository pattern** - Better architecture
10. 🟡 **SMS provider strategy pattern** - Extensibility
11. 🟢 **Add account lockout** - Security hardening
12. 🔵 **Add environment validation** - Prevents runtime errors

### Long Term (Nice to Have)
13. 🔵 **Structured logging** - Better observability
14. 🔵 **Type-safe API validation** - Better DX

---

## 📝 SUMMARY

### What's Good ✅
- JWT session strategy is working correctly
- Password hashing with bcrypt (12 rounds) is secure
- Error messages don't leak information (good for security)
- Code is generally readable and well-commented
- Prisma schema is well-documented

### What Needs Work 🔧
- WebAuthn challenge storage hack (critical)
- No rate limiting (security risk)
- Too much responsibility in single files (SRP violation)
- Direct database dependencies (DIP violation)
- Missing production features (password reset, audit logs)
- No cleanup jobs (database will grow)

### Overall Assessment
**Grade: B- (Functional but not production-ready)**

The multi-factor authentication works but needs security hardening and architectural improvements before production deployment.

