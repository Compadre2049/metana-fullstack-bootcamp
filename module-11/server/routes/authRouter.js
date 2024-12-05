import express from 'express';
import { login, register } from '../controllers/authController.js';

const authRouter = express.Router();

// Add console.log to see if route is registered
console.log('Registering auth routes');

authRouter.post('/login', (req, res, next) => {
    console.log('Login route hit');
    login(req, res, next);
});

authRouter.post('/register', register);

export default authRouter;
