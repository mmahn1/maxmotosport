const express = require('express');
const router = express.Router();


router.get('/check-admin', (req, res) => {
    if (req.session.user && req.session.user.role === 'admin') {
        res.json({ isAdmin: true });
    } else {
        res.json({ isAdmin: false });
    }
});

module.exports = router;
