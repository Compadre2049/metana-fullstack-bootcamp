import { jest } from '@jest/globals';
import request from 'supertest';
import express from 'express';
import mongoose from 'mongoose';
import blogsRouter from '../../routes/blogsRouter.js';
import Blog from '../../models/Blog.js';
import User from '../../models/User.js';
import jwt from 'jsonwebtoken';

describe('Blogs Router', () => {
    let app;
    let normalUser;
    let adminUser;
    let normalUserToken;
    let adminToken;

    beforeAll(async () => {
        // Clear the database first
        await User.deleteMany({});
        await Blog.deleteMany({});

        app = express();
        app.use(express.json());

        // Mock auth middleware
        app.use((req, res, next) => {
            if (req.method === 'GET') {
                return next();
            }

            const authHeader = req.headers.authorization;
            if (!authHeader) {
                return res.status(401).json({
                    success: false,
                    message: 'No token provided'
                });
            }

            const token = authHeader.split(' ')[1];
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET || 'test-secret');
                req.user = {
                    _id: new mongoose.Types.ObjectId(decoded._id),
                    role: decoded.role,
                    email: decoded.email
                };
                next();
            } catch (error) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid token'
                });
            }
        });

        app.use('/blogs', blogsRouter);
    });

    beforeEach(async () => {
        // Clear existing data
        await User.deleteMany({});
        await Blog.deleteMany({});

        // Create fresh test users for each test
        normalUser = await User.create({
            name: 'Normal User',
            email: 'test@example.com',
            password: 'password123',
            role: 'normal'
        });

        adminUser = await User.create({
            name: 'Admin User',
            email: 'admin@example.com',
            password: 'password123',
            role: 'admin'
        });

        // Generate fresh tokens for each test
        normalUserToken = jwt.sign({
            _id: normalUser._id.toString(),
            email: normalUser.email,
            role: 'normal'
        }, process.env.JWT_SECRET || 'test-secret');

        adminToken = jwt.sign({
            _id: adminUser._id.toString(),
            email: adminUser.email,
            role: 'admin'
        }, process.env.JWT_SECRET || 'test-secret');

        // Verify users exist
        const normalUserExists = await User.findById(normalUser._id);
        const adminUserExists = await User.findById(adminUser._id);

        if (!normalUserExists || !adminUserExists) {
            throw new Error('Test users not created properly');
        }
    });

    describe('POST /blogs', () => {
        it('should create a new blog when authenticated', async () => {
            // Verify user exists before test
            const userExists = await User.findById(normalUser._id);
            console.log('Test user exists:', userExists);

            const newBlog = {
                title: 'New Blog',
                content: 'New Content'
            };

            const response = await request(app)
                .post('/blogs')
                .set('Authorization', `Bearer ${normalUserToken}`)
                .send(newBlog);

            console.log('Response data:', response.body);

            expect(response.status).toBe(201);
            expect(response.body.success).toBe(true);
            expect(response.body.data.title).toBe('New Blog');
            expect(response.body.data.user).toBe(normalUser._id.toString());

            // Verify the blog was saved correctly
            const savedBlog = await Blog.findById(response.body.data._id);
            expect(savedBlog).toBeTruthy();
            expect(savedBlog.user.toString()).toBe(normalUser._id.toString());
        });
    });

    // ... rest of test cases ...

    afterAll(async () => {
        await User.deleteMany({});
        await Blog.deleteMany({});
        await mongoose.connection.close();
    });
}); 