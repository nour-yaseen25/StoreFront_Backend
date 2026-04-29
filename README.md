
# StoreFront — Node.js + Express + PostgreSQL API

This repository is an API backend implemented with Node.js, Express, and PostgreSQL. This README provides a clear, step-by-step guide to get the project running from zero, including database creation, migrations, Docker usage, environment variables, common commands, and troubleshooting tips.

## Quick summary
- Backend: http://localhost:3000
- Postgres: localhost:5432
- Main commands:
	- Install dependencies: `npm install`
	- Start dev server: `npm run dev`
	- Build: `npm run build`
	- Start built app: `npm start`
	- Run tests: `npm test`

## Prerequisites
- Git
- Node.js (v16+ recommended)
- npm (bundled with Node.js)
- Docker & Docker Compose (recommended for local Postgres)

If you cannot use Docker, install PostgreSQL locally and ensure it listens on `127.0.0.1:5432` or update `DB_HOST` accordingly.

## Repository layout (important files)
- `src/` — TypeScript source code (server, handlers, models)
- `migrations/` — db-migrate migrations and SQL files
- `database.json` — db-migrate connection configurations (dev/test)
- `docker-compose.yml` — convenience setup for Postgres
- `package.json` — npm scripts and dependencies

## Environment variables
Copy or create a `.env` file in the project root. Example `.env` (do not commit secrets):

```
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

- `ENV` — if set to `dev` the app connects to `DB_NAME`; otherwise it uses `DB_NAME_TEST` (see `src/database.ts`).
- `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DB_NAME_TEST` — Postgres connection settings.
- `BCRYPT_PEPPER`, `BCRYPT_ROUNDS` — used for hashing passwords in `src/models/user.ts`.
- `TOKEN_SECRET` — used to sign and verify JWT tokens for protected endpoints.

Ensure environment variables are available when running the server (the code uses `dotenv`).

## Setup from zero (recommended: Docker)

1. Clone the repo and change into it:

```bash
git clone <repo-url>
cd StoreFront
```

2. Create `.env` as shown above (update values as required).

3. Start Postgres via Docker Compose:

```bash
docker-compose up -d
```

This will run a Postgres container and expose port `5432` on the host. The `docker-compose.yml` in this project maps container port `5432` to host `5432`.

4. Install dependencies:

```bash
npm install
```

5. Create the databases used by the app (two databases: `storefront` and `storefront_test`). You can create them with `psql` from the host or using Docker:

Using `psql` locally (example):

```bash
# connect as postgres user
psql -h 127.0.0.1 -U postgres -c "CREATE DATABASE storefront;"
psql -h 127.0.0.1 -U postgres -c "CREATE DATABASE storefront_test;"
```

Or from inside the running Postgres container:

```bash
docker exec -it $(docker ps -q -f "ancestor=postgres") psql -U postgres -c "CREATE DATABASE storefront;"
docker exec -it $(docker ps -q -f "ancestor=postgres") psql -U postgres -c "CREATE DATABASE storefront_test;"
```

6. Run migrations to create the schema:

```bash
npx db-migrate up
```

This uses `database.json` to connect to the `dev` database. To run migrations against the `test` environment (if required):

```bash
npx db-migrate --env test up
```

7. Start the dev server:

```bash
npm run dev
```

Server will be available at `http://localhost:3000`.

## Commands reference
- `npm install` — install dependencies
- `npm run dev` — start development server using `ts-node` + `nodemon` (hot reload)
- `npm run build` — transpile TypeScript to `dist/` (`npx tsc`)
- `npm start` — run `node dist/server.js` (use after `npm run build`)
- `npx db-migrate up` — apply migrations (use `--env test` for test DB)
- `npx db-migrate down` — rollback last migration
- `npm test` — runs test flow defined in `package.json` (build, migrate test DB, run Jasmine tests, drop test DB)

## Migration flow
1. Create/modify SQL migration files under `migrations/sqls/` and corresponding migration wrapper in `migrations/`.
2. Run `npx db-migrate up` to apply migrations.
3. Verify schema with `psql` or a DB client.
4. To rollback a migration: `npx db-migrate down`.

Notes:
- `database.json` contains connection configuration for `dev` and `test`. Keep it synchronized with your `.env` or adjust `db-migrate` options if you prefer environment-driven config.

## Troubleshooting
Below are common issues and recommended fixes.

- Database connection refused / cannot connect
	- Ensure Postgres is running and reachable at `DB_HOST:5432`.
	- Confirm credentials (`DB_USER`, `DB_PASSWORD`) match the Postgres instance.
	- If using Docker, check `docker-compose ps` and container logs: `docker-compose logs postgres`.

- Port 3000 already in use
	- Check for running processes using port 3000: on Windows `netstat -ano | findstr :3000`, then stop the process or change the `port` constant in `src/server.ts`.

- Missing environment variables
	- The app depends on `DB_*`, `BCRYPT_*`, and `TOKEN_SECRET`. If they are missing, create a `.env` file and restart the server.

- Migrations fail with permissions or relation errors
	- Verify the target database exists and the connecting user has permissions to create tables.
	- Inspect the SQL in `migrations/sqls/` for syntax errors.

- Tests failing due to DB state
	- The test script runs migrations against `storefront_test`. Ensure that DB exists and credentials are correct.

- JWT / auth failures
	- Ensure `TOKEN_SECRET` matches the secret used to sign tokens. Tokens created with a different secret will not verify.

If you encounter an error not covered here, paste the full error and the command you ran and we can investigate further.

## Production considerations (brief)
- Do not store secrets in `.env` files in source control. Use a secrets manager or environment config on the host.
- Configure connection pooling and TLS for production Postgres connections.
- Use a process manager (PM2, systemd) or a container orchestration platform to run the built app.

## Further reading
- See `src/` for handlers, models and the data access patterns used in this project.

---
If you want, I can also add a `.env.example` file and a short `CONTRIBUTING.md` with development guidelines.

