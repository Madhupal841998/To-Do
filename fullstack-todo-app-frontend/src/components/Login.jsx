import  { useState } from 'react';
import { useDispatch } from 'react-redux';
import { loginSuccess } from '../redux/authSlice';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import './Login.css';
import './common.css';  
const Login = () => {
  const [serverError, setServerError] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const initialValues = {
    email: '',
    password: '',
  };

  const validationSchema = Yup.object({
    email: Yup.string().email('Invalid email format').required('Required'),
    password: Yup.string().min(6, 'Minimum 6 characters').required('Required'),
  });

  const onSubmit = async (values, { setSubmitting }) => {
    setServerError('');
    try {
      const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/login`, values);
      dispatch(loginSuccess(data.token));
      navigate('/todo');
    } catch (error) {
      console.error('Login failed', error);
      setServerError(error.response?.data || 'Login failed');
    }
    setSubmitting(false);
  };

  return (
    <div className="auth-container">
      <h2>Login</h2>
      <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={onSubmit}>
        {({ isSubmitting }) => (
          <Form className="auth-form">
            {serverError && <div className="error-message">{serverError}</div>}
            <div className="form-group">
              <label htmlFor="email">Email:</label>
              <Field
                type="email"
                name="email"
                placeholder="Enter your email"
              />
              <ErrorMessage name="email" component="div" className="error-message" />
            </div>
            <div className="form-group">
              <label htmlFor="password">Password:</label>
              <Field
                type="password"
                name="password"
                placeholder="Enter your password"
              />
              <ErrorMessage name="password" component="div" className="error-message" />
            </div>
            <button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Logging in...' : 'Login'}
            </button>
            <p>
              Don&apos;t have an account? <Link to="/signup">Signup here</Link>
            </p>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default Login;
