const Student = require('../models/Student');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

exports.register = async (req, res) => {
  try {
    const { name, email, password, course } = req.body;

    if (!name || !email || !password || !course) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    const existingStudent = await Student.findOne({ email });
    if (existingStudent) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered'
      });
    }

    const student = await Student.create({
      name,
      email,
      password,
      course
    });

    const token = generateToken(student._id);

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      student: {
        id: student._id,
        name: student.name,
        email: student.email,
        course: student.course
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    const student = await Student.findOne({ email }).select('+password');
    
    if (!student) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const isPasswordValid = await student.comparePassword(password);
    
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const token = generateToken(student._id);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      student: {
        id: student._id,
        name: student.name,
        email: student.email,
        course: student.course
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
};

exports.updatePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const studentId = req.student.id;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Old password and new password are required'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters'
      });
    }

    const student = await Student.findById(studentId).select('+password');
    
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    const isOldPasswordValid = await student.comparePassword(oldPassword);
    
    if (!isOldPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Old password is incorrect'
      });
    }

    student.password = newPassword;
    await student.save();

    res.status(200).json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    console.error('Update password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating password'
    });
  }
};

exports.updateCourse = async (req, res) => {
  try {
    const { course } = req.body;
    const studentId = req.student.id;

    if (!course) {
      return res.status(400).json({
        success: false,
        message: 'Course is required'
      });
    }

    const validCourses = ['Computer Science', 'Information Technology', 'Electronics', 'Mechanical', 'Civil'];
    if (!validCourses.includes(course)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid course selected'
      });
    }

    const student = await Student.findByIdAndUpdate(
      studentId,
      { course },
      { new: true, runValidators: true }
    );

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Course updated successfully',
      student: {
        id: student._id,
        name: student.name,
        email: student.email,
        course: student.course
      }
    });
  } catch (error) {
    console.error('Update course error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating course'
    });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const student = await Student.findById(req.student.id);
    
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    res.status(200).json({
      success: true,
      student: {
        id: student._id,
        name: student.name,
        email: student.email,
        course: student.course,
        createdAt: student.createdAt
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching profile'
    });
  }
};