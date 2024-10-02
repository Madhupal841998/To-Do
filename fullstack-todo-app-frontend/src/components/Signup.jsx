import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import './Signup.css';
import './common.css';  
const Signup = () => {
  const navigate = useNavigate();
  const [serverError, setServerError] = React.useState('');
  const [successMessage, setSuccessMessage] = React.useState('');

  // Define initial form values
  const initialValues = {
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  };

  // Define validation schema using Yup
  const validationSchema = Yup.object({
    username: Yup.string()
      .min(3, 'Username must be at least 3 characters')
      .required('Username is required'),
    email: Yup.string()
      .email('Invalid email format')
      .required('Email is required'),
    password: Yup.string()
      .min(6, 'Password must be at least 6 characters')
      .required('Password is required'),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('password'), null], 'Passwords must match')
      .required('Confirm password is required'),
  });

  // Handle form submission
  const onSubmit = async (values, { setSubmitting }) => {
    setServerError('');
    setSuccessMessage('');

    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/signup`, {
        username: values.username,
        email: values.email,
        password: values.password,
      });
      setSuccessMessage('Signup successful! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 2000); // Redirect after 2 seconds
    } catch (error) {
      console.error('Signup failed', error);
      setServerError(error.response?.data || 'Signup failed');
    }
    setSubmitting(false);
  };

  return (
    <div className="auth-container">
      <h2>Signup</h2>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={onSubmit}
      >
        {({ isSubmitting }) => (
          <Form className="auth-form">
            {serverError && <div className="error-message">{serverError}</div>}
            {successMessage && <div className="success-message">{successMessage}</div>}

            <div className="form-group">
              <label htmlFor="username">Username:</label>
              <Field
                type="text"
                name="username"
                placeholder="Enter your username"
              />
              <ErrorMessage
                name="username"
                component="div"
                className="error-message"
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email:</label>
              <Field
                type="email"
                name="email"
                placeholder="Enter your email"
              />
              <ErrorMessage
                name="email"
                component="div"
                className="error-message"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password:</label>
              <Field
                type="password"
                name="password"
                placeholder="Enter your password"
              />
              <ErrorMessage
                name="password"
                component="div"
                className="error-message"
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password:</label>
              <Field
                type="password"
                name="confirmPassword"
                placeholder="Confirm your password"
              />
              <ErrorMessage
                name="confirmPassword"
                component="div"
                className="error-message"
              />
            </div>

            <button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Signing up...' : 'Signup'}
            </button>

            <p>
              Already have an account? <Link to="/login">Login here</Link>
            </p>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default Signup;
