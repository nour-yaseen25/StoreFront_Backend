# API Requirements and Database Schema

This file documents the RESTful API endpoints (routes + HTTP verbs) and the database schema used by the StoreFront project.

**API Routes (RESTful)**

- **Users**
  - `GET /users` : List all users
  - `GET /users/:id` : Get a single user by ID
  - `POST /users` : Create a user (body: `{ username, password }`) — returns a JWT token
  - `DELETE /users/:id` : Delete a user by ID
  - `POST /users/authenticate` : Authenticate user (body: `{ username, password }`) — returns user data if successful

- **Articles**
  - `GET /articles` : List all articles
  - `GET /articles/:id` : Get article by ID
  - `POST /articles` : Create an article (body: `{ title, content }`)
  - `DELETE /articles/:id` : Delete an article

- **Mythical Weapons** (auth required for write/delete)
  - `GET /weapons` : List all weapons
  - `GET /weapons/:id` : Get weapon by ID
  - `POST /weapons` : Create a weapon (body: `{ name, type, weight }`) — requires Authorization header `Bearer <token>`
  - `DELETE /weapons/:id` : Delete a weapon by ID — requires Authorization

- **Products**
  - `GET /products` : List all products
  - `GET /products/:id` : Get product by ID
  - `POST /products` : Create a product (body: `{ name, price }`)
  - `DELETE /products/:id` : Delete a product

- **Orders**
  - `GET /orders` : List all orders
  - `GET /orders/:id` : Get order by ID
  - `POST /orders` : Create an order (body: `{ user_id, status }`)
  - `DELETE /orders/:id` : Delete an order
  - `POST /orders/:id/products` : Add a product to an order (body: `{ product_id, quantity }`)

- **Dashboard / Reports**
  - `GET /products_in_orders` : Returns products included in orders (join of orders/products)
  - `GET /five_most_expensive` : Returns five most expensive products
  - `GET /users_with_orders` : Returns users who have orders

**Notes on Authorization & Auth tokens**
- Endpoints under `/weapons` require a valid JWT in the `Authorization: Bearer <token>` header. JWTs are issued when creating users (`POST /users`) using the `TOKEN_SECRET` environment variable.

**Database Schema**

The schema below matches the SQL migration files in `migrations/sqls/`.

- `users` table
  - `id` SERIAL PRIMARY KEY
  - `username` VARCHAR(255) NOT NULL UNIQUE
  - `password` VARCHAR(255) NOT NULL

- `articles` table
  - `id` SERIAL PRIMARY KEY
  - `title` VARCHAR(255) NOT NULL
  - `content` TEXT NOT NULL

- `mythical_weapons` table
  - `id` SERIAL PRIMARY KEY
  - `name` VARCHAR(255) NOT NULL
  - `type` VARCHAR(100) NOT NULL
  - `weight` INTEGER NOT NULL
  - `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP

- `products` table
  - `id` SERIAL PRIMARY KEY
  - `name` VARCHAR(255) NOT NULL
  - `price` DECIMAL(10,2) NOT NULL
  - `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP

- `orders` table
  - `id` SERIAL PRIMARY KEY
  - `user_id` INTEGER NOT NULL (FOREIGN KEY -> `users.id`)
  - `status` VARCHAR(255) NOT NULL
  - `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP

- `order_products` table (join table)
  - `id` SERIAL PRIMARY KEY
  - `order_id` INTEGER NOT NULL (FOREIGN KEY -> `orders.id`)
  - `product_id` INTEGER NOT NULL (FOREIGN KEY -> `products.id`)
  - `quantity` INTEGER NOT NULL
  - `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP

- `books` table (present in migrations but not used by handlers)
  - `id` SERIAL PRIMARY KEY
  - `title` VARCHAR(255) NOT NULL
  - `author` VARCHAR(255) NOT NULL
  - `total_pages` INTEGER
  - `summary` TEXT

Database types chosen above match the project's migrations; these columns support the request/response shapes used by the API endpoints.

If you plan to extend the API, add migrations under `migrations/` and update models/handlers accordingly.
