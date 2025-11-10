# Bioinformatics Lab CRM

A comprehensive Lab CRM (Customer Relationship Management) system designed for bioinformatics labs. This application helps manage projects, members, equipment scheduling, grants, publications, and more.

This is a [Next.js](https://nextjs.org) project built with a modern, type-safe stack.

---

## 🚀 Tech Stack

* **Framework:** [Next.js](https://nextjs.org/) (React)
* **Language:** [TypeScript](https://www.typescriptlang.org/)
* **API:** [Apollo Server](https://www.apollographql.com/docs/apollo-server/) (GraphQL)
* **ORM:** [Prisma](https://www.prisma.io/)
* **Database:** [PostgreSQL](https://www.postgresql.org/)
* **Auth:** [NextAuth.js (Auth.js)](https://authjs.dev/)

---

## 🏁 Getting Started

To get a local copy up and running, follow these steps.

### 1. Prerequisites

You must have [Node.js](https://nodejs.org/en/) and [PostgreSQL](https://www.postgresql.org/download/) installed on your machine.

### 2. Installation

1.  Clone the repo:
    ```bash
    git clone [https://your-repository-url.git](https://your-repository-url.git)
    cd lab_crm
    ```
2.  Install NPM packages:
    ```bash
    npm install
    ```

### 3. Database Setup

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

### 4. Run the Development Server

Once the database is synced, you can start the app:

```bash
npm run dev