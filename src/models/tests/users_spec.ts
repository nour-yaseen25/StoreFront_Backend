import request from 'supertest'; // Importing the request function from supertest to make HTTP requests to our server
import app from '../../server';
import client from '../../database';
import jsonwebtoken from 'jsonwebtoken';

describe('Users API Endpoints', () => {
  let token: string;
  let createdUserId: string;

  beforeEach(async () => {
    // Clean the users table before each test
    const conn = await client.connect();
    await conn.query('TRUNCATE TABLE users RESTART IDENTITY CASCADE');
    conn.release();
  });

  // POST /users - Create a user
  describe('POST /users', () => {
    it('should create a user and return a JWT token', async () => {
      const response = await request(app)
        .post('/users')
        .send({
          username: 'testuser',
          password: 'password123'
        });

      expect(response.status).toBe(200);
      expect(response.body).toBeDefined();
      expect(typeof response.body).toBe('string'); // JWT token is a string
      
      // Decode the token to verify it contains the user
      const decoded: any = jsonwebtoken.decode(response.body);
      expect(decoded).toBeDefined();
      expect(decoded.user).toBeDefined();
      expect(decoded.user.username).toBe('testuser');
      expect(decoded.user.id).toBeDefined();
      
      // Store the token and user ID for later tests
      token = response.body;
      createdUserId = decoded.user.id;
    });

    it('should reject a duplicate username', async () => {
      // Create first user
      await request(app)
        .post('/users')
        .send({
          username: 'duplicateuser',
          password: 'password123'
        });

      // Try to create user with same username
      const response = await request(app)
        .post('/users')
        .send({
          username: 'duplicateuser',
          password: 'password456'
        });

      expect(response.status).toBe(400);
    });

    it('should require username field', async () => {
      const response = await request(app)
        .post('/users')
        .send({
          password: 'password123'
        });

      expect(response.status).toBe(400);
    });

    it('should require password field', async () => {
      const response = await request(app)
        .post('/users')
        .send({
          username: 'testuser'
        });

      expect(response.status).toBe(400);
    });
  });

  // GET /users - List all users
  describe('GET /users', () => {
    it('should return an empty array when no users exist', async () => {
      const response = await request(app)
        .get('/users');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(0);
    });

    it('should return an array of users', async () => {
      // Create a test user
      await request(app)
        .post('/users')
        .send({
          username: 'user1',
          password: 'password1'
        });

      await request(app)
        .post('/users')
        .send({
          username: 'user2',
          password: 'password2'
        });

      const response = await request(app)
        .get('/users');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(2);
      expect(response.body[0].username).toBeDefined();
      expect(response.body[0].id).toBeDefined();
      expect(response.body[1].username).toBeDefined();
      expect(response.body[1].id).toBeDefined();
    });

    it('should not include password in response', async () => {
      // Create a test user
      await request(app)
        .post('/users')
        .send({
          username: 'testuser',
          password: 'password123'
        });

      const response = await request(app)
        .get('/users');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body[0].password).toBeDefined(); // password is hashed and stored
      // Verify the password is not the plaintext version
      expect(response.body[0].password).not.toBe('password123');
    });
  });

  // GET /users/:id - Get a specific user
  describe('GET /users/:id', () => {
    it('should return a specific user by ID', async () => {
      // Create a test user
      const createResponse = await request(app)
        .post('/users')
        .send({
          username: 'specificuser',
          password: 'password123'
        });

      const decoded: any = jsonwebtoken.decode(createResponse.body);
      const userId = decoded.user.id;

      const response = await request(app)
        .get(`/users/${userId}`);

      expect(response.status).toBe(200);
      expect(response.body).toBeDefined();
      expect(response.body.id).toBe(userId);
      expect(response.body.username).toBe('specificuser');
    });

    it('should return 400 when user is not found', async () => {
      const response = await request(app)
        .get('/users/999999');

      expect(response.status).toBe(400);
    });

    it('should handle invalid user ID gracefully', async () => {
      const response = await request(app)
        .get('/users/invalid_id');

      expect(response.status).toBe(400);
    });
  });

  // DELETE /users/:id - Delete a user
  describe('DELETE /users/:id', () => {
    it('should delete a user by ID', async () => {
      // Create a test user
      const createResponse = await request(app)
        .post('/users')
        .send({
          username: 'usertoDelete',
          password: 'password123'
        });

      const decoded: any = jsonwebtoken.decode(createResponse.body);
      const userId = decoded.user.id;

      // Delete the user
      const deleteResponse = await request(app)
        .delete(`/users/${userId}`);

      expect(deleteResponse.status).toBe(200);
      expect(deleteResponse.body.id).toBe(userId);

      // Verify user is actually deleted
      const getResponse = await request(app)
        .get(`/users/${userId}`);

      expect(getResponse.status).toBe(400);
    });

    it('should return 400 when deleting non-existent user', async () => {
      const response = await request(app)
        .delete('/users/999999');

      expect(response.status).toBe(400);
    });
  });

  // POST /users/authenticate - Authenticate user
  describe('POST /users/authenticate', () => {
    it('should authenticate with correct credentials', async () => {
      // Create a test user
      await request(app)
        .post('/users')
        .send({
          username: 'authuser',
          password: 'correctpassword'
        });

      const response = await request(app)
        .post('/users/authenticate')
        .send({
          username: 'authuser',
          password: 'correctpassword' 
        });

      expect(response.status).toBe(200);
      expect(response.body).toBeDefined();
      expect(response.body.id).toBeDefined();
      expect(response.body.username).toBe('authuser');
    });

    it('should reject incorrect password', async () => {
      // Create a test user
      await request(app) 
        .post('/users') 
        .send({
          username: 'authuser',
          password: 'correctpassword'
        });

      const response = await request(app)
        .post('/users/authenticate')
        .send({
          username: 'authuser',
          password: 'wrongpassword'
        });

      expect(response.status).toBe(401);
      expect(response.body.error).toBeDefined();
    });

    it('should reject non-existent user', async () => {
      const response = await request(app)
        .post('/users/authenticate')
        .send({
          username: 'nonexistentuser',
          password: 'anypassword'
        });

      expect(response.status).toBe(401);
      expect(response.body.error).toBeDefined();
    });

    it('should require username', async () => {
      const response = await request(app)
        .post('/users/authenticate')
        .send({
          password: 'somepassword'
        });

      expect(response.status).toBe(400);
    });

    it('should require password', async () => {
      const response = await request(app)
        .post('/users/authenticate')
        .send({
          username: 'someuser'
        });

      expect(response.status).toBe(400);
    });
  });

  // Integration tests
  describe('User Workflow Integration', () => {
    it('should complete a full user creation and retrieval workflow', async () => {
      // 1. Create a user
      const createResponse = await request(app)
        .post('/users')
        .send({
          username: 'integrationuser',
          password: 'integrationpass'
        });

      expect(createResponse.status).toBe(200);
      const token = createResponse.body;
      const decoded: any = jsonwebtoken.decode(token);
      const userId = decoded.user.id;

      // 2. Retrieve all users
      const indexResponse = await request(app)
        .get('/users');

      expect(indexResponse.status).toBe(200);
      expect(indexResponse.body.length).toBeGreaterThan(0);
      const foundUser = indexResponse.body.find((u: any) => u.id === userId);
      expect(foundUser).toBeDefined();
      expect(foundUser.username).toBe('integrationuser');

      // 3. Retrieve specific user
      const showResponse = await request(app)
        .get(`/users/${userId}`);

      expect(showResponse.status).toBe(200);
      expect(showResponse.body.id).toBe(userId);
      expect(showResponse.body.username).toBe('integrationuser');

      // 4. Authenticate user
      const authResponse = await request(app)
        .post('/users/authenticate')
        .send({
          username: 'integrationuser',
          password: 'integrationpass'
        });

      expect(authResponse.status).toBe(200);
      expect(authResponse.body.username).toBe('integrationuser');

      // 5. Delete user
      const deleteResponse = await request(app)
        .delete(`/users/${userId}`);

      expect(deleteResponse.status).toBe(200);

      // 6. Verify user is deleted
      const finalResponse = await request(app)
        .get('/users');

      expect(finalResponse.status).toBe(200);
      expect(finalResponse.body.length).toBe(0);
    });
  });
});
