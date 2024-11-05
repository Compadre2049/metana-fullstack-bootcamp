import mongoose from 'mongoose';
import { connectToDatabase } from '../db/dbconn.js';

describe('Database Connection', () => {
    // Store original env variables
    const originalEnv = { ...process.env };

    beforeEach(async () => {
        // Reset connection before each test
        if (mongoose.connection.readyState !== 0) {
            await mongoose.connection.close();
        }
        // Reset env variables
        process.env = { ...originalEnv };
    });

    afterAll(async () => {
        // Cleanup after all tests
        if (mongoose.connection.readyState !== 0) {
            await mongoose.connection.close();
        }
        // Restore original env variables
        process.env = originalEnv;
    });

    it('should connect to MongoDB with correct configuration', async () => {
        await connectToDatabase();

        expect(mongoose.connection.readyState).toBe(1);
        expect(mongoose.connection.db.databaseName).toBe(process.env.MONGO_DB_NAME);

        // Get write concern from connection options
        const options = mongoose.connection.getClient().options;
        expect(options.writeConcern?.w).toBe('majority');
    }, 30000);  // Set timeout directly on the test

    it('should throw error when MONGO_URI is invalid', async () => {
        // Close existing connection and clear cached connections
        await mongoose.connection.close();
        mongoose.connections.length = 0;

        // Set invalid URI with a non-existent host
        const originalUri = process.env.MONGO_URI;
        process.env.MONGO_URI = 'mongodb://non-existent-host:27017';

        // Expect the connection to fail quickly
        await expect(async () => {
            await Promise.race([
                connectToDatabase(),
                new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('Connection timeout')), 5000)
                )
            ]);
        }).rejects.toThrow();

        // Restore original URI
        process.env.MONGO_URI = originalUri;
    }, 30000);  // Set timeout directly on the test

    it('should throw error when MONGO_URI is missing', async () => {
        // Close existing connection and clear cached connections
        await mongoose.connection.close();
        mongoose.connections.length = 0;

        // Remove MONGO_URI
        const originalUri = process.env.MONGO_URI;
        delete process.env.MONGO_URI;

        // Test that it throws immediately
        await expect(connectToDatabase()).rejects.toThrow('undefined');

        // Restore original URI
        process.env.MONGO_URI = originalUri;
    }, 30000);  // Set timeout directly on the test

    it('should use default database name when MONGO_DB_NAME is not set', async () => {
        // Close existing connection and clear cached connections
        await mongoose.connection.close();
        mongoose.connections.length = 0;

        // Remove MONGO_DB_NAME
        const originalDbName = process.env.MONGO_DB_NAME;
        delete process.env.MONGO_DB_NAME;

        await connectToDatabase();

        const dbName = mongoose.connection.db.databaseName;
        expect(dbName).toBe('test');

        // Restore DB name
        process.env.MONGO_DB_NAME = originalDbName;
    }, 30000);  // Set timeout directly on the test
}); 