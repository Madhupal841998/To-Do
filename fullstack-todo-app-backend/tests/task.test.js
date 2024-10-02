// tests/task.test.js
const request = require('supertest');
const app = require('../app');
const mongoose = require('mongoose');
const User = require('../models/user');
const Task = require('../models/task');
const jwt = require('jsonwebtoken');

let token;
let userId;

// Setup and teardown
beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI_TEST, { useNewUrlParser: true, useUnifiedTopology: true });
  const user = new User({
    username: 'testuser2',
    email: 'testuser2@example.com',
    password: 'password123',
  });
  await user.save();
  userId = user._id;
  token = jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '1h' });
});

afterAll(async () => {
  await User.deleteMany({});
  await Task.deleteMany({});
  await mongoose.connection.close();
});

describe('Task Routes', () => {
  let taskId;

  it('should create a new task', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .set('x-auth-token', token)
      .send({ title: 'Test Task' });
    expect(res.statusCode).toEqual(201);
    expect(res.body.title).toEqual('Test Task');
    taskId = res.body._id;
  });

  it('should fetch all tasks for the user', async () => {
    const res = await request(app)
      .get('/api/tasks')
      .set('x-auth-token', token);
    expect(res.statusCode).toEqual(200);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('should update a task', async () => {
    const res = await request(app)
      .put(`/api/tasks/${taskId}`)
      .set('x-auth-token', token)
      .send({ title: 'Updated Task', status: true });
    expect(res.statusCode).toEqual(200);
    expect(res.body.title).toEqual('Updated Task');
    expect(res.body.status).toEqual(true);
  });

  it('should delete a task', async () => {
    const res = await request(app)
      .delete(`/api/tasks/${taskId}`)
      .set('x-auth-token', token);
    expect(res.statusCode).toEqual(200);
    expect(res.body.message).toEqual('Task deleted successfully');
  });
});
