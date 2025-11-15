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
    npm install
    ```

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

