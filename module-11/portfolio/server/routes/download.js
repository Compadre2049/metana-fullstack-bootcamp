const express = require('express');
const router = express.Router();
const path = require('path');

router.get('/cv', (req, res) => {
    const cvPath = path.join(__dirname, '../public/assets/Nathan-CV.txt');
    res.download(cvPath, 'Nathan-CV.txt', (err) => {
        if (err) {
            res.status(500).send({
                message: "Could not download the file"
            });
        }
    });
});

module.exports = router; 