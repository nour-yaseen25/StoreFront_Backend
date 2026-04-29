/* Replace with your SQL commands */

Create table books (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  author VARCHAR(255) NOT NULL,
  total_pages INTEGER,
  Summary TEXT
);
