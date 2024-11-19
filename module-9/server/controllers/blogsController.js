import Blog from '../models/Blog.js';

export const getAllBlogs = async (req, res) => {
    try {
        const blogs = await Blog.find()
            .populate('user', 'name email')
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            data: blogs
        });
    } catch (error) {
        console.error('Error getting blogs:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

export const getBlogById = async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id)
            .populate('user', 'name email');

        if (!blog) {
            return res.status(404).json({
                success: false,
                message: 'Blog not found'
            });
        }

        return res.status(200).json({
            success: true,
            data: blog
        });
    } catch (error) {
        console.error('Error getting blog:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

export const createBlog = async (req, res) => {
    try {
        const { title, content } = req.body;

        if (!title || !content) {
            return res.status(400).json({
                success: false,
                message: 'Please provide title and content'
            });
        }

        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        const blog = await Blog.create({
            title,
            content,
            user: req.user._id
        });

        const populatedBlog = await Blog.findById(blog._id)
            .populate('user', 'name email');

        return res.status(201).json({
            success: true,
            data: populatedBlog
        });
    } catch (error) {
        console.error('Error creating blog:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

export const updateBlog = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, content } = req.body;

        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        const blog = await Blog.findById(id);

        if (!blog) {
            return res.status(404).json({
                success: false,
                message: 'Blog not found'
            });
        }

        if (blog.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this blog'
            });
        }

        blog.title = title || blog.title;
        blog.content = content || blog.content;
        await blog.save();

        const updatedBlog = await Blog.findById(id)
            .populate('user', 'name email');

        return res.status(200).json({
            success: true,
            data: updatedBlog
        });
    } catch (error) {
        console.error('Error updating blog:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

export const deleteBlog = async (req, res) => {
    try {
        const { id } = req.params;

        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        const blog = await Blog.findById(id);

        if (!blog) {
            return res.status(404).json({
                success: false,
                message: 'Blog not found'
            });
        }

        if (blog.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this blog'
            });
        }

        await blog.deleteOne();

        return res.status(200).json({
            success: true,
            message: 'Blog deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting blog:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};
