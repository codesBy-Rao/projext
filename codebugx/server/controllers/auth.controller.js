const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User');

const createToken = (userId) =>
  jwt.sign({ userId }, process.env.JWT_SECRET || 'dev_jwt_secret', {
    expiresIn: '7d',
  });

const ensureDbConnected = () => {
  if (mongoose.connection.readyState !== 1) {
    const error = new Error('Database is not connected. Please try again in a moment.');
    error.statusCode = 503;
    throw error;
  }
};

const register = async (req, res, next) => {
  try {
    ensureDbConnected();
    const { email, password } = req.body;

    if (!email || !password) {
      const error = new Error('Email and password are required');
      error.statusCode = 400;
      throw error;
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      const error = new Error('User already exists');
      error.statusCode = 409;
      throw error;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      email,
      password: hashedPassword,
    });

    const token = createToken(user._id);

    res.status(201).json({
      status: 'success',
      data: {
        user: {
          id: user._id,
          email: user.email,
        },
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    ensureDbConnected();
    const { email, password } = req.body;

    if (!email || !password) {
      const error = new Error('Email and password are required');
      error.statusCode = 400;
      throw error;
    }

    const user = await User.findOne({ email });
    if (!user) {
      const error = new Error('Invalid credentials');
      error.statusCode = 401;
      throw error;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      const error = new Error('Invalid credentials');
      error.statusCode = 401;
      throw error;
    }

    const token = createToken(user._id);

    res.status(200).json({
      status: 'success',
      data: {
        user: {
          id: user._id,
          email: user.email,
        },
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getMe = async (req, res, next) => {
  try {
    ensureDbConnected();
    const user = await User.findById(req.user.userId).select('-password');

    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json({
      status: 'success',
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getMe,
};
