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
    let testUser;
    let userToken;
    let testBlog;

    beforeAll(async () => {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/test');

        app = express();
        app.use(express.json());

        // Simple auth middleware
        app.use((req, res, next) => {
            if (req.method === 'GET') return next();

            const token = req.headers.authorization?.split(' ')[1];
            if (!token) {
                return res.status(401).json({ success: false, message: 'No token' });
            }

            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET || 'test-secret');
                req.user = {
                    _id: decoded.id,
                    email: decoded.email,
                    role: decoded.role || 'normal'
                };
                next();
            } catch (error) {
                res.status(401).json({ success: false, message: 'Invalid token' });
            }
        });

        app.use('/blogs', blogsRouter);
    });

    beforeEach(async () => {
        await Blog.deleteMany({});
        await User.deleteMany({});

        // Create test user with correct role enum
        testUser = await User.create({
            name: 'Test User',
            email: 'test@example.com',
            password: 'password123',
            role: 'normal'
        });

        // Create token
        userToken = jwt.sign({
            id: testUser._id.toString(),
            email: testUser.email,
            role: 'normal'
        }, process.env.JWT_SECRET || 'test-secret');

        // Create test blog
        testBlog = await Blog.create({
            title: 'Test Blog',
            content: 'Test Content',
            user: testUser._id
        });
    });

    describe('GET /blogs', () => {
        it('should get all blogs', async () => {
            const response = await request(app)
                .get('/blogs')
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveLength(1);
            expect(response.body.data[0].title).toBe('Test Blog');
        });
    });

    describe('POST /blogs', () => {
        it('should create a new blog when authenticated', async () => {
            const newBlog = {
                title: 'New Blog',
                content: 'New Content'
            };

            const response = await request(app)
                .post('/blogs')
                .set('Authorization', `Bearer ${userToken}`)
                .send(newBlog)
                .expect(201);

            expect(response.body.success).toBe(true);
            expect(response.body.data.title).toBe('New Blog');
            expect(response.body.data.user._id.toString()).toBe(testUser._id.toString());
        });

        it('should not create blog without auth', async () => {
            const newBlog = {
                title: 'New Blog',
                content: 'New Content'
            };

            await request(app)
                .post('/blogs')
                .send(newBlog)
                .expect(401);
        });
    });

    describe('PUT /blogs/:id', () => {
        it('should update own blog', async () => {
            const update = {
                title: 'Updated Title'
            };

            const response = await request(app)
                .put(`/blogs/${testBlog._id}`)
                .set('Authorization', `Bearer ${userToken}`)
                .send(update)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.title).toBe('Updated Title');
        });
    });

    describe('DELETE /blogs/:id', () => {
        it('should delete own blog', async () => {
            const response = await request(app)
                .delete(`/blogs/${testBlog._id}`)
                .set('Authorization', `Bearer ${userToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe('Blog deleted successfully');

            const deletedBlog = await Blog.findById(testBlog._id);
            expect(deletedBlog).toBeNull();
        });
    });

    afterAll(async () => {
        await mongoose.connection.close();
    });
}); 