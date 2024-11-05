import mongoose from 'mongoose';
import { jest } from '@jest/globals';
import Blog from '../../models/Blog.js';

// Create a simple User schema for testing
const userSchema = new mongoose.Schema({
    email: String,
    name: String
});
const User = mongoose.model('User', userSchema);

describe('Blog Model', () => {
    beforeAll(async () => {
        // Create a test user ID that we'll use in our tests
        const testUserId = new mongoose.Types.ObjectId();
        global.testUser = { _id: testUserId };
    });

    beforeEach(async () => {
        // Clear both blogs and users collections before each test
        await mongoose.connection.collection('blogs').deleteMany({});
        await mongoose.connection.collection('users').deleteMany({});
    });

    afterAll(async () => {
        // Cleanup after all tests
        await mongoose.connection.close();
    });

    it('should create a blog post successfully', async () => {
        const validBlog = new Blog({
            title: 'Test Blog',
            content: 'Test Content',
            user: global.testUser._id
        });

        const savedBlog = await validBlog.save();

        expect(savedBlog._id).toBeDefined();
        expect(savedBlog.title).toBe('Test Blog');
        expect(savedBlog.content).toBe('Test Content');
        expect(savedBlog.user).toEqual(global.testUser._id);
        expect(savedBlog.createdAt).toBeDefined();
        expect(savedBlog.updatedAt).toBeDefined();
    });

    it('should fail validation without required fields', async () => {
        const blogWithoutTitle = new Blog({
            content: 'Test Content',
            user: global.testUser._id
        });

        const blogWithoutContent = new Blog({
            title: 'Test Blog',
            user: global.testUser._id
        });

        const blogWithoutUser = new Blog({
            title: 'Test Blog',
            content: 'Test Content'
        });

        await expect(blogWithoutTitle.save()).rejects.toThrow();
        await expect(blogWithoutContent.save()).rejects.toThrow();
        await expect(blogWithoutUser.save()).rejects.toThrow();
    });

    it('should trim the title field', async () => {
        const blogWithUntrimmedTitle = new Blog({
            title: '  Test Blog  ',
            content: 'Test Content',
            user: global.testUser._id
        });

        const savedBlog = await blogWithUntrimmedTitle.save();
        expect(savedBlog.title).toBe('Test Blog');
    });

    it('should have timestamps', async () => {
        const blog = new Blog({
            title: 'Test Blog',
            content: 'Test Content',
            user: global.testUser._id
        });

        const savedBlog = await blog.save();

        expect(savedBlog.createdAt).toBeInstanceOf(Date);
        expect(savedBlog.updatedAt).toBeInstanceOf(Date);
    });

    it('should update timestamps on modification', async () => {
        const blog = new Blog({
            title: 'Test Blog',
            content: 'Test Content',
            user: global.testUser._id
        });

        const savedBlog = await blog.save();
        const originalUpdatedAt = savedBlog.updatedAt;

        // Wait a bit to ensure timestamp will be different
        await new Promise(resolve => setTimeout(resolve, 100));

        savedBlog.content = 'Updated Content';
        const updatedBlog = await savedBlog.save();

        expect(updatedBlog.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
    });

    it('should populate user reference', async () => {
        // Create a test user using the User model
        const user = new User({
            _id: global.testUser._id,
            email: 'test@example.com',
            name: 'Test User'
        });
        await user.save();

        const blog = new Blog({
            title: 'Test Blog',
            content: 'Test Content',
            user: global.testUser._id
        });

        await blog.save();

        const populatedBlog = await Blog.findById(blog._id).populate('user');

        expect(populatedBlog.user).toBeDefined();
        expect(populatedBlog.user._id).toEqual(global.testUser._id);
        expect(populatedBlog.user.email).toBe('test@example.com');
    });

    it('should handle invalid user references', async () => {
        const invalidUserId = new mongoose.Types.ObjectId();
        const blog = new Blog({
            title: 'Test Blog',
            content: 'Test Content',
            user: invalidUserId
        });

        await blog.save();
        const populatedBlog = await Blog.findById(blog._id).populate('user');

        expect(populatedBlog.user).toBeNull();
    });
}); 