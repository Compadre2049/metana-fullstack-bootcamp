import express from 'express';
import cors from 'cors';
import path from 'path';
import { connectToDatabase } from './db/dbconn.js';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

const app = express();

// Connect to MongoDB first
connectToDatabase()
    .then(async () => {
        console.log('Connected to MongoDB');

        // Middleware
        app.use(cors({
            origin: process.env.FRONTEND_ORIGIN,
            credentials: true
        }));
        app.use(express.json());
        app.use(express.urlencoded({ extended: true }));

        // Logging middleware
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

        // =========================================
        // Portfolio Routes
        // =========================================
        app.use('/api/contact', (await import('./routes/contact.js')).default);
        app.use('/api/download', (await import('./routes/download.js')).default);

        // Serve Portfolio static files
        app.use(express.static(path.join(__dirname, '../client/build')));

        // Portfolio main route
        app.get('/', (req, res) => {
            res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
        });

        // =========================================
        // BlogWhale Routes
        // =========================================
        // Blog API Routes
        app.use('/api/auth', (await import('./routes/authRouter.js')).default);
        app.use('/api/blogs', (await import('./routes/blogsRouter.js')).default);
        app.use('/api/users', (await import('./routes/usersRouter.js')).default);
        app.use('/api/private', (await import('./routes/privateRouter.js')).default);

        // Serve BlogWhale static files
        app.use('/blogwhale', express.static(path.join(__dirname, '../client/blogwhale/build')));

        // Handle BlogWhale routes
        app.get('/blogwhale/*', (req, res) => {
            res.sendFile(path.join(__dirname, '../client/blogwhale/build/index.html'));
        });

        // =========================================
        // Catch-all Route Handler
        // =========================================
        app.get('*', (req, res) => {
            if (req.path.startsWith('/blogwhale')) {
                res.sendFile(path.join(__dirname, '../client/blogwhale/build/index.html'));
            } else {
                res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
            }
        });

        // Error handler
        app.use((err, req, res, next) => {
            console.error(err.stack);
            res.status(500).send('Something broke!');
        });

        const PORT = process.env.PORT || 3001;
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    })
    .catch((error) => {
        console.error('Failed to connect to MongoDB:', error);
        process.exit(1);
    });

