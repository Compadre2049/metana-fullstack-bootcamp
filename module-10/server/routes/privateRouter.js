import express from 'express';
import { isAdmin } from '../middleware/auth.js';
import User from '../models/User.js';
import Blog from '../models/Blog.js';

const privateRouter = express.Router();

privateRouter.get('/', isAdmin, async (req, res) => {
    try {
        // Get all users
        const users = await User.find({}, '-password'); // Exclude password field

        // Get blog statistics
        const totalBlogs = await Blog.countDocuments();

        // Get blogs per author
        const blogsPerAuthor = await Blog.aggregate([
            {
                $group: {
                    _id: "$user",
                    count: { $sum: 1 }
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "_id",
                    foreignField: "_id",
                    as: "author"
                }
            },
            {
                $unwind: "$author"
            },
            {
                $project: {
                    _id: 1,
                    count: 1,
                    "author.name": 1,
                    "author.email": 1
                }
            },
            {
                $sort: { count: -1 }
            }
        ]);

        res.json({
            users,
            statistics: {
                totalUsers: users.length,
                totalBlogs,
                blogsPerAuthor
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Add endpoint to delete a user
privateRouter.delete('/users/:userId', isAdmin, async (req, res) => {
    try {
        const { userId } = req.params;

        // Don't allow deleting the admin
        const user = await User.findById(userId);
        if (user.email === 'admin@example.com') {
            return res.status(403).json({ error: 'Cannot delete admin user' });
        }

        // Delete user's blogs first
        await Blog.deleteMany({ user: userId });

        // Delete the user
        await User.findByIdAndDelete(userId);

        res.json({ message: 'User and associated blogs deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default privateRouter; 