import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/jwt.js';
import User from '../modules/auth/user.model.js';

export default async function (req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: 'No token' });
  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = await User.findById(payload.id);
    next();
  } catch (err) { res.status(401).json({ message: 'Invalid token' }); }
};
