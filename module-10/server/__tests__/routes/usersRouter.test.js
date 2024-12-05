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
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/test');

        app = express();
        app.use(express.json());

        // Mock auth middleware to match actual middleware
        app.use((req, res, next) => {
            if (req.method === 'GET' && !req.headers.authorization) {
                return res.status(401).json({ success: false, message: 'No token provided' });
            }

            const token = req.headers.authorization?.split(' ')[1];
            if (!token && req.method !== 'GET') {
                return res.status(401).json({ success: false, message: 'No token provided' });
            }

            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET || 'test-secret');
                req.user = {
                    _id: decoded.id,
                    email: decoded.email,
                    role: decoded.role
                };
                next();
            } catch (error) {
                res.status(401).json({ success: false, message: 'Invalid token' });
            }
        });

        app.use('/users', usersRouter);
    });

    beforeEach(async () => {
        await User.deleteMany({});

        // Create test users
        adminUser = await User.create({
            name: 'Admin User',
            email: 'admin@example.com',
            password: await bcrypt.hash('password123', 10),
            role: 'admin'
        });

        normalUser = await User.create({
            name: 'Normal User',
            email: 'test@example.com',
            password: await bcrypt.hash('password123', 10),
            role: 'normal'
        });

        // Generate tokens
        adminToken = jwt.sign({
            id: adminUser._id.toString(),
            email: adminUser.email,
            role: 'admin'
        }, process.env.JWT_SECRET || 'test-secret');

        normalUserToken = jwt.sign({
            id: normalUser._id.toString(),
            email: normalUser.email,
            role: 'normal'
        }, process.env.JWT_SECRET || 'test-secret');
    });

    describe('Core User Operations', () => {
        it('should update user name when authenticated', async () => {
            const response = await request(app)
                .put('/users/update-name')
                .set('Authorization', `Bearer ${normalUserToken}`)
                .send({ name: 'Updated Name' })
                .expect(200);

            expect(response.body.message).toBe('Name updated successfully');
            expect(response.body.user.name).toBe('Updated Name');
            expect(response.body.user.email).toBe(normalUser.email);
        });

        it('should get all users as admin', async () => {
            const response = await request(app)
                .get('/users')
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(200);

            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body.length).toBe(2);
            expect(response.body[0].password).toBeUndefined();
        });

        it('should create new user as admin', async () => {
            const newUser = {
                name: 'New User',
                email: 'new@example.com',
                password: 'password123',
                role: 'normal'
            };

            const response = await request(app)
                .post('/users')
                .set('Authorization', `Bearer ${adminToken}`)
                .send(newUser)
                .expect(201);

            expect(response.body.name).toBe(newUser.name);
            expect(response.body.email).toBe(newUser.email);
            expect(response.body.password).toBeUndefined();
        });

        it('should delete user and associated blogs as admin', async () => {
            const response = await request(app)
                .delete(`/users/${normalUser._id}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe('User and all associated blogs deleted successfully');

            const deletedUser = await User.findById(normalUser._id);
            expect(deletedUser).toBeNull();
        });
    });

    afterAll(async () => {
        await mongoose.connection.close();
    });
}); 