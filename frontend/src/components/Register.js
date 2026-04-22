import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../config';  // ← ADD THIS LINE

function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    course: ''
  });
  // ... rest of file stays same
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const courses = ['Computer Science', 'Information Technology', 'Electronics', 'Mechanical', 'Civil'];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/register`, formData);
      
      if (response.data.success) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('student', JSON.stringify(response.data.student));
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-header">
        <h2>Student Registration</h2>
        <p>Create your account to get started</p>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Full Name</label>
          <input
            type="text"
            className="form-control"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter your full name"
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Email Address</label>
          <input
            type="email"
            className="form-control"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter your email"
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Password</label>
          <input
            type="password"
            className="form-control"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Minimum 6 characters"
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Course</label>
          <select
            className="form-control"
            name="course"
            value={formData.course}
            onChange={handleChange}
            required
          >
            <option value="">Select your course</option>
            {courses.map(course => (
              <option key={course} value={course}>{course}</option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          className="btn btn-primary"
          disabled={loading}
        >
          {loading ? 'Registering...' : 'Register'}
        </button>

        <div className="text-center mt-3">
          <span>Already have an account? </span>
          <Link to="/login" className="link-text">Login here</Link>
        </div>
      </form>
    </div>
  );
}

export default Register;