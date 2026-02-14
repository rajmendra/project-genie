import { Router } from 'express';
import Session from '../models/Session.js';
import protect from '../middleware/auth.js';

const router = Router();

router.get('/', protect, async (req, res) => {
  try {
    const { branch, status } = req.query;
    const filter = {};
    if (branch) filter.branch = branch;
    if (status) filter.status = status;
    const sessions = await Session.find(filter).populate('branch').sort({ startTime: -1 });
    res.json(sessions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', protect, async (req, res) => {
  try {
    const session = await Session.create(req.body);
    res.status(201).json(session);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.patch('/:id/action', protect, async (req, res) => {
  try {
    const { action } = req.body;
    const session = await Session.findById(req.params.id);
    if (!session) return res.status(404).json({ message: 'Session not found' });
    if (action === 'end') session.status = 'completed';
    else if (action === 'extend') session.endTime = new Date(session.endTime.getTime() + 30 * 60000);
    await session.save();
    res.json(session);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

export default router;
