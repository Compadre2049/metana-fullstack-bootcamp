import mongoose from 'mongoose';
import User from '../../models/User.js';
import Blog from '../../models/Blog.js';

describe('User Model', () => {
    beforeAll(async () => {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/test');
    });

    beforeEach(async () => {
        await User.deleteMany({});
        await Blog.deleteMany({});
    });

    afterAll(async () => {
        await mongoose.connection.close();
    });

    describe('Schema Validation', () => {
        it('should create a user with valid fields', async () => {
            const validUser = new User({
                name: 'Test User',
                email: 'test@example.com',
                password: 'password123',
                role: 'normal'
            });

            const savedUser = await validUser.save();
            expect(savedUser._id).toBeDefined();
            expect(savedUser.email).toBe('test@example.com');
            expect(savedUser.role).toBe('normal');
        });

        it('should enforce required fields', async () => {
            const invalidUser = new User({});
            await expect(invalidUser.save()).rejects.toThrow();
        });

        it('should enforce email uniqueness', async () => {
            // Create first user
            const firstUser = await User.create({
                name: 'First User',
                email: 'test@example.com',
                password: 'password123',
                role: 'normal'
            });

            // Try to create second user with same email
            const duplicateUser = new User({
                name: 'Second User',
                email: 'test@example.com',
                password: 'password456',
                role: 'normal'
            });

            // Validate should fail
            const validationError = await duplicateUser.validate().catch(err => err);
            expect(validationError).toBeDefined();
            expect(validationError.errors.email).toBeDefined();
            expect(validationError.errors.email.message).toBe('Email already exists');

            // Try to save (should also fail)
            await expect(duplicateUser.save()).rejects.toThrow('Email already exists');

            // Verify only one user exists
            const count = await User.countDocuments();
            expect(count).toBe(1);
        });

        it('should convert email to lowercase', async () => {
            const user = await User.create({
                name: 'Test User',
                email: 'TEST@EXAMPLE.COM',
                password: 'password123'
            });

            expect(user.email).toBe('test@example.com');
        });
    });

    describe('Middleware Functionality', () => {
        it('should delete associated blogs when user is deleted', async () => {
            const user = await User.create({
                name: 'Test User',
                email: 'test@example.com',
                password: 'password123'
            });

            await Blog.create([
                { title: 'Blog 1', content: 'Content 1', user: user._id },
                { title: 'Blog 2', content: 'Content 2', user: user._id }
            ]);

            await user.deleteOne();

            const remainingBlogs = await Blog.countDocuments({ user: user._id });
            expect(remainingBlogs).toBe(0);
        });
    });
}); 