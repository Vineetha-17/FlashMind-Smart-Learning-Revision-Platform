const express = require('express');
const router = express.Router();
const { getPlatformStats, deleteUser } = require('../controllers/adminController');
const { protect, admin } = require('../middleware/authMiddleware');

router.use(protect);
router.use(admin); // enforce admin role for all routes here

router.get('/stats', getPlatformStats);
router.delete('/users/:id', deleteUser);

module.exports = router;
