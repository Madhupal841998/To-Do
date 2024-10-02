import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { setTasks, updateTask, deleteTask, addTask } from '../redux/todoSlice';
import { io } from 'socket.io-client';
import './TodoList.css';
import './common.css';

const TodoList = () => {
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [editedTask, setEditedTask] = useState('');
  const [newTask, setNewTask] = useState(''); // State for new task
  const [serverError, setServerError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const tasks = useSelector((state) => state.todo.tasks);
  const token = useSelector((state) => state.auth.token);
  const dispatch = useDispatch();
  const [socket, setSocket] = useState(null);

  // Initialize WebSocket connection
  useEffect(() => {
    const newSocket = io(import.meta.env.VITE_API_URL, {
      auth: { token },
    });
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Connected to WebSocket');
    });

    newSocket.on('taskUpdated', (task) => {
      dispatch(updateTask(task));
    });

    newSocket.on('taskDeleted', (id) => {
      dispatch(deleteTask(id));
    });

    return () => newSocket.close();
  }, [dispatch, token]);

  // Fetch tasks on component mount
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/tasks`, {
          headers: { 'x-auth-token': token },
        });
        dispatch(setTasks(data));
      } catch (err) {
        setServerError('Error fetching tasks');
      }
    };

    if (token) {
      fetchTasks();
    }
  }, [dispatch, token]);

  // Add a new task
  const handleAddTask = async () => {
    if (!newTask.trim()) return; // Prevent adding empty tasks
    setServerError('');
    setSuccessMessage('');
    try {
      const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/api/tasks`, { title: newTask }, {
        headers: { 'x-auth-token': token },
      });
      dispatch(addTask(data)); // Update the Redux state
      setNewTask(''); // Clear the input field
      setSuccessMessage('Task added successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setServerError('Error adding task');
    }
  };

  // Toggle task status (complete/incomplete)
  const handleToggleTaskStatus = async (task) => {
    setServerError('');
    setSuccessMessage('');
    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/api/tasks/${task._id}`, { ...task, status: !task.status }, {
        headers: { 'x-auth-token': token },
      });
      setSuccessMessage('Task status updated successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setServerError('Error updating task status');
    }
  };

  // Edit task
  const handleEditTask = async () => {
    if (!selectedTaskId || !editedTask.trim()) return;
    setServerError('');
    setSuccessMessage('');
    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/api/tasks/${selectedTaskId}`, { title: editedTask }, {
        headers: { 'x-auth-token': token },
      });
      setSuccessMessage('Task edited successfully!');
      setEditedTask('');
      setSelectedTaskId(null);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setServerError('Error editing task');
    }
  };

  // Delete task
  const handleDeleteTask = async () => {
    if (!selectedTaskId) return;
    setServerError('');
    setSuccessMessage('');
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/tasks/${selectedTaskId}`, {
        headers: { 'x-auth-token': token },
      });
      setSuccessMessage('Task deleted successfully!');
      setSelectedTaskId(null);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setServerError('Error deleting task');
    }
  };

  return (
    <div className="todo-container">
      <h2>My Tasks</h2>

      {/* Display error and success messages */}
      {serverError && <div className="error-message">{serverError}</div>}
      {successMessage && <div className="success-message">{successMessage}</div>}

      {/* Add New Task Section */}
      <div className="add-task">
        <input
          type="text"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder="Add a new task"
        />
        <button onClick={handleAddTask}>Add Task</button>
      </div>

      <div className="tasks-list">
        {tasks.length === 0 ? (
          <p>No tasks available. Add a new task!</p>
        ) : (
          <ul>
            {tasks.map((task) => (
              <li key={task._id} className="task-item">
                <input
                  type="radio"
                  checked={selectedTaskId === task._id}
                  onChange={() => {
                    setSelectedTaskId(task._id);
                    setEditedTask(task.title); // Set current task title for editing
                  }}
                />
                <span className={task.status ? 'completed' : ''}>
                  {task.title}
                </span>

                <label className="switch">
                  <input
                    type="checkbox"
                    checked={task.status}
                    onChange={() => handleToggleTaskStatus(task)}
                  />
                  <span className="slider"></span>
                </label>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Edit Task Section */}
      {selectedTaskId && (
        <div className="edit-task">
          <input
            type="text"
            value={editedTask}
            onChange={(e) => setEditedTask(e.target.value)}
            placeholder="Edit task"
          />
          <button onClick={handleEditTask}>Save Changes</button>
          <button onClick={handleDeleteTask}>Delete Task</button>
        </div>
      )}
    </div>
  );
};

export default TodoList;
