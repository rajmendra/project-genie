import jwt from 'jsonwebtoken';
import Partner from '../models/Partner.js';

const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Not authorized' });
  }
  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.partner = await Partner.findById(decoded.id).select('-password').populate('branches');
    if (!req.partner) return res.status(401).json({ message: 'Not authorized' });
    next();
  } catch {
    res.status(401).json({ message: 'Token invalid' });
  }
};

export default protect;
