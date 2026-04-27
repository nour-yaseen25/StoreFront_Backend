/* Replace with your SQL commands */
Create table orders (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  status VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
