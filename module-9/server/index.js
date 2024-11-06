import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectToDatabase } from './db/dbconn.js';
import authRouter from './routes/authRouter.js';
import blogsRouter from './routes/blogsRouter.js';
import usersRouter from './routes/usersRouter.js';

dotenv.config();

const app = express();

// Connect to MongoDB first
connectToDatabase()
  .then(() => {
    console.log('Connected to MongoDB');

    // Middleware
    app.use(cors({
      origin: process.env.FRONTEND_ORIGIN,
      credentials: true
    }));
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    // Add this before your routes
    app.use((req, res, next) => {
      console.log(`${req.method} ${req.path}`, {
        body: req.body,
        headers: {
          'content-type': req.headers['content-type'],
          'authorization': req.headers['authorization'] ? 'present' : 'absent'
        }
      });
      next();
    });

    // Routes
    app.use('/api/auth', authRouter);
    app.use('/api/blogs', blogsRouter);
    app.use('/api/users', usersRouter);

    const PORT = process.env.PORT || 3001;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Failed to connect to MongoDB:', error);
    process.exit(1);
  });
