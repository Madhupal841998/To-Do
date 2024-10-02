// src/components/TodoList.test.js
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import TodoList from './TodoList';
import { Provider } from 'react-redux';
import { store } from '../redux/store';
import axios from 'axios';

// Mock axios
jest.mock('axios');

describe('TodoList Component', () => {
  const mockTasks = [
    { _id: '1', title: 'Task 1', status: false },
    { _id: '2', title: 'Task 2', status: true },
  ];

  beforeEach(() => {
    axios.get.mockResolvedValue({ data: mockTasks });
  });

  test('renders tasks fetched from API', async () => {
    render(
      <Provider store={store}>
        <TodoList />
      </Provider>
    );

    expect(screen.getByText(/my tasks/i)).toBeInTheDocument();

    expect(await screen.findByText('Task 1')).toBeInTheDocument();
    expect(await screen.findByText('Task 2')).toBeInTheDocument();  
  });

  test('allows adding a new task', async () => {
    const newTask = { _id: '3', title: 'Task 3', status: false };
    axios.post.mockResolvedValueOnce({ data: newTask });

    render(
      <Provider store={store}>
        <TodoList />
      </Provider>
    );

    const input = screen.getByPlaceholderText(/add a new task/i);
    const addButton = screen.getByRole('button', { name: /add task/i });

    fireEvent.change(input, { target: { value: 'Task 3' } });
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByText('Task 3')).toBeInTheDocument();
    });
  });

  test('allows toggling task completion', async () => {
    axios.put.mockResolvedValueOnce({ data: { _id: '1', title: 'Task 1', status: true } });

    render(
      <Provider store={store}>
        <TodoList />
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('Task 1')).toBeInTheDocument();
    });

    const task = screen.getByText('Task 1');
    fireEvent.click(task);

    await waitFor(() => {
      expect(task).toHaveClass('completed');
    });
  });

  test('allows deleting a task', async () => {
    axios.delete.mockResolvedValueOnce({ data: { message: 'Task deleted successfully' } });

    render(
      <Provider store={store}>
        <TodoList />
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('Task 1')).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByText(/delete/i);
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(screen.queryByText('Task 1')).not.toBeInTheDocument();
    });
  });
});
