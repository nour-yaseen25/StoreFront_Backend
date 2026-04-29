
# StoreFront API

StoreFront is a Node.js, Express, and TypeScript REST API backed by PostgreSQL. It supports local development, database migrations with `db-migrate`, authentication with JWT, and automated tests with Jasmine. The project was primarily developed and verified against a local PostgreSQL installation; Docker is supported as an optional convenience, not a requirement.

## Overview

This API provides the backend for a storefront application and includes routes for users, products, orders, articles, mythical weapons, and dashboard data. The codebase is structured for a typical TypeScript service workflow: source code in `src/`, compiled output in `dist/`, schema migrations under `migrations/`, and test execution through Jasmine.

## Prerequisites

Before you begin, make sure the following are installed:

- Node.js and npm
- PostgreSQL 5432 running locally, or Docker if you prefer the containerized setup
- Git
- A PostgreSQL client such as `psql` is recommended for creating databases and running manual checks

Project ports:

- Backend: `http://localhost:3000`
- PostgreSQL: `localhost:5432`

## Clone And Install

```bash
git clone <repo-url>
cd StoreFront
npm install
```

## Local PostgreSQL Setup Without Docker

The project is expected to connect to a local PostgreSQL server on port `5432`.

1. Install PostgreSQL and make sure the database service is running.
2. Confirm you can connect with your database superuser, usually `postgres`.
3. Create the application databases:

```bash
psql -h 127.0.0.1 -U postgres -c "CREATE DATABASE storefront;"
psql -h 127.0.0.1 -U postgres -c "CREATE DATABASE storefront_test;"
```

4. Make sure the credentials in your `.env` file match the PostgreSQL user and password you intend to use.

Important: `src/database.ts` reads connection details from `.env`, while `db-migrate` uses `database.json`. Keep both files aligned if you change the database user, password, host, or database names.

## Optional Docker Setup

Docker is not required, but you can use it if you want a disposable PostgreSQL container.

1. Make sure Docker and Docker Compose are installed.
2. Create the `.env` file shown below.
3. Start PostgreSQL with Docker Compose:

```bash
docker-compose up -d
```

This exposes PostgreSQL on port `5432`.

If you use Docker, you still need to create the `storefront` and `storefront_test` databases unless your container initialization already does that.

## Environment Variables

Create a `.env` file in the project root with the following values:

```env
ENV=dev
DB_HOST=127.0.0.1
DB_USER=postgres
DB_PASSWORD=12468
DB_NAME=storefront
DB_NAME_TEST=storefront_test
BCRYPT_PEPPER=replace_with_a_secure_pepper
BCRYPT_ROUNDS=10
TOKEN_SECRET=replace_with_a_secure_jwt_secret
```

Variable reference:

- `ENV` controls which database the application uses. When it is `dev`, the app connects to `DB_NAME`. Any other value switches the app to `DB_NAME_TEST`.
- `DB_HOST` is the PostgreSQL host. For a local installation, use `127.0.0.1`.
- `DB_USER` is the PostgreSQL username.
- `DB_PASSWORD` is the PostgreSQL password for that user.
- `DB_NAME` is the development database name used by the app.
- `DB_NAME_TEST` is the test database name used when `ENV=test`.
- `BCRYPT_PEPPER` is appended to passwords before hashing and comparison.
- `BCRYPT_ROUNDS` controls the bcrypt work factor used when hashing passwords.
- `TOKEN_SECRET` is the secret used to sign and verify JWT tokens.

## Database Creation

Create both databases before running migrations:

```bash
psql -h 127.0.0.1 -U postgres -c "CREATE DATABASE storefront;"
psql -h 127.0.0.1 -U postgres -c "CREATE DATABASE storefront_test;"
```

If those databases already exist, you can keep them and proceed to migrations.

## Migrations

Apply migrations for the development database:

```bash
npx db-migrate up
```

Rollback the most recent migration:

```bash
npx db-migrate down
```

Run migrations against the test database:

```bash
npx db-migrate --env test up
```

The `database.json` file contains the `dev` and `test` connection settings used by `db-migrate`.

## Running The API

Development mode with hot reload:

```bash
npm run dev
```

Compile TypeScript:

```bash
npm run build
```

Run the compiled application:

```bash
npm start
```

Run the automated test suite:

```bash
npm test
```

## Testing

The test flow is designed around a separate database and Jasmine.

- Tests run with `ENV=test`.
- The application connects to `DB_NAME_TEST` during test execution.
- Jasmine is the test runner.
- The test script builds the project, runs migrations against `storefront_test`, executes Jasmine, and then drops the test database.

If tests fail unexpectedly, first verify that `storefront_test` exists and that your PostgreSQL credentials are correct.

## Project Structure

- `src/` contains the TypeScript source code for the API, handlers, models, and services.
- `migrations/` contains db-migrate files and the SQL used to create and remove schema objects.
- `database.json` contains the dev and test database connection settings for migrations.
- `docker-compose.yml` provides an optional PostgreSQL container.
- `package.json` defines the scripts used to build, run, and test the project.

## Troubleshooting

If you hit a common setup issue, check the following:

- Database connection errors: confirm PostgreSQL is running, the host is reachable on port `5432`, and `DB_HOST`, `DB_USER`, and `DB_PASSWORD` are correct.
- Wrong password or user: update both `.env` and `database.json` so the application and `db-migrate` use the same credentials.
- Port already in use: stop the process using port `3000` or change the port in `src/server.ts`.
- Migration errors: confirm the target database exists, the user has permission to create tables, and the migration SQL is valid.
- JWT invalid token: verify `TOKEN_SECRET` has not changed. Tokens signed with one secret will not validate against another.

## Security Notes

- Keep `.env` out of version control. The repository already ignores `.env` in `.gitignore`.
- Passwords are hashed with bcrypt before being stored.
- JWT signing and verification use `TOKEN_SECRET`; treat it as a secret value and do not commit it.

## Useful Commands

```bash
npm install
npm run dev
npm run build
npm start
npm test
npx db-migrate up
npx db-migrate down
npx db-migrate --env test up
```

## Notes For Reviewers

The service listens on port `3000` and expects PostgreSQL on port `5432`. If you are validating the project from scratch, the minimum path is: install dependencies, create `storefront` and `storefront_test`, run migrations, and then start the app or execute the test suite.

## Developed By

Nour Ashraf Yaseen

Full Stack JavaScript Developer (In Progress)

GitHub: https://github.com/nour-yaseen25

## Notes / Practice

This project was built incrementally by following the course exercises step by step, with each stage extending the previous one. The files include simple comments to explain each step clearly, which makes the code easier to revisit and understand later.

