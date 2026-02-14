import { Router } from 'express';
import Notification from '../models/Notification.js';
import protect from '../middleware/auth.js';

const router = Router();

router.get('/', protect, async (req, res) => {
  try {
    const { branch, type } = req.query;
    const filter = { partner: req.partner._id };
    if (branch) filter.branch = branch;
    if (type) filter.type = type;
    const notifications = await Notification.find(filter).populate('branch').sort({ createdAt: -1 });
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id', protect, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id).populate('branch');
    if (!notification) return res.status(404).json({ message: 'Not found' });
    res.json(notification);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.patch('/:id/read', protect, async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id, { isRead: true }, { new: true }
    );
    res.json(notification);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

export default router;
