import { Router } from 'express';
import FreezeAlert from '../models/FreezeAlert.js';
import protect from '../middleware/auth.js';

const router = Router();

router.get('/', protect, async (req, res) => {
  try {
    const { branch } = req.query;
    const filter = {};
    if (branch) filter.branch = branch;
    const alerts = await FreezeAlert.find(filter).populate('branch').sort({ createdAt: -1 });
    res.json(alerts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
