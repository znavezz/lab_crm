# Multi-Factor Authentication Testing Guide

This document outlines the testing strategy and test cases for the multi-factor authentication system.

## Test Coverage

### Unit Tests

#### ✅ Implemented: `tests/auth-utils.test.ts`

Tests for authentication utility functions:

- **Password Utilities**
  - Password hashing (bcrypt)
  - Password verification
  - Password strength checking
  - Password requirements validation

- **Phone Number Utilities**
  - Phone number validation
  - Phone number formatting (E.164)
  - Phone number sanitization

- **SMS Code Utilities**
  - SMS code generation (6 digits)
  - SMS code verification
  - Code expiration handling

- **General Utilities**
  - Email sanitization
  - Phone number sanitization

**Run Unit Tests:**
```bash
npm test tests/auth-utils.test.ts
```

### Integration Tests (TODO)

The following integration tests should be implemented:

#### API Route Tests

**Password Authentication**
- `POST /api/auth/password/set`
  - Set password for first time
  - Change existing password
  - Validate current password when changing
  - Reject weak passwords
  - Require authentication

- `GET /api/auth/password/check`
  - Check if user has password
  - Require authentication

**SMS Authentication**
- `POST /api/auth/sms/send`
  - Send SMS code
  - Validate phone number
  - Reject invalid phone numbers
  - Create verification code in database
  - Handle stub mode correctly

- `POST /api/auth/phone/add`
  - Add phone number to account
  - Reject duplicate phone numbers
  - Send verification code
  - Require authentication

- `POST /api/auth/phone/verify`
  - Verify phone with correct code
  - Reject incorrect code
  - Reject expired code
  - Mark phone as verified
  - Require authentication

**WebAuthn Authentication**
- `GET /api/auth/webauthn/register-options`
  - Generate registration options
  - Require authentication
  - Exclude existing credentials

- `POST /api/auth/webauthn/register`
  - Register new authenticator
  - Verify registration response
  - Store credential in database
  - Require authentication

- `POST /api/auth/webauthn/authenticate-options`
  - Generate authentication options
  - Include user's credentials
  - Work without authentication

- `POST /api/auth/webauthn/authenticate`
  - Verify authentication response
  - Update authenticator counter
  - Return success status

**Auth Methods Query**
- `GET /api/auth/methods`
  - Return user's enabled methods
  - Show verification status
  - Include device counts
  - Require authentication

#### NextAuth Integration Tests

**Email Magic Link**
- Sign in with email
- Receive magic link
- Follow link to authenticate
- Create session

**Password Provider**
- Sign in with email and password
- Reject incorrect password
- Reject non-existent user
- Create session

**SMS Provider**
- Sign in with phone and code
- Reject incorrect code
- Reject expired code
- Create session

### End-to-End Tests (TODO)

The following E2E tests should be implemented using Playwright:

#### Sign In Flow

**Email Magic Link**
1. Navigate to signin page
2. Enter email
3. Submit form
4. Check for success message
5. (Mock email sending in test)

**Password Authentication**
1. Navigate to signin page
2. Switch to password tab
3. Enter email and password
4. Submit form
5. Verify redirect to dashboard

**SMS Authentication**
1. Navigate to signin page
2. Switch to SMS tab
3. Enter phone number
4. Submit to send code
5. Enter verification code
6. Submit to sign in
7. Verify redirect to dashboard

**Biometric Authentication**
1. Navigate to signin page
2. Switch to biometric tab
3. Enter email
4. Click biometric button
5. (Mock WebAuthn browser API)
6. Verify redirect to dashboard

#### Settings Page Flow

**Password Management**
1. Sign in
2. Navigate to settings/authentication
3. Click "Set Up Password"
4. Enter new password
5. Confirm password
6. Submit form
7. Verify success message
8. Verify password enabled in methods list

**Phone Number Management**
1. Sign in
2. Navigate to settings/authentication
3. Click "Add Phone Number"
4. Enter phone number
5. Submit to send code
6. Enter verification code
7. Submit to verify
8. Verify phone enabled and verified

**Biometric Device Management**
1. Sign in
2. Navigate to settings/authentication
3. Click "Add New Device"
4. (Mock WebAuthn registration)
5. Verify device appears in list
6. Test removing device

#### Tab Persistence
1. Sign in with one method
2. Sign out
3. Return to signin page
4. Verify last-used tab is selected

### Manual Testing Checklist

#### Password Authentication

- [ ] Set password for first time
- [ ] Change existing password
- [ ] Password strength indicator works
- [ ] All password requirements enforced
- [ ] Sign in with password works
- [ ] Incorrect password rejected
- [ ] Password field shows/hides properly

#### Phone/SMS Authentication

- [ ] Add phone number
- [ ] Receive SMS code (or see stub log)
- [ ] Verify phone with code
- [ ] Incorrect code rejected
- [ ] Expired code rejected
- [ ] Resend code works
- [ ] Sign in with SMS works
- [ ] Countdown timer works

#### Biometric Authentication

- [ ] Register device (Face ID/Touch ID/Windows Hello)
- [ ] Device appears in settings
- [ ] Sign in with biometric works
- [ ] Multiple devices can be registered
- [ ] Device names are descriptive
- [ ] Works on different browsers
- [ ] Requires HTTPS in production

#### General UI/UX

- [ ] All tabs work correctly
- [ ] Tab persistence works
- [ ] Error messages are clear
- [ ] Loading states work
- [ ] Success messages appear
- [ ] Forms reset properly
- [ ] Cancel buttons work
- [ ] Responsive on mobile
- [ ] Dark mode works
- [ ] Keyboard navigation works

### Browser Compatibility

Test WebAuthn on:
- [ ] Chrome/Chromium
- [ ] Safari (macOS/iOS)
- [ ] Firefox
- [ ] Edge
- [ ] Mobile browsers

### Security Testing

- [ ] Passwords are hashed (not stored plain text)
- [ ] SMS codes expire after 10 minutes
- [ ] Old SMS codes are invalidated when new one sent
- [ ] WebAuthn challenges are validated
- [ ] API routes require authentication where needed
- [ ] No sensitive data in client-side code
- [ ] Rate limiting works (when implemented)

## Running Tests

### Unit Tests
```bash
npm test
```

### Specific Test File
```bash
npm test tests/auth-utils.test.ts
```

### With Coverage
```bash
npm run test:coverage
```

### E2E Tests (when implemented)
```bash
npm run test:e2e
```

## Test Environment Setup

For integration tests, ensure:
1. Database is running
2. Test database is configured
3. Environment variables are set
4. SMS is in stub mode for tests

## Known Limitations

1. **WebAuthn Testing**: Mocking WebAuthn in automated tests is complex. Manual testing is recommended for biometric authentication.

2. **Email Sending**: Email magic links require email server mocking in tests.

3. **SMS Sending**: SMS is tested in stub mode. Real SMS provider testing should be done manually.

4. **Rate Limiting**: Not yet implemented. Should be added before production.

## Future Testing Improvements

1. Add integration tests for all API routes
2. Add E2E tests for all user flows
3. Add performance tests for password hashing
4. Add security tests for authentication flows
5. Add tests for concurrent authentication attempts
6. Add tests for session management
7. Mock WebAuthn for automated testing
8. Add tests for migration scenarios

## Test Data

Use these test credentials for manual testing:

**Users (create via settings page):**
- Email: `test@example.com`
- Password: `TestPass123!`
- Phone: `+1234567890`

**In stub mode, SMS codes are:**
- Logged to console
- Displayed in alert (development only)
- Not actually sent

