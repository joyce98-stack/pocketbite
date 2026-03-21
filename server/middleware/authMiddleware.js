import jwt from 'jsonwebtoken';

// Middleware to verify if any user is logged in
export const verifyToken = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) return res.status(401).json({ message: "Access denied. Please login." });

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET || 'your_fallback_secret');
    req.user = verified; // Adds {id, role} to the request object
    next();
  } catch (error) {
    res.status(400).json({ message: "Invalid token" });
  }
};

// Middleware to verify if the user is an ADMIN
export const verifyAdmin = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user.role === 'admin') {
      next();
    } else {
      res.status(403).json({ message: "Access denied. Admins only." });
    }
  });
};