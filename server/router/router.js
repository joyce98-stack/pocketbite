import express from 'express';
import { register, login, logout } from '../controllers/authController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public Routes
router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);

// Example of a Protected Route
router.get('/check-auth', verifyToken, (req, res) => {
  res.status(200).json({ message: "You are authenticated!", user: req.user });
});

export default router;