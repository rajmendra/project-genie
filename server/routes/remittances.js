import { Router } from 'express';
import Remittance from '../models/Remittance.js';
import protect from '../middleware/auth.js';

const router = Router();

router.get('/', protect, async (req, res) => {
  try {
    const { branch, status, startDate, endDate, search } = req.query;
    const filter = { partner: req.partner._id };
    if (branch) filter.branch = branch;
    if (status) filter.status = status;
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }
    if (search) {
      filter.$or = [
        { invoiceNo: { $regex: search, $options: 'i' } },
        { memberName: { $regex: search, $options: 'i' } },
      ];
    }
    const remittances = await Remittance.find(filter).populate('branch').sort({ date: -1 });
    res.json(remittances);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', protect, async (req, res) => {
  try {
    const remittance = await Remittance.create({ ...req.body, partner: req.partner._id });
    res.status(201).json(remittance);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

export default router;
