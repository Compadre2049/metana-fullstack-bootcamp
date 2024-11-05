import request from 'supertest';
import express from 'express';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import authRouter from '../../routes/authRouter.js';
import User from '../../models/User.js';

let app;

beforeAll(async () => {
    app = express();
    app.use(express.json());
    app.use('/auth', authRouter);
});

beforeEach(async () => {
    // Clear users collection and drop indexes before each test
    try {
        await mongoose.connection.collection('users').dropIndexes();
    } catch (error) {
        // Ignore errors from dropping non-existent indexes
    }
    await User.deleteMany({});
});

describe('Auth Routes', () => {
    describe('POST /auth/register', () => {
        it('should register a new user successfully', async () => {
            const newUser = {
                name: 'Test User',
                email: 'test@example.com',
                password: 'Password123!'
            };

            const response = await request(app)
                .post('/auth/register')
                .send(newUser)
                .expect(201);

            expect(response.body).toHaveProperty('success', true);
            expect(response.body).toHaveProperty('message', 'User registered successfully');
        });

        it('should not register user with existing email', async () => {
            // Create initial user
            const hashedPassword = await bcrypt.hash('Password123!', 10);
            await User.create({
                name: 'Existing User',
                email: 'test@example.com',
                password: hashedPassword
            });

            const duplicateUser = {
                name: 'Test User',
                email: 'test@example.com',
                password: 'Password123!'
            };

            const response = await request(app)
                .post('/auth/register')
                .send(duplicateUser)
                .expect(400);

            expect(response.body).toHaveProperty('success', false);
            expect(response.body).toHaveProperty('message');
        });

        it('should validate required fields', async () => {
            const invalidUsers = [
                { name: 'Test User', email: 'test@example.com' }, // missing password
                { name: 'Test User', password: 'Password123!' },  // missing email
                { email: 'test@example.com', password: 'Password123!' } // missing name
            ];

            for (const invalidUser of invalidUsers) {
                const response = await request(app)
                    .post('/auth/register')
                    .send(invalidUser)
                    .expect(400);

                expect(response.body).toHaveProperty('success', false);
                expect(response.body).toHaveProperty('message');
            }
        });
    });

    describe('POST /auth/login', () => {
        beforeEach(async () => {
            // Create a test user with hashed password before each login test
            const hashedPassword = await bcrypt.hash('Password123!', 10);
            await User.create({
                name: 'Test User',
                email: 'test@example.com',
                password: hashedPassword
            });
        });

        it('should login successfully with correct credentials', async () => {
            const credentials = {
                email: 'test@example.com',
                password: 'Password123!'
            };

            const response = await request(app)
                .post('/auth/login')
                .send(credentials)
                .expect(200);

            expect(response.body).toHaveProperty('success', true);
            expect(response.body).toHaveProperty('token');
            expect(response.body.user).toHaveProperty('email', credentials.email.toLowerCase());
            expect(response.body.user).not.toHaveProperty('password');
        });

        it('should not login with incorrect password', async () => {
            const credentials = {
                email: 'test@example.com',
                password: 'WrongPassword123!'
            };

            const response = await request(app)
                .post('/auth/login')
                .send(credentials)
                .expect(401);

            expect(response.body).toHaveProperty('success', false);
            expect(response.body).toHaveProperty('message');
        });

        it('should not login with non-existent email', async () => {
            const credentials = {
                email: 'nonexistent@example.com',
                password: 'Password123!'
            };

            const response = await request(app)
                .post('/auth/login')
                .send(credentials)
                .expect(401);

            expect(response.body).toHaveProperty('success', false);
            expect(response.body).toHaveProperty('message');
        });

        it('should validate required login fields', async () => {
            const invalidCredentials = [
                { email: 'test@example.com' },  // missing password
                { password: 'Password123!' },    // missing email
                {}                              // missing both
            ];

            for (const credentials of invalidCredentials) {
                const response = await request(app)
                    .post('/auth/login')
                    .send(credentials)
                    .expect(400);

                expect(response.body).toHaveProperty('success', false);
                expect(response.body).toHaveProperty('message');
            }
        });
    });
}); 