# Multi-Factor Authentication Setup Guide

This guide will help you set up and configure the multi-factor authentication system for Lab CRM.

## Overview

Lab CRM supports 4 authentication methods:

1. **Email Magic Link** - Passwordless email authentication (default)
2. **Password** - Traditional email + password authentication
3. **SMS** - Phone number + verification code authentication
4. **Biometric** - WebAuthn-based authentication (Face ID, Touch ID, Windows Hello, etc.)

Users can enable multiple methods and choose their preferred method at signin.

## Installation

The authentication system has been set up with the following components:

### Dependencies

- `next-auth@beta` - NextAuth v5 (Auth.js) for authentication
- `@auth/prisma-adapter` - Prisma adapter for Auth.js
- `@simplewebauthn/server` - WebAuthn server-side library
- `@simplewebauthn/browser` - WebAuthn client-side library
- `bcryptjs` - Password hashing

### Database Schema

The following models have been added to the Prisma schema:

- `User` - Extended with `phone`, `phoneVerified`, and `password` fields
- `Authenticator` - Stores WebAuthn credentials
- `SmsVerificationCode` - Temporary storage for SMS verification codes

## Environment Variables

Copy `.env.example` to `.env.local` and configure the following:

### Required for Basic Setup

```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/lab_crm"

# NextAuth v5
AUTH_SECRET="your_secret_key_here"  # Generate with: openssl rand -base64 32
AUTH_URL="http://localhost:3000"

# Email (for magic links)
EMAIL_SERVER_HOST="smtp.example.com"
EMAIL_SERVER_PORT="587"
EMAIL_SERVER_USER="your-email@example.com"
EMAIL_SERVER_PASSWORD="your-password"
EMAIL_FROM="noreply@example.com"
```

### WebAuthn / Biometric Authentication

```bash
WEBAUTHN_RP_NAME="Lab CRM"
WEBAUTHN_RP_ID="localhost"                    # Use your domain in production
WEBAUTHN_ORIGIN="http://localhost:3000"       # Use your URL in production
```

**Important for Production:**
- `WEBAUTHN_RP_ID` should be your domain (e.g., `example.com`)
- `WEBAUTHN_ORIGIN` should be your full URL (e.g., `https://example.com`)

### Password Authentication

```bash
PASSWORD_MIN_LENGTH="8"  # Minimum password length
```

### SMS Authentication

By default, SMS is in "stub" mode and will only log codes to the console.

```bash
SMS_PROVIDER="stub"  # Options: stub, twilio, aws
```

#### To Enable Twilio SMS:

1. Sign up for a Twilio account at https://www.twilio.com
2. Get your Account SID, Auth Token, and a Twilio phone number
3. Update your `.env.local`:

```bash
SMS_PROVIDER="twilio"
TWILIO_ACCOUNT_SID="your_account_sid"
TWILIO_AUTH_TOKEN="your_auth_token"
TWILIO_PHONE_NUMBER="+1234567890"
```

4. Implement the Twilio integration in `src/lib/sms.ts` (commented code is provided)

#### To Enable AWS SNS SMS:

1. Set up AWS account with SNS permissions
2. Update your `.env.local`:

```bash
SMS_PROVIDER="aws"
AWS_REGION="us-east-1"
AWS_ACCESS_KEY_ID="your_access_key"
AWS_SECRET_ACCESS_KEY="your_secret_key"
```

3. Implement the AWS SNS integration in `src/lib/sms.ts` (commented code is provided)

## Usage

### For Users

#### Signing In

1. Navigate to `/auth/signin`
2. Choose your preferred authentication method:
   - **Email**: Enter email, receive magic link
   - **Password**: Enter email and password
   - **Biometric**: Enter email, use Face ID/Touch ID/Windows Hello
   - **SMS**: Enter phone number, receive and enter verification code

#### Managing Authentication Methods

1. Sign in to your account
2. Navigate to `/dashboard/settings/authentication`
3. Manage your authentication methods:
   - Set up or change password
   - Add or verify phone number
   - Register biometric devices
   - View active authentication methods

### For Administrators

#### Adding New Users

When adding new users, they will initially only have email magic link authentication. They can:

1. Receive an invitation email with a magic link
2. Sign in using the magic link
3. Navigate to authentication settings to set up additional methods

#### Default Authentication Method

Users will see their most recently used authentication method selected by default on the signin page.

## API Routes

The following API routes are available:

### Password Management
- `POST /api/auth/password/set` - Set or change password
- `GET /api/auth/password/check` - Check if user has password

### SMS Authentication
- `POST /api/auth/sms/send` - Send SMS verification code
- `POST /api/auth/sms/verify` - Verify SMS code

### Phone Number Management
- `POST /api/auth/phone/add` - Add phone number to account
- `POST /api/auth/phone/verify` - Verify phone number

### WebAuthn Authentication
- `GET /api/auth/webauthn/register-options` - Get registration options
- `POST /api/auth/webauthn/register` - Register new authenticator
- `POST /api/auth/webauthn/authenticate-options` - Get authentication options
- `POST /api/auth/webauthn/authenticate` - Authenticate with WebAuthn

### Auth Methods Query
- `GET /api/auth/methods` - Get user's enabled authentication methods

## Security Considerations

### Password Security
- Passwords are hashed using bcrypt with 12 salt rounds
- Minimum password requirements enforced:
  - At least 8 characters (configurable)
  - Mix of uppercase, lowercase, numbers, and special characters recommended

### SMS Security
- Verification codes are 6 digits
- Codes expire after 10 minutes
- Rate limiting recommended for production (not implemented yet)

### WebAuthn Security
- Credentials are stored securely in the database
- Challenge/response mechanism prevents replay attacks
- Supports multiple devices per user

### General Security
- All authentication methods are optional
- Users can enable multiple methods for redundancy
- Existing sessions remain valid when adding/removing auth methods

## Troubleshooting

### WebAuthn Not Working

**Issue**: Biometric authentication not available

**Solution**:
1. Ensure you're using HTTPS (required in production)
2. Verify `WEBAUTHN_RP_ID` matches your domain
3. Verify `WEBAUTHN_ORIGIN` matches your URL
4. Check browser compatibility (Chrome, Safari, Firefox, Edge supported)

### SMS Codes Not Sending

**Issue**: SMS codes not being received

**Solution**:
1. Check `SMS_PROVIDER` is set correctly
2. If using Twilio or AWS, verify credentials are correct
3. Check console logs for error messages
4. In stub mode, codes are logged to console (not sent)

### Password Not Accepting

**Issue**: Password requirements not clear

**Solution**:
- Use the password strength indicator when setting passwords
- Ensure all requirements are met (length, uppercase, lowercase, number, special char)

### Migration Issues

**Issue**: Database migration fails

**Solution**:
```bash
# Reset and re-run migrations
npx prisma migrate reset
npx prisma migrate dev
```

## Development vs Production

### Development Setup

In development, you can use:
- `SMS_PROVIDER=stub` (codes logged to console)
- HTTP for local testing
- `WEBAUTHN_RP_ID=localhost`

### Production Setup

For production, ensure:
- Configure real SMS provider (Twilio or AWS)
- Use HTTPS (required for WebAuthn)
- Update `WEBAUTHN_RP_ID` to your domain
- Update `WEBAUTHN_ORIGIN` to your HTTPS URL
- Set strong `AUTH_SECRET`
- Enable rate limiting on auth endpoints

## Migration Path for Existing Users

1. Deploy the update with all new tables migrated
2. Existing users continue using email magic links (no change)
3. Add banner/notification prompting users to set up additional methods
4. Users gradually adopt new authentication methods as needed

No breaking changes - all new features are additive and optional.

