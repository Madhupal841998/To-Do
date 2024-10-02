// src/components/Signup.test.js
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Signup from './Signup';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from '../redux/store';
import axios from 'axios';

// Mock axios
jest.mock('axios');

describe('Signup Component', () => {
  test('renders signup form', () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Signup />
        </BrowserRouter>
      </Provider>
    );

    expect(screen.getByText(/signup/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /signup/i })).toBeInTheDocument();
  });

  test('allows user to input username, email and password', () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Signup />
        </BrowserRouter>
      </Provider>
    );

    const usernameInput = screen.getByLabelText(/username/i);
    const emailInput = screen.getByLabelText(/^email/i);
    const passwordInput = screen.getByLabelText(/password/i);

    fireEvent.change(usernameInput, { target: { value: 'newuser' } });
    fireEvent.change(emailInput, { target: { value: 'newuser@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    expect(usernameInput.value).toBe('newuser');
    expect(emailInput.value).toBe('newuser@example.com');
    expect(passwordInput.value).toBe('password123');
  });

  test('displays success message on successful signup', async () => {
    axios.post.mockResolvedValueOnce({
      data: { message: 'User created successfully' },
    });

    render(
      <Provider store={store}>
        <BrowserRouter>
          <Signup />
        </BrowserRouter>
      </Provider>
    );

    const usernameInput = screen.getByLabelText(/username/i);
    const emailInput = screen.getByLabelText(/^email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const signupButton = screen.getByRole('button', { name: /signup/i });

    fireEvent.change(usernameInput, { target: { value: 'newuser' } });
    fireEvent.change(emailInput, { target: { value: 'newuser@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(signupButton);

    const successMessage = await screen.findByText(/signup successful/i);
    expect(successMessage).toBeInTheDocument();
  });

  test('displays error message on failed signup', async () => {
    axios.post.mockRejectedValueOnce({
      response: { data: 'User already exists' },
    });

    render(
      <Provider store={store}>
        <BrowserRouter>
          <Signup />
        </BrowserRouter>
      </Provider>
    );

    const usernameInput = screen.getByLabelText(/username/i);
    const emailInput = screen.getByLabelText(/^email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const signupButton = screen.getByRole('button', { name: /signup/i });

    fireEvent.change(usernameInput, { target: { value: 'existinguser' } });
    fireEvent.change(emailInput, { target: { value: 'existing@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(signupButton);

    const errorMessage = await screen.findByText(/user already exists/i);
    expect(errorMessage).toBeInTheDocument();
  });
});
