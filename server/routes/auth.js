import { Router } from 'express';
import jwt from 'jsonwebtoken';
import Partner from '../models/Partner.js';
import '../models/Branch.js';
import protect from '../middleware/auth.js';

const router = Router();

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

router.post('/login', async (req, res) => {
  try {
    const { vendorCode, password } = req.body;
    const partner = await Partner.findOne({ vendorCode }).populate('branches');
    if (!partner || !(await partner.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid vendor code or password' });
    }
    res.json({
      _id: partner._id,
      vendorCode: partner.vendorCode,
      name: partner.name,
      branches: partner.branches,
      token: generateToken(partner._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/me', protect, async (req, res) => {
  res.json(req.partner);
});

export default router;
