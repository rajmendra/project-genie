import { Router } from 'express';
import Message from '../models/Message.js';
import protect from '../middleware/auth.js';

const router = Router();

router.get('/', protect, async (req, res) => {
  try {
    const { branch } = req.query;
    const filter = { partner: req.partner._id };
    if (branch) filter.branch = branch;
    const messages = await Message.find(filter).populate('branch').sort({ createdAt: -1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', protect, async (req, res) => {
  try {
    const message = await Message.create({ ...req.body, partner: req.partner._id });
    res.status(201).json(message);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

export default router;
