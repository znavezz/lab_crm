# Bioinformatics Lab CRM

A comprehensive Lab CRM (Customer Relationship Management) system designed for bioinformatics labs. This application helps manage projects, members, equipment scheduling, grants, publications, and more.

This is a [Next.js](https://nextjs.org) project built with a modern, type-safe stack.

---

## 🔬 Tech Stack

* **Framework:** [Next.js](https://nextjs.org/) (React)
* **Language:** [TypeScript](https://www.typescriptlang.org/)
* **API:** [Apollo Server](https://www.apollographql.com/docs/apollo-server/) (GraphQL)
* **ORM:** [Prisma](https://www.prisma.io/)
* **Database:** [PostgreSQL](https://www.postgresql.org/)
* **Auth:** [NextAuth.js (Auth.js)](https://authjs.dev/)
* **UI Components:** [shadcn/ui](https://ui.shadcn.com/) with Radix UI primitives

---

## 🏁 Getting Started

You can run this project directly on your local machine (Option 1) or using the provided Docker setup (Option 2).

### 🚀 Option 1: Local Development Setup

Follow these steps to run the project directly on your machine.

#### 1. Prerequisites

You must have [Node.js](https://nodejs.org/en/) and [PostgreSQL](https://www.postgresql.org/download/) installed on your machine.

#### 2. Installation

1.  Clone the repo:
    ```bash
    git clone [https://github.com/znavezz/lab_crm.git](https://github.com/znavezz/lab_crm.git)
    cd lab_crm
    ```
2.  Install NPM packages:
    ```bash
    npm install --legacy-peer-deps
    ```
    **Note:** The `--legacy-peer-deps` flag is required due to some peer dependency conflicts in the dependency tree.

#### 3. Database Setup

1.  **Create a `.env` file** in the root directory. Copy the contents of `.env.local` (if it exists) or use this template. You **must** fill in your database URL.
    ```env
    # .env
    DATABASE_URL="postgresql://YOUR_USER:YOUR_PASSWORD@localhost:5432/lab_crm"
    
    # NextAuth.js variables
    NEXTAUTH_URL="http://localhost:3000"
    NEXTAUTH_SECRET="your-super-secret-key-here"
    ```

2.  **Run the database migration** to create all tables:
    ```bash
    npx prisma migrate dev
    ```

#### 4. Run the Development Server

Once the database is synced, you can start the app:

```bash
npm run dev
```

### 🐳 Option 2: Docker Development Setup

This is the recommended method as it handles the database and app in isolated containers.

#### 1. Prerequisites

* [Docker](https://www.docker.com/get-started) and Docker Compose are installed.
* You have created a `.env.local` file in the root directory with the necessary environment variables. The `DATABASE_URL` should point to the Docker service name (e.g., `db`).

#### 2. Initial Project Setup

To get the project running for the first time, follow these steps in order:

1.  **Build the Docker images:**
    ```bash
    docker compose build
    ```

2.  **Start the database container:**
    ```bash
    docker compose up -d db
    ```

3.  **Wait ~15 seconds** for the PostgreSQL server to initialize.

4.  **Run the initial migration:** This creates your database tables.
    ```bash
    docker compose run --rm app npx prisma migrate dev
    ```
    * Prisma will ask you to name the migration (e.g., "init").

5.  **Start the application:**
    ```bash
    docker compose up app
    ```
    This will start the application in the foreground.
    * Note: If you want to run the application in the background, you can use the `-d` flag.
    ```bash
    docker compose up -d app
    ```

Your application is now running at **`http://localhost:3000`** with hot-reloading. The database is accessible on your host machine at **`localhost:5433`**.

**Note:** The Dockerfile uses Node 20 and includes `--legacy-peer-deps` flag for npm install to handle peer dependency conflicts. The `.next` directory is created with proper permissions to avoid build manifest errors.

#### 3. Accessing the Database
You can access the database using the Prisma Studio. Run this command from your project folder:
```bash
npx prisma studio
```
This will open the Prisma Studio in your browser.

#### 4. Applying Database Changes (After Setup)

When you edit your **`prisma/schema.prisma`** file, you must apply those changes to the database.

1.  Make sure your containers are already running (`docker compose up -d`).
2.  Open a new terminal and run:
    ```bash
    docker compose exec app npx prisma migrate dev --name your-migration-name
    ```
    *(Replace `your-migration-name` with a short description, like `add-user-age`)*

That's it. Prisma will apply the changes to the database and update the Prisma Client. Your app will automatically restart with the new schema.

#### 5. Shutting Down the Application and Database
When you are finished working and want to shut down your application and database, run this command from your project folder:   
```bash
docker compose down
```
This will stop the application and database containers.

---

## 🔐 Authentication

The application uses [NextAuth.js](https://next-auth.js.org/) for authentication with email/passwordless sign-in.

### Authentication Setup

**Note:** The User model has a nullable `memberId` because `User` (CRM access) and `Member` (lab member) are independent entities:
- A `User` can exist without a `Member` (e.g., external admin, lab manager)
- A `Member` can exist without a `User` (e.g., student without CRM access)
- They can be linked when a User is also a lab Member

**Important:** After pulling this update, you'll need to run a migration to update the schema:
```bash
npx prisma migrate dev --name make-memberid-nullable
```

1. **Configure Email Provider** (Required for passwordless sign-in)

   Add the following environment variables to your `.env` or `.env.local` file:

   ```env
   # Email server configuration (for sending sign-in links)
   EMAIL_SERVER_HOST="smtp.example.com"
   EMAIL_SERVER_PORT=587
   EMAIL_SERVER_USER="your-email@example.com"
   EMAIL_SERVER_PASSWORD="your-email-password"
   EMAIL_FROM="noreply@example.com"
   
   # NextAuth.js configuration
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-super-secret-key-here"
   ```

   **Note:** For development, you can use services like:
   - [Mailtrap](https://mailtrap.io/) (testing)
   - [SendGrid](https://sendgrid.com/) (production)
   - [AWS SES](https://aws.amazon.com/ses/) (production)
   - [Resend](https://resend.com/) (production)

2. **Generate NEXTAUTH_SECRET**

   You can generate a secure secret using:
   ```bash
   openssl rand -base64 32
   ```

3. **Sign In**

   - Navigate to `/auth/signin`
   - Enter your email address
   - Check your email for the sign-in link
   - Click the link to authenticate

### How Authentication Works

1. **User Registration**: When a user signs in for the first time, a `User` record is created in the database. A `Member` profile is NOT automatically created - Users and Members are independent. If a User is also a lab Member, they can be linked later.

2. **Session Management**: Sessions are stored in the database using the `Session` model. The session includes the user's ID, email, and optionally linked `memberId` (if the User is also a lab Member).

3. **GraphQL Integration**: The GraphQL context automatically extracts the authenticated user from the session, making it available to all resolvers via `context.user`. The `context.user.memberId` may be `null` if the User is not linked to a Member. The Apollo Client is configured to include session cookies in all GraphQL requests via `credentials: 'include'` in the HttpLink.

4. **Protected Routes**: You can protect routes and GraphQL operations by checking `context.user` in your resolvers.

### Using Authentication in Your Code

**Server Components / API Routes:**
```typescript
import { getSession, getCurrentUser } from '@/lib/session';

// Get full session
const session = await getSession();

// Get current user
const user = await getCurrentUser();
```

**Client Components:**
```typescript
'use client';
import { useSession } from '@/hooks/use-session';

function MyComponent() {
  const { data: session, status } = useSession();
  
  if (status === 'loading') return <p>Loading...</p>;
  if (!session) return <p>Not authenticated</p>;
  
  return <p>Welcome, {session.user.email}!</p>;
}
```

**GraphQL Resolvers:**
```typescript
export const queries = {
  myData: async (_: unknown, __: unknown, context: GraphQLContext) => {
    if (!context.user) {
      throw new Error('Authentication required');
    }
    // Access context.user.id, context.user.email, context.user.memberId
  },
};
```

---

## 🔧 Troubleshooting

### Build Errors

#### Module not found: Can't resolve '@yaacovcr/transform'

This error occurs when building with Apollo Server. The `@yaacovcr/transform` package is an optional dependency required by Apollo Server 5.x for legacy incremental delivery protocol support.

**Solution:** The package is already included in `package.json`. If you encounter this error:

1. Ensure the package is installed:
   ```bash
   npm install --legacy-peer-deps
   ```

2. The `next.config.ts` file is configured to mark this as an external dependency for server-side builds, so it won't be bundled by webpack but will be available at runtime.

3. For Docker builds, ensure your Dockerfile includes `--legacy-peer-deps` flag (already configured in the provided Dockerfiles).

#### TypeScript Errors: Cannot find module '@/components/ui/button'

This error can occur if the Button component isn't properly typed. The Button component uses `React.forwardRef` for proper TypeScript type resolution.

**Solution:** The component is already configured correctly. If you see this error:
- Restart your TypeScript server in your IDE
- Clear the `.next` directory: `rm -rf .next`
- Rebuild: `npm run build`

### Docker Build Issues

#### Permission Errors with .next Directory

The Dockerfile includes a step to create the `.next` directory with proper permissions:
```dockerfile
RUN mkdir -p /app/.next && chmod -R 777 /app/.next
```

This prevents build manifest errors in Docker containers.

#### Peer Dependency Warnings

The project uses `--legacy-peer-deps` flag for npm install to handle peer dependency conflicts. This is normal and expected.

### Development Setup Issues

#### Database Connection Errors

- **Docker:** Ensure containers are running: `docker compose up -d`
- **Local:** Verify PostgreSQL is running and `DATABASE_URL` in `.env` is correct
- Check that the database exists: `psql -U your_user -d lab_crm`

#### Prisma Client Not Generated

If you see Prisma Client errors:
```bash
npx prisma generate
```

For Docker:
```bash
docker compose exec app npx prisma generate
```

---

## 🧪 Testing

The project includes a comprehensive test suite with **100+ tests** covering database models, relationships, factory methods, and GraphQL resolvers.

### Quick Start

```bash
# Run tests (Docker - recommended)
npm run test:docker

# Run tests (local)
npm test

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage
```

### Test Coverage

- **Database Tests** (37 tests): Models, relationships, constraints
- **Factory Tests** (34 tests): Data generation methods with validation
- **GraphQL Tests** (22 tests): Query resolvers, mutations, computed fields
- **Authentication Tests** (50+ tests): Unit, integration, and E2E tests

For detailed testing documentation, see:
- [tests/README.md](./tests/README.md) - Quick reference
- [tests/TESTING_GUIDE.md](./tests/TESTING_GUIDE.md) - Comprehensive guide
- [tests/DOCKER_TESTING.md](./tests/DOCKER_TESTING.md) - Docker-specific instructions

---

## 📝 Changelog

For a detailed list of changes, bug fixes, and updates, see [CHANGELOG.md](./CHANGELOG.md).

Recent updates include:
- Fixed Button component TypeScript errors
- Resolved Apollo Server build errors
- Updated Dockerfile configurations
- Enhanced Next.js webpack configuration

