// tests/auth.test.js
const request = require('supertest');
const app = require('../app');
const mongoose = require('mongoose');
const User = require('../models/user');

// Setup and teardown
beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI_TEST, { useNewUrlParser: true, useUnifiedTopology: true });
});

afterAll(async () => {
  await User.deleteMany({});
  await mongoose.connection.close();
});

describe('Auth Routes', () => {
  const userData = {
    username: 'testuser',
    email: 'testuser@example.com',
    password: 'password123',
  };

  it('should signup a new user', async () => {
    const res = await request(app).post('/api/auth/signup').send(userData);
    expect(res.statusCode).toEqual(201);
    expect(res.body.message).toEqual('User created successfully');
  });

  it('should not signup with existing email', async () => {
    const res = await request(app).post('/api/auth/signup').send(userData);
    expect(res.statusCode).toEqual(500); // Or appropriate error code
  });

  it('should login an existing user', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: userData.email,
      password: userData.password,
    });
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('token');
  });

  it('should not login with incorrect password', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: userData.email,
      password: 'wrongpassword',
    });
    expect(res.statusCode).toEqual(400);
    expect(res.text).toEqual('Invalid credentials');
  });
});
