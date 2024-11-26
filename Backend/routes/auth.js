const express = require('express');
const { register, login } = require('../controllers/authController');
const { authenticate, authorize } = require('../middleware/auth');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');

// Public Routes
router.post('/register', register);
router.post('/login', login);

// Protected Route Examples
router.get('/admin', authenticate, authorize(['admin']), (req, res) => {
  res.json({ message: 'Welcome Admin' });
});

router.get('/user', authenticate, authorize(['user', 'admin']), (req, res) => {
  res.json({ message: 'Welcome User' });
});

// Route to fetch all users (Admin only)
router.get('/users', authenticate, authorize(['admin']), async (req, res) => {
  try {
    const users = await User.find({}, 'username email role'); // Fetch username, email, and role
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch users' });
  }
});

// Add a new user (Admin only)
router.post('/add-user', authenticate, authorize(['admin']), async (req, res) => {
  console.log('Request received:', req.body); // Log the request payload
  const { username, email, password, role } = req.body;

  try {
    // Debug user creation process
    console.log('Checking for existing user...');
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    console.log('Hashing password...');
    const hashedPassword = await bcrypt.hash(password, 10);

    console.log('Creating new user...');
    const newUser = new User({ username, email, password: hashedPassword, role });
    await newUser.save();

    res.status(201).json({ message: 'User added successfully', user: newUser });
  } catch (error) {
    console.error('Error adding user:', error); // Log the error details
    res.status(500).json({ message: 'Failed to add user', error: error.message });
  }
});


// Delete a user by ID (Admin only)
router.delete('/delete-user/:id', authenticate, authorize(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete user' });
  }
});


module.exports = router;
