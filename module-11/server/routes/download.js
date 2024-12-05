import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = express.Router();

router.get('/resume', (req, res) => {
    const filePath = path.join(__dirname, '../public/resume.pdf'); // Adjust path as needed
    res.download(filePath, 'NathanObenchain_Resume.pdf', (err) => {
        if (err) {
            res.status(500).send({
                message: "Could not download the file. " + err,
            });
        }
    });
});

export default router; 