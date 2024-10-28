import express from 'express';
import Blog from '../models/Blog.js';
import mongoose from 'mongoose';
import { isLoggedIn, isAdmin } from '../middleware/auth.js';

const blogsRouter = express.Router();

// Public routes
blogsRouter.get('/', async (req, res) => {
  try {
    const blogs = await Blog.find().populate('user', 'name email');
    res.json(blogs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single blog
blogsRouter.get('/:id', async (req, res) => {
  try {
    const blogId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(blogId)) {
      return res.status(400).json({ error: 'Invalid blog ID' });
    }

    const blog = await Blog.findById(blogId).populate('user', 'name email');

    if (!blog) {
      return res.status(404).json({ error: 'Blog not found' });
    }

    res.json(blog);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Protected routes
blogsRouter.post('/', isLoggedIn, async (req, res) => {
  try {
    const { title, content } = req.body;
    const newBlog = new Blog({
      title,
      content,
      user: req.user.userId  // Add the user ID from the token
    });
    await newBlog.save();
    res.status(201).json(newBlog);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

blogsRouter.put('/:id', isLoggedIn, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content } = req.body;

    // Find blog first to check ownership
    const blog = await Blog.findById(id);

    if (!blog) {
      return res.status(404).json({ error: 'Blog not found' });
    }

    // Check if user is author or admin
    if (blog.user.toString() !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to update this blog' });
    }

    const updatedBlog = await Blog.findByIdAndUpdate(
      id,
      { title, content },
      { new: true }
    ).populate('user', 'name email');

    if (!updatedBlog) {
      return res.status(404).json({ error: 'Blog not found' });
    }
    res.json(updatedBlog);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

blogsRouter.delete('/:id', isLoggedIn, async (req, res) => {
  try {
    const { id } = req.params;
    const deletedBlog = await Blog.findByIdAndDelete(id);
    if (!deletedBlog) {
      return res.status(404).json({ error: 'Blog not found' });
    }
    res.json({ message: 'Blog successfully deleted', deletedBlog });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default blogsRouter;
