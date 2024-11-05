import mongoose from 'mongoose';
import { jest } from '@jest/globals';
import User from '../../models/User.js';

describe('User Model', () => {
    beforeAll(async () => {
        // Drop the database before all tests
        await mongoose.connection.dropDatabase();
    });

    beforeEach(async () => {
        // Clear the users collection before each test
        await User.deleteMany({});
    });

    afterAll(async () => {
        await mongoose.connection.close();
    });

    it('should create a user successfully', async () => {
        const validUser = new User({
            name: 'Test User',
            email: 'test@example.com',
            password: 'password123',
            role: 'normal'
        });

        const savedUser = await validUser.save();

        expect(savedUser._id).toBeDefined();
        expect(savedUser.name).toBe('Test User');
        expect(savedUser.email).toBe('test@example.com');
        expect(savedUser.password).toBe('password123');
        expect(savedUser.role).toBe('normal');
        expect(savedUser.createdAt).toBeDefined();
        expect(savedUser.updatedAt).toBeDefined();
    });

    it('should fail validation without required fields', async () => {
        const userWithoutName = new User({
            email: 'test@example.com',
            password: 'password123'
        });

        const userWithoutEmail = new User({
            name: 'Test User',
            password: 'password123'
        });

        const userWithoutPassword = new User({
            name: 'Test User',
            email: 'test@example.com'
        });

        await expect(userWithoutName.save()).rejects.toThrow();
        await expect(userWithoutEmail.save()).rejects.toThrow();
        await expect(userWithoutPassword.save()).rejects.toThrow();
    });

    it('should enforce unique email addresses', async () => {
        // Create first user
        const firstUser = await User.create({
            name: 'First User',
            email: 'test@example.com',
            password: 'password123'
        });

        // Wait for index to be created
        await new Promise(resolve => setTimeout(resolve, 100));

        // Try to create second user with same email
        const duplicateUser = {
            name: 'Second User',
            email: 'test@example.com',
            password: 'password456'
        };

        await expect(async () => {
            await User.create(duplicateUser);
        }).rejects.toThrow();
    });

    it('should default to "normal" role if not specified', async () => {
        const user = new User({
            name: 'Test User',
            email: 'test@example.com',
            password: 'password123'
        });

        const savedUser = await user.save();
        expect(savedUser.role).toBe('normal');
    });

    it('should only accept valid role values', async () => {
        const userWithInvalidRole = new User({
            name: 'Test User',
            email: 'test@example.com',
            password: 'password123',
            role: 'superuser'  // Invalid role
        });

        await expect(userWithInvalidRole.save()).rejects.toThrow();
    });

    it('should accept valid admin role', async () => {
        const adminUser = new User({
            name: 'Admin User',
            email: 'admin@example.com',
            password: 'password123',
            role: 'admin'
        });

        const savedUser = await adminUser.save();
        expect(savedUser.role).toBe('admin');
    });

    it('should have timestamps', async () => {
        const user = new User({
            name: 'Test User',
            email: 'test@example.com',
            password: 'password123'
        });

        const savedUser = await user.save();
        expect(savedUser.createdAt).toBeInstanceOf(Date);
        expect(savedUser.updatedAt).toBeInstanceOf(Date);
    });

    it('should update timestamps on modification', async () => {
        const user = new User({
            name: 'Test User',
            email: 'test@example.com',
            password: 'password123'
        });

        const savedUser = await user.save();
        const originalUpdatedAt = savedUser.updatedAt;

        // Wait a bit to ensure timestamp will be different
        await new Promise(resolve => setTimeout(resolve, 100));

        savedUser.name = 'Updated Name';
        const updatedUser = await savedUser.save();

        expect(updatedUser.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
    });

    it('should handle email case sensitivity correctly', async () => {
        // Create first user
        await User.create({
            name: 'Test User',
            email: 'test@example.com',
            password: 'password123'
        });

        // Wait for index to be created
        await new Promise(resolve => setTimeout(resolve, 100));

        // Try to create user with same email but different case
        const duplicateUser = {
            name: 'Another User',
            email: 'TEST@example.com',
            password: 'password456'
        };

        await expect(async () => {
            await User.create(duplicateUser);
        }).rejects.toThrow();
    });

    it('should handle special characters in name', async () => {
        const user = new User({
            name: 'José María García-López Jr.',
            email: 'test@example.com',
            password: 'password123'
        });

        const savedUser = await user.save();
        expect(savedUser.name).toBe('José María García-López Jr.');
    });

    it('should convert email to lowercase before saving', async () => {
        const user = new User({
            name: 'Test User',
            email: 'TEST@EXAMPLE.COM',
            password: 'password123'
        });

        const savedUser = await user.save();
        expect(savedUser.email).toBe('test@example.com');
    });
}); 