# Complete Repository Pattern Refactoring

## ✅ What's Done

1. ✅ Repository interfaces created
2. ✅ Prisma repositories implemented  
3. ✅ Factory pattern implemented
4. ✅ Password API routes refactored

## 📝 Remaining Work (30 minutes)

### Phone API Routes

Replace in `/src/app/api/auth/phone/add/route.ts`:
```typescript
// OLD:
import { prisma } from '@/lib/prisma';
const existingUser = await prisma.user.findFirst({...});
await prisma.user.update({...});
await prisma.smsVerificationCode.deleteMany({...});
await prisma.smsVerificationCode.create({...});

// NEW:
import { getRepositories } from '@/repositories/factory';
const { user: userRepo, smsCode: smsRepo } = getRepositories();
const existingUser = await userRepo.findByPhone(phone);
await userRepo.updatePhone(session.user.id, sanitizedPhone, false);
await smsRepo.deleteByUserId(session.user.id);
await smsRepo.create({ userId: session.user.id, code, expiresAt });
```

Replace in `/src/app/api/auth/phone/verify/route.ts`:
```typescript
// OLD:
import { prisma } from '@/lib/prisma';
const smsCode = await prisma.smsVerificationCode.findFirst({...});
await prisma.smsVerificationCode.update({...});
await prisma.user.update({...});

// NEW:
import { getRepositories } from '@/repositories/factory';
const { user: userRepo, smsCode: smsRepo } = getRepositories();
const smsCode = await smsRepo.findLatestByUserId(session.user.id);
await smsRepo.markAsVerified(smsCode.id);
const user = await userRepo.findById(session.user.id);
await userRepo.updatePhone(session.user.id, user.phone!, true);
```

### SMS API Routes

Replace in `/src/app/api/auth/sms/send/route.ts`:
```typescript
// OLD:
import { prisma } from '@/lib/prisma';
const user = await prisma.user.findFirst({...});
await prisma.smsVerificationCode.deleteMany({...});
await prisma.smsVerificationCode.create({...});

// NEW:
import { getRepositories } from '@/repositories/factory';
const { user: userRepo, smsCode: smsRepo } = getRepositories();
const user = await userRepo.findByPhone(sanitizedPhone);
await smsRepo.deleteByUserId(user.id);
await smsRepo.create({ userId: user.id, code, expiresAt });
```

### WebAuthn API Routes

Replace in `/src/app/api/auth/webauthn/register-options/route.ts`:
```typescript
// OLD:
import { prisma } from '@/lib/prisma';
const user = await prisma.user.findUnique({...});
await prisma.webAuthnChallenge.deleteMany({...});
await prisma.webAuthnChallenge.create({...});

// NEW:
import { getRepositories } from '@/repositories/factory';
const { user: userRepo, webauthn: webauthnRepo } = getRepositories();
const user = await userRepo.findById(session.user.id);
await webauthnRepo.deleteUserChallenges(user.id, 'registration');
await webauthnRepo.createChallenge({
  userId: user.id,
  challenge: options.challenge,
  type: 'registration',
  expiresAt,
});
```

Similar patterns for:
- `/src/app/api/auth/webauthn/register/route.ts`
- `/src/app/api/auth/webauthn/authenticate-options/route.ts`
- `/src/app/api/auth/webauthn/authenticate/route.ts`

### auth.ts Providers

Replace in `/src/lib/auth.ts`:
```typescript
// In password provider:
import { getUserRepository } from '@/repositories/factory';
const userRepo = getUserRepository();
const user = await userRepo.findByEmail(credentials.email);

// In SMS provider:
const user = await userRepo.findByPhone(credentials.phone);
const smsRepo = getSmsCodeRepository();
const smsCode = await smsRepo.findLatestByUserId(user.id);
await smsRepo.markAsVerified(smsCode.id);
```

### Cleanup Job

Replace in `/src/lib/jobs/cleanup-auth.ts`:
```typescript
// OLD:
import { prisma } from '@/lib/prisma';
await prisma.smsVerificationCode.deleteMany({...});
await prisma.webAuthnChallenge.deleteMany({...});

// NEW:
import { getRepositories } from '@/repositories/factory';
const { smsCode: smsRepo, webauthn: webauthnRepo } = getRepositories();
const smsCodesDeleted = await smsRepo.deleteExpired();
const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
const verifiedDeleted = await smsRepo.deleteVerifiedOlderThan(oneDayAgo);
const webAuthnDeleted = await webauthnRepo.deleteExpiredChallenges();
```

## 🧪 Testing After Refactor

```bash
# 1. Rebuild Docker
docker-compose down
docker-compose up --build -d

# 2. Test authentication flows
# - Sign in with password
# - Sign in with SMS
# - Register WebAuthn device
# - Sign out

# 3. Verify no errors in logs
docker-compose logs app --tail=100
```

## 🚀 Future: Adding Lab Server Implementation

When ready to deploy to lab server, create these files:

```bash
src/repositories/lab/
├── LabApiUserRepository.ts
├── LabApiSmsCodeRepository.ts
└── LabApiWebAuthnRepository.ts
```

Each should implement the interface and call lab server API.

Then just change `.env.local`:
```bash
DATABASE_TYPE=lab-api
LAB_API_URL=https://lab-server.edu/api
LAB_API_KEY=your-api-key
```

**Zero code changes needed in API routes!** ✅

## 📊 SOLID Compliance

| Principle | Before | After |
|-----------|--------|-------|
| **S**ingle Responsibility | ❌ Routes do data access | ✅ Repositories handle data |
| **O**pen/Closed | ❌ Can't extend | ✅ Add implementations easily |
| **L**iskov Substitution | ❌ Can't substitute | ✅ Any repo works |
| **I**nterface Segregation | ❌ No interfaces | ✅ Clean interfaces |
| **D**ependency Inversion | ❌ Depend on concrete | ✅ Depend on abstract |

**Grade: D → A** 🎉

