import request from 'supertest';
import mongoose from 'mongoose';
import { app } from '../app.js';
import Blog from '../models/Blog.js';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';

describe('Blogs Controller', () => {
    let userToken;
    let adminToken;
    let userId;
    let adminId;
    let testBlog;

    beforeEach(async () => {
        // Clear the databases
        await Blog.deleteMany({});
        await User.deleteMany({});

        // Create a regular user
        const user = await User.create({
            name: 'Test User',
            email: 'test@example.com',
            password: 'password123',
            role: 'normal'
        });

        // Create an admin user
        const admin = await User.create({
            name: 'Admin User',
            email: 'admin@example.com',
            password: 'password123',
            role: 'admin'
        });

        // Generate tokens
        userToken = jwt.sign(
            { _id: user._id, role: 'normal', isAdmin: false },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        adminToken = jwt.sign(
            { _id: admin._id, role: 'admin', isAdmin: true },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        userId = user._id;
        adminId = admin._id;

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
            expect(response.body.data.length).toBe(1);
            expect(response.body.data[0].title).toBe('Test Blog');
        });
    });

    describe('GET /api/blogs/:id', () => {
        it('should get blog by id', async () => {
            const response = await request(app)
                .get(`/api/blogs/${testBlog._id}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.title).toBe('Test Blog');
        });

        it('should return 404 for non-existent blog', async () => {
            const fakeId = new mongoose.Types.ObjectId();
            const response = await request(app)
                .get(`/api/blogs/${fakeId}`)
                .expect(404);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe('Blog not found');
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
            expect(response.body.data.user._id.toString()).toBe(userId.toString());
        });

        it('should not create blog without authentication', async () => {
            const newBlog = {
                title: 'New Blog',
                content: 'New Content'
            };

            await request(app)
                .post('/api/blogs')
                .send(newBlog)
                .expect(401);
        });

        it('should not create blog without required fields', async () => {
            const response = await request(app)
                .post('/api/blogs')
                .set('Authorization', `Bearer ${userToken}`)
                .send({})
                .expect(400);

            expect(response.body.message).toContain('Please provide title and content');
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

            expect(response.body.data.title).toBe('Updated Title');
        });

        it('should not update blog without authentication', async () => {
            await request(app)
                .put(`/api/blogs/${testBlog._id}`)
                .send({ title: 'Updated' })
                .expect(401);
        });

        it('should not update another user\'s blog', async () => {
            // Create another user
            const anotherUser = await User.create({
                name: 'Another User',
                email: 'another@example.com',
                password: 'password123',
                role: 'normal'
            });

            const anotherBlog = await Blog.create({
                title: 'Another Blog',
                content: 'Another Content',
                user: anotherUser._id
            });

            const response = await request(app)
                .put(`/api/blogs/${anotherBlog._id}`)
                .set('Authorization', `Bearer ${userToken}`)
                .send({ title: 'Updated' })
                .expect(403);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe('Not authorized to update this blog');
        });

        it('should allow admin to update any blog', async () => {
            const response = await request(app)
                .put(`/api/blogs/${testBlog._id}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ title: 'Admin Updated' })
                .expect(200);

            expect(response.body.data.title).toBe('Admin Updated');
        });
    });

    describe('DELETE /api/blogs/:id', () => {
        it('should delete own blog', async () => {
            await request(app)
                .delete(`/api/blogs/${testBlog._id}`)
                .set('Authorization', `Bearer ${userToken}`)
                .expect(200);

            const blog = await Blog.findById(testBlog._id);
            expect(blog).toBeNull();
        });

        it('should not delete blog without authentication', async () => {
            await request(app)
                .delete(`/api/blogs/${testBlog._id}`)
                .expect(401);
        });

        it('should not delete another user\'s blog', async () => {
            const anotherUser = await User.create({
                name: 'Another User',
                email: 'another@example.com',
                password: 'password123',
                role: 'normal'
            });

            const anotherBlog = await Blog.create({
                title: 'Another Blog',
                content: 'Another Content',
                user: anotherUser._id
            });

            const response = await request(app)
                .delete(`/api/blogs/${anotherBlog._id}`)
                .set('Authorization', `Bearer ${userToken}`)
                .expect(403);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe('Not authorized to delete this blog');
        });

        it('should allow admin to delete any blog', async () => {
            await request(app)
                .delete(`/api/blogs/${testBlog._id}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(200);

            const blog = await Blog.findById(testBlog._id);
            expect(blog).toBeNull();
        });
    });
}); 