import express from 'express';
import User from '../models/User.js';
import mongoose from 'mongoose';
import { isLoggedIn, isAdmin } from '../middleware/auth.js';
import bcrypt from 'bcrypt';

const usersRouter = express.Router();

// Log all routes at startup
console.log('Available routes:', usersRouter.stack.map(r => r.route?.path).filter(Boolean));

// Put specific routes first
usersRouter.put('/update-name', isLoggedIn, async (req, res) => {
  try {
    const { name } = req.body;
    const user = await User.findOne({ email: req.user.email });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.name = name;
    await user.save();

    res.json({
      message: 'Name updated successfully',
      user: {
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Update error:', error);
    res.status(500).json({ error: error.message });
  }
});

// General routes after
usersRouter.get('/', isLoggedIn, isAdmin, async (req, res) => {
  try {
    const users = await User.find().select('-password'); // Exclude password field
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Move this AFTER the /update-name route
usersRouter.put('/:id', isLoggedIn, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role } = req.body;

    // Debug logging
    console.log('Request user:', req.user);
    console.log('Params ID:', id);
    console.log('Update data:', { name, email, role });

    // Validate IDs match when not admin
    const requesterId = req.user._id.toString();
    const targetId = id.toString();

    if (req.user.role !== 'admin' && requesterId !== targetId) {
      return res.status(403).json({
        error: 'Not authorized to modify other users'
      });
    }

    // Only allow admins to change roles
    if (role && req.user.role !== 'admin') {
      return res.status(403).json({
        error: 'Only administrators can modify user roles'
      });
    }

    // Remove role from update if user is not admin
    const updateData = req.user.role === 'admin'
      ? { name, email, role }
      : { name, email };

    const updatedUser = await User.findByIdAndUpdate(
      id,
      updateData,
      {
        new: true,
        runValidators: true
      }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(updatedUser);
  } catch (error) {
    console.error('Update error:', error);
    res.status(400).json({ error: error.message });
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

// Delete user (admin only)
usersRouter.delete('/:id', isLoggedIn, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Find the user first
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Use deleteOne to trigger the pre middleware
    await user.deleteOne();

    res.json({
      success: true,
      message: 'User and all associated blogs deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

export default usersRouter;
