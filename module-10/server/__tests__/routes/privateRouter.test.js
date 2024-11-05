import { jest } from '@jest/globals';
import request from 'supertest';
import express from 'express';
import mongoose from 'mongoose';
import privateRouter from '../../routes/privateRouter.js';
import User from '../../models/User.js';
import Blog from '../../models/Blog.js';
import jwt from 'jsonwebtoken';

describe('Private Router', () => {
    let app;
    let adminUser;
    let normalUser;
    let adminToken;

    beforeAll(async () => {
        app = express();
        app.use(express.json());
        app.use('/private', privateRouter);
    });

    beforeEach(async () => {
        // Clear database
        await User.deleteMany({});
        await Blog.deleteMany({});

        // Create admin user
        adminUser = await User.create({
            name: 'Admin User',
            email: 'admin@example.com',
            password: 'password123',
            role: 'admin'
        });

        // Create normal user
        normalUser = await User.create({
            name: 'Normal User',
            email: 'test@example.com',
            password: 'password123',
            role: 'normal'
        });

        // Create some test blogs
        await Blog.create([
            {
                title: 'Blog 1',
                content: 'Content 1',
                user: normalUser._id
            },
            {
                title: 'Blog 2',
                content: 'Content 2',
                user: normalUser._id
            },
            {
                title: 'Admin Blog',
                content: 'Admin Content',
                user: adminUser._id
            }
        ]);

        // Generate admin token
        adminToken = jwt.sign({
            _id: adminUser._id.toString(),
            email: adminUser.email,
            role: 'admin'
        }, process.env.JWT_SECRET || 'test-secret');
    });

    describe('GET /', () => {
        it('should return users and statistics when admin authenticated', async () => {
            const response = await request(app)
                .get('/private')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(response.status).toBe(200);
            expect(response.body.users).toBeDefined();
            expect(response.body.users.length).toBe(2);
            expect(response.body.statistics).toBeDefined();
            expect(response.body.statistics.totalUsers).toBe(2);
            expect(response.body.statistics.totalBlogs).toBe(3);
            expect(response.body.statistics.blogsPerAuthor).toBeDefined();
            expect(response.body.statistics.blogsPerAuthor.length).toBe(2);

            // Verify blog count per author
            const normalUserStats = response.body.statistics.blogsPerAuthor
                .find(stats => stats.author.email === 'test@example.com');
            expect(normalUserStats.count).toBe(2);

            const adminStats = response.body.statistics.blogsPerAuthor
                .find(stats => stats.author.email === 'admin@example.com');
            expect(adminStats.count).toBe(1);
        });

        it('should not allow non-admin access', async () => {
            const normalUserToken = jwt.sign({
                _id: normalUser._id.toString(),
                email: normalUser.email,
                role: 'normal'
            }, process.env.JWT_SECRET || 'test-secret');

            const response = await request(app)
                .get('/private')
                .set('Authorization', `Bearer ${normalUserToken}`);

            expect(response.status).toBe(403);
        });
    });

    describe('DELETE /users/:userId', () => {
        it('should delete user and their blogs when admin authenticated', async () => {
            const response = await request(app)
                .delete(`/private/users/${normalUser._id}`)
                .set('Authorization', `Bearer ${adminToken}`);

            expect(response.status).toBe(200);
            expect(response.body.message).toBe('User and associated blogs deleted successfully');

            // Verify user was deleted
            const deletedUser = await User.findById(normalUser._id);
            expect(deletedUser).toBeNull();

            // Verify user's blogs were deleted
            const userBlogs = await Blog.find({ user: normalUser._id });
            expect(userBlogs.length).toBe(0);
        });

        it('should not allow deleting admin user', async () => {
            const response = await request(app)
                .delete(`/private/users/${adminUser._id}`)
                .set('Authorization', `Bearer ${adminToken}`);

            expect(response.status).toBe(403);
            expect(response.body.error).toBe('Cannot delete admin user');

            // Verify admin still exists
            const adminStillExists = await User.findById(adminUser._id);
            expect(adminStillExists).toBeTruthy();
        });

        it('should not allow non-admin to delete users', async () => {
            const normalUserToken = jwt.sign({
                _id: normalUser._id.toString(),
                email: normalUser.email,
                role: 'normal'
            }, process.env.JWT_SECRET || 'test-secret');

            const response = await request(app)
                .delete(`/private/users/${normalUser._id}`)
                .set('Authorization', `Bearer ${normalUserToken}`);

            expect(response.status).toBe(403);
        });
    });

    afterAll(async () => {
        await User.deleteMany({});
        await Blog.deleteMany({});
        await mongoose.connection.close();
    });
}); 