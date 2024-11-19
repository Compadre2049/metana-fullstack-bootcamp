import mongoose from 'mongoose';
import { connectToDatabase } from '../db/dbconn.js';

describe('Database Connection', () => {
    afterAll(async () => {
        try {
            await mongoose.disconnect();
        } catch (err) {
            // Ignore disconnect errors
        }
    });

    it('should connect to MongoDB successfully', async () => {
        await connectToDatabase();
        expect(mongoose.connection.readyState).toBe(1);
    }, 10000);
}); 