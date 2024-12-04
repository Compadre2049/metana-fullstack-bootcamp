import express from 'express';
import Blog from '../models/Blog.js';
import { isLoggedIn, isAdmin } from '../middleware/auth.js';

const blogsRouter = express.Router();

// Get all blogs
blogsRouter.get('/', async (req, res) => {
  try {
    const blogs = await Blog.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 });

    const formattedBlogs = blogs.map(blog => {
      const blogObj = blog.toObject();
      return {
        ...blogObj,
        user: blog.user ? {
          _id: blog.user._id,
          name: blog.user.name,
          email: blog.user.email
        } : null
      };
    });

    res.json({
      success: true,
      data: formattedBlogs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      data: []
    });
  }
});

// Get single blog
blogsRouter.get('/:id', async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id)
      .populate('user', 'name email');

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }

    const responseData = {
      ...blog.toObject(),
      user: blog.user ? {
        _id: blog.user._id,
        name: blog.user.name,
        email: blog.user.email
      } : null
    };

    res.json({
      success: true,
      data: responseData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Create blog
blogsRouter.post('/', isLoggedIn, async (req, res) => {
  try {
    const { title, content } = req.body;

    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: 'Title and content are required'
      });
    }

    if (!req.user || !req.user._id) {
      return res.status(400).json({
        success: false,
        message: 'User ID not found in token'
      });
    }

    const blog = new Blog({
      title,
      content,
      user: req.user._id
    });

    await blog.save();

    const populatedBlog = await Blog.findById(blog._id)
      .populate('user', 'name email');

    res.status(201).json({
      success: true,
      data: populatedBlog
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to create blog'
    });
  }
});

// Update blog
blogsRouter.put('/:id', isLoggedIn, async (req, res) => {
  try {
    const { title, content } = req.body;
    const blog = await Blog.findById(req.params.id)
      .populate('user', 'name email');

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }

    if (blog.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this blog'
      });
    }

    blog.title = title || blog.title;
    blog.content = content || blog.content;

    await blog.save();

    res.json({
      success: true,
      data: blog
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Delete blog
blogsRouter.delete('/:id', isLoggedIn, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id)
      .populate('user', 'name email');

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }

    if (req.user.role === 'admin' || (blog.user && blog.user._id.toString() === req.user._id.toString())) {
      await blog.deleteOne();

      return res.json({
        success: true,
        message: 'Blog deleted successfully'
      });
    } else {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this blog'
      });
    }

  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

export default blogsRouter;
