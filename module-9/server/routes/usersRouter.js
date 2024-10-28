import express from 'express';
import User from '../models/User.js';
import mongoose from 'mongoose';
import { isLoggedIn, isAdmin } from '../middleware/auth.js';
import bcrypt from 'bcrypt';

const usersRouter = express.Router();

// Get all users (admin only)
usersRouter.get('/', isLoggedIn, isAdmin, async (req, res) => {
  try {
    const users = await User.find().select('-password'); // Exclude password field
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single user (admin or self)
usersRouter.get('/:id', isLoggedIn, async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.params.id);

    // Debug logs
    console.log('Request user:', req.user);
    console.log('Requested userId:', userId);

    // If admin, allow access to any user
    if (req.user.role === 'admin') {
      const user = await User.findById(userId).select('-password');
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      return res.json(user);
    }

    // For non-admin users, only allow access to their own data
    if (req.user.userId !== userId.toString()) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create user (admin only)
usersRouter.post('/', isLoggedIn, isAdmin, async (req, res) => {
  try {
    const { name, email, password, role } = req.body;  // Add password to destructuring

    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,  // Add hashed password
      role
    });

    await newUser.save();

    // Return user without password
    const userResponse = newUser.toObject();
    delete userResponse.password;

    res.status(201).json(userResponse);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update user (admin or self)
usersRouter.put('/:id', isLoggedIn, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role } = req.body;

    // Only allow admins to change roles
    if (role && req.user.role !== 'admin') {
      return res.status(403).json({
        error: 'Only administrators can modify user roles'
      });
    }

    // Allow users to update their own info or admins to update any user
    if (req.user.role !== 'admin' && req.user.userId !== id) {
      return res.status(403).json({
        error: 'Not authorized to modify other users'
      });
    }

    // Remove role from update if user is not admin
    const updateData = req.user.role === 'admin'
      ? { name, email, role }
      : { name, email };

    const updatedUser = await User.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(updatedUser);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

usersRouter.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deletedUser = await User.findByIdAndDelete(id);
    res.json(deletedUser);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default usersRouter;
