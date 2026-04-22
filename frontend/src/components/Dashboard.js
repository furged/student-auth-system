import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../config';  // ← ADD THIS LINE


function Dashboard() {
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: ''
  });
  const [selectedCourse, setSelectedCourse] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  const courses = ['Computer Science', 'Information Technology', 'Electronics', 'Mechanical', 'Civil'];

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setStudent(response.data.student);
        setSelectedCourse(response.data.student.course);
      }
    } catch (err) {
      console.error('Error loading profile:', err);
      if (err.response?.status === 401) {
        handleLogout();
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('student');
    navigate('/login');
  };

  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value
    });
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${API_URL}/update-password`,
        passwordData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setMessage({ type: 'success', text: response.data.message });
        setPasswordData({ oldPassword: '', newPassword: '' });
      }
    } catch (err) {
      setMessage({ 
        type: 'danger', 
        text: err.response?.data?.message || 'Failed to update password' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateCourse = async () => {
    setMessage({ type: '', text: '' });
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${API_URL}/update-course`,
        { course: selectedCourse },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setStudent(response.data.student);
        localStorage.setItem('student', JSON.stringify(response.data.student));
        setMessage({ type: 'success', text: response.data.message });
      }
    } catch (err) {
      setMessage({ 
        type: 'danger', 
        text: err.response?.data?.message || 'Failed to update course' 
      });
    } finally {
      setLoading(false);
    }
  };

  if (!student) {
    return (
      <div className="auth-container">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h2>Student Dashboard</h2>
        <button onClick={handleLogout} className="logout-btn">
          Logout
        </button>
      </div>

      {message.text && (
        <div className={`alert alert-${message.type}`} role="alert">
          {message.text}
        </div>
      )}

      <div className="student-info">
        <h4 className="mb-3">Student Information</h4>
        <div className="info-item">
          <span><strong>Name:</strong></span>
          <span>{student.name}</span>
        </div>
        <div className="info-item">
          <span><strong>Email:</strong></span>
          <span>{student.email}</span>
        </div>
        <div className="info-item">
          <span><strong>Course:</strong></span>
          <span>{student.course}</span>
        </div>
        <div className="info-item">
          <span><strong>Joined:</strong></span>
          <span>{new Date(student.createdAt).toLocaleDateString()}</span>
        </div>
      </div>

      <div className="update-section">
        <h4>Update Password</h4>
        <form onSubmit={handleUpdatePassword}>
          <div className="form-group">
            <label className="form-label">Current Password</label>
            <input
              type="password"
              className="form-control"
              name="oldPassword"
              value={passwordData.oldPassword}
              onChange={handlePasswordChange}
              placeholder="Enter current password"
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">New Password</label>
            <input
              type="password"
              className="form-control"
              name="newPassword"
              value={passwordData.newPassword}
              onChange={handlePasswordChange}
              placeholder="Minimum 6 characters"
              required
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>

      <div className="update-section">
        <h4>Change Course</h4>
        <div className="form-group">
          <label className="form-label">Select New Course</label>
          <select
            className="form-control"
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
          >
            {courses.map(course => (
              <option key={course} value={course}>{course}</option>
            ))}
          </select>
        </div>
        <button
          onClick={handleUpdateCourse}
          className="btn btn-primary"
          disabled={loading}
        >
          {loading ? 'Updating...' : 'Update Course'}
        </button>
      </div>
    </div>
  );
}

export default Dashboard;