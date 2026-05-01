
# StoreFront API

StoreFront is a Node.js, Express, and TypeScript REST API backed by PostgreSQL. It supports local development, database migrations with `db-migrate`, authentication with JWT, and automated tests with Jasmine. The project was primarily developed and verified against a local PostgreSQL installation; Docker is supported as an optional convenience, not a requirement.

## Overview

This API provides the backend for a storefront application and includes routes for users, products, orders, articles, mythical weapons, and dashboard data. The codebase is structured for a typical TypeScript service workflow: source code in `src/`, compiled output in `dist/`, schema migrations under `migrations/`, and test execution through Jasmine.

## Technologies & Packages Used

- Node.js: The runtime environment used to run the server-side JavaScript application.
- Express: The web framework used to build the RESTful API routes and handle HTTP requests and responses.
- TypeScript: Adds static typing and better tooling, which improves code quality and makes the backend easier to maintain.
- PostgreSQL: The relational database used to store application data such as users, products, orders, and articles.
- `pg`: The PostgreSQL client library used by the Node.js app to connect to and query the database.
- `db-migrate`: Used to create, run, and roll back database migrations so the schema stays consistent across environments.
- `dotenv`: Loads environment variables from the `.env` file so local development settings stay outside the source code.
- `bcrypt`: Hashes user passwords before storing them, which improves security.
- JSON Web Token (JWT): Used to sign authentication tokens and protect secure routes.
- Jasmine: The test framework used to run the model and endpoint specs.
- Supertest: Used to test API endpoints through HTTP requests without starting a real server.
- `nodemon` / `ts-node`: Development tools that make local work easier by restarting the server automatically and running TypeScript files directly.

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

The test flow is designed around a separate database, Jasmine, and Supertest.

- Model tests verify the store classes in `src/models/`.
- Endpoint tests verify the HTTP routes for users, products, and orders.
- All API routes defined in `REQUIREMENTS.md` are covered by at least one test across the suite.
- Jasmine is the test framework used to run the specs.
- Supertest is used to exercise the Express endpoints without starting a real server.
- Test execution uses the separate PostgreSQL database `storefront_test`.

How the test workflow runs:

1. The test script sets `ENV=test`.
2. The application reads `DB_NAME_TEST` from `.env` and connects to the test database.
3. Migrations run before the specs so the test schema is always created from scratch.
4. The specs clean tables with `TRUNCATE` to keep each test isolated.
5. Supertest imports the exported Express `app`, so the server itself is not started during tests.

If tests fail unexpectedly, first verify that `storefront_test` exists, your PostgreSQL credentials are correct, and the `.env` values match `database.json`.

## Endpoint Testing

Every API endpoint has at least one associated test in the Jasmine suite.

The endpoint specs validate both response bodies and HTTP status codes so the tests cover more than simple route existence. In practice, this means the suite checks that successful requests return the expected data and that basic error cases return the proper status when applicable.

The endpoint coverage includes users, products, orders, articles, mythical weapons, and dashboard routes, including protected flows that require a valid JWT where applicable.

## Server Behavior for Testing

The server uses `require.main === module` in `src/server.ts` so the app only calls `listen()` when the file is executed directly.

This matters for tests because Supertest imports the Express app object directly. If the server started automatically during import, the test suite would open an extra listener and make isolation harder. With the current setup, the app can be tested in memory while normal `npm start` behavior still works as expected.

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

