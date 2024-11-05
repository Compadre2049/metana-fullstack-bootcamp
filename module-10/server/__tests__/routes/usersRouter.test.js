import { jest } from '@jest/globals';
import request from 'supertest';
import express from 'express';
import mongoose from 'mongoose';
import usersRouter from '../../routes/usersRouter.js';
import User from '../../models/User.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

describe('Users Router', () => {
    let app;
    let adminUser;
    let normalUser;
    let adminToken;
    let normalUserToken;

    beforeAll(async () => {
        app = express();
        app.use(express.json());

        // Mock auth middleware
        app.use((req, res, next) => {
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
                // Ensure proper user object structure
                req.user = {
                    _id: new mongoose.Types.ObjectId(decoded._id),
                    email: decoded.email,
                    role: decoded.role
                };
                next();
            } catch (error) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid token'
                });
            }
        });

        app.use('/users', usersRouter);
    });

    beforeEach(async () => {
        // Clear database
        await User.deleteMany({});

        // Create admin user
        adminUser = await User.create({
            name: 'Admin User',
            email: 'admin@example.com',
            password: await bcrypt.hash('password123', 10),
            role: 'admin'
        });

        // Create normal user
        normalUser = await User.create({
            name: 'Normal User',
            email: 'test@example.com',
            password: await bcrypt.hash('password123', 10),
            role: 'normal'
        });

        // Generate tokens
        adminToken = jwt.sign({
            _id: adminUser._id.toString(),
            email: adminUser.email,
            role: 'admin'
        }, process.env.JWT_SECRET || 'test-secret');

        normalUserToken = jwt.sign({
            _id: normalUser._id.toString(),
            email: normalUser.email,
            role: 'normal'
        }, process.env.JWT_SECRET || 'test-secret');
    });

    describe('PUT /update-name', () => {
        it('should update user name when authenticated', async () => {
            const response = await request(app)
                .put('/users/update-name')
                .set('Authorization', `Bearer ${normalUserToken}`)
                .send({ name: 'Updated Name' });

            expect(response.status).toBe(200);
            expect(response.body.message).toBe('Name updated successfully');
            expect(response.body.user.name).toBe('Updated Name');
            expect(response.body.user.email).toBe(normalUser.email);
        });

        it('should not update name without authentication', async () => {
            const response = await request(app)
                .put('/users/update-name')
                .send({ name: 'Updated Name' });

            expect(response.status).toBe(401);
        });
    });

    describe('GET /', () => {
        it('should return all users when admin authenticated', async () => {
            const response = await request(app)
                .get('/users')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(response.status).toBe(200);
            expect(response.body.length).toBe(2);
            expect(response.body[0].password).toBeUndefined();
        });

        it('should not allow non-admin access', async () => {
            const response = await request(app)
                .get('/users')
                .set('Authorization', `Bearer ${normalUserToken}`);

            expect(response.status).toBe(403);
        });
    });

    describe('PUT /:id', () => {
        it('should allow admin to update any user including role', async () => {
            // First verify the user exists and is 'normal'
            const userBefore = await User.findById(normalUser._id);
            expect(userBefore.role).toBe('normal');

            const response = await request(app)
                .put(`/users/${normalUser._id}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    name: 'Updated By Admin',
                    email: 'updated@example.com',
                    role: 'admin'
                });

            console.log('Update response:', response.body);

            expect(response.status).toBe(200);
            expect(response.body.name).toBe('Updated By Admin');
            expect(response.body.email).toBe('updated@example.com');
            expect(response.body.role).toBe('admin');

            // Verify the update in database
            const updatedUser = await User.findById(normalUser._id);
            expect(updatedUser.role).toBe('admin');
        });

        it('should allow users to update their own info but not role', async () => {
            const response = await request(app)
                .put(`/users/${normalUser._id}`)
                .set('Authorization', `Bearer ${normalUserToken}`)
                .send({
                    name: 'Self Updated',
                    email: 'self@example.com'
                });

            expect(response.status).toBe(200);
            expect(response.body.name).toBe('Self Updated');
            expect(response.body.email).toBe('self@example.com');
            expect(response.body.role).toBe('normal');
        });

        it('should not allow users to update other users', async () => {
            const response = await request(app)
                .put(`/users/${adminUser._id}`)
                .set('Authorization', `Bearer ${normalUserToken}`)
                .send({ name: 'Hacked Name' });

            expect(response.status).toBe(403);
        });

        it('should not allow setting invalid role', async () => {
            const response = await request(app)
                .put(`/users/${normalUser._id}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    name: 'Test User',
                    role: 'invalid_role'
                });

            expect(response.status).toBe(400);
            expect(response.body.error).toMatch(/validation failed/i);
        });
    });

    describe('POST /', () => {
        it('should allow admin to create new user', async () => {
            const newUser = {
                name: 'New User',
                email: 'new@example.com',
                password: 'password123',
                role: 'normal'
            };

            const response = await request(app)
                .post('/users')
                .set('Authorization', `Bearer ${adminToken}`)
                .send(newUser);

            expect(response.status).toBe(201);
            expect(response.body.name).toBe(newUser.name);
            expect(response.body.email).toBe(newUser.email);
            expect(response.body.password).toBeUndefined();

            // Verify password was hashed
            const savedUser = await User.findOne({ email: newUser.email });
            expect(await bcrypt.compare(newUser.password, savedUser.password)).toBe(true);
        });

        it('should not allow non-admin to create users', async () => {
            const response = await request(app)
                .post('/users')
                .set('Authorization', `Bearer ${normalUserToken}`)
                .send({
                    name: 'New User',
                    email: 'new@example.com',
                    password: 'password123'
                });

            expect(response.status).toBe(403);
        });
    });

    describe('DELETE /:id', () => {
        it('should delete user when authorized', async () => {
            const response = await request(app)
                .delete(`/users/${normalUser._id}`)
                .set('Authorization', `Bearer ${adminToken}`);

            expect(response.status).toBe(200);

            // Verify user was deleted
            const deletedUser = await User.findById(normalUser._id);
            expect(deletedUser).toBeNull();
        });

        it('should not allow unauthorized deletion', async () => {
            const response = await request(app)
                .delete(`/users/${adminUser._id}`)
                .set('Authorization', `Bearer ${normalUserToken}`);

            expect(response.status).toBe(403);
        });
    });

    afterAll(async () => {
        await User.deleteMany({});
        await mongoose.connection.close();
    });
}); 