# Database Setup Guide

This guide will help you set up the database for the AI Chatbot application.

## Prerequisites

Before proceeding, make sure you have:
1. Node.js and pnpm installed
2. A Postgres database (You can use [Neon](https://neon.tech) or any other Postgres provider)

## Steps

1. **Create a Postgres Database**
   - Go to [Neon](https://neon.tech) and create a new project
   - Create a new database in your project
   - Get your database connection string (It should look like: `postgres://user:password@host/database`)

2. **Configure Environment Variables**
   - Copy `.env.example` to `.env.local`
   ```bash
   cp .env.example .env.local
   ```
   - Update `POSTGRES_URL` in `.env.local` with your database connection string

3. **Install Dependencies**
   ```bash
   pnpm install
   ```

4. **Run Database Migrations**
   ```bash
   pnpm db:migrate
   ```
   This will create all necessary tables in your database:
   - User (for authentication)
   - Chat (for storing chat sessions)
   - Message (for storing chat messages)
   - Vote (for message voting)
   - Document (for storing documents)
   - Suggestion (for document suggestions)

5. **Verify Setup**
   
   You can verify your setup in two ways:

   a. Using the verification script (recommended):
   ```bash
   chmod +x scripts/verify-setup.sh
   ./scripts/verify-setup.sh
   ```

   b. Using Drizzle Studio to manually check tables:
   ```bash
   pnpm db:studio
   ```
   This will open Drizzle Studio where you can verify that all tables were created correctly.

## Troubleshooting

1. If you get `POSTGRES_URL is not defined`:
   - Make sure you've created `.env.local`
   - Make sure `POSTGRES_URL` is set correctly in `.env.local`

2. If you get connection errors:
   - Verify your database is running
   - Check if your connection string is correct
   - Make sure your IP is allowed in database firewall settings

## Next Steps

After setting up the database:
1. Start the development server: `pnpm dev`
2. Visit http://localhost:3000
3. You can now register a new user and start using the application

For more details on using the application, refer to the main [README.md](./README.md).
