import request from 'supertest';
import mongoose from 'mongoose';
import { app } from '../app.js';
import Blog from '../models/Blog.js';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';

describe('Blogs Controller', () => {
    let userToken;
    let testBlog;
    let userId;

    beforeEach(async () => {
        // Clear the databases
        await Blog.deleteMany({});
        await User.deleteMany({});

        // Create a regular user
        const user = await User.create({
            name: 'Test User',
            email: 'test@example.com',
            password: 'password123'
        });

        // Generate token with correct structure
        userToken = jwt.sign(
            {
                id: user._id.toString(),
                email: user.email,
                role: 'user'
            },
            process.env.JWT_SECRET
        );

        userId = user._id;

        // Create a test blog
        testBlog = await Blog.create({
            title: 'Test Blog',
            content: 'Test Content',
            user: userId
        });
    });

    describe('GET /api/blogs', () => {
        it('should get all blogs', async () => {
            const response = await request(app)
                .get('/api/blogs')
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(Array.isArray(response.body.data)).toBe(true);
            expect(response.body.data[0].title).toBe('Test Blog');
        });
    });

    describe('POST /api/blogs', () => {
        it('should create a new blog when authenticated', async () => {
            const newBlog = {
                title: 'New Blog',
                content: 'New Content'
            };

            const response = await request(app)
                .post('/api/blogs')
                .set('Authorization', `Bearer ${userToken}`)
                .send(newBlog)
                .expect(201);

            expect(response.body.success).toBe(true);
            expect(response.body.data.title).toBe('New Blog');
        });

        it('should not create blog without title or content', async () => {
            await request(app)
                .post('/api/blogs')
                .set('Authorization', `Bearer ${userToken}`)
                .send({})
                .expect(400);
        });
    });

    describe('PUT /api/blogs/:id', () => {
        it('should update own blog', async () => {
            const update = {
                title: 'Updated Title',
                content: 'Updated Content'
            };

            const response = await request(app)
                .put(`/api/blogs/${testBlog._id}`)
                .set('Authorization', `Bearer ${userToken}`)
                .send(update)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.title).toBe('Updated Title');
        });
    });

    describe('DELETE /api/blogs/:id', () => {
        it('should delete own blog', async () => {
            const response = await request(app)
                .delete(`/api/blogs/${testBlog._id}`)
                .set('Authorization', `Bearer ${userToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe('Blog deleted successfully');

            const blog = await Blog.findById(testBlog._id);
            expect(blog).toBeNull();
        });
    });
}); 