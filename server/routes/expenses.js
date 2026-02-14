import { Router } from 'express';
import Expense from '../models/Expense.js';
import protect from '../middleware/auth.js';

const router = Router();

router.get('/', protect, async (req, res) => {
  try {
    const { branch, status } = req.query;
    const filter = { partner: req.partner._id };
    if (branch) filter.branch = branch;
    if (status) filter.status = status;
    else filter.status = { $ne: 'deleted' };
    const expenses = await Expense.find(filter).populate('branch').sort({ date: -1 });
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', protect, async (req, res) => {
  try {
    const expense = await Expense.create({ ...req.body, partner: req.partner._id });
    res.status(201).json(expense);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.put('/:id', protect, async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense) return res.status(404).json({ message: 'Expense not found' });
    const historyEntry = {
      previousAmount: expense.amount,
      newAmount: req.body.amount || expense.amount,
      previousCategory: expense.category,
      newCategory: req.body.category || expense.category,
      editedBy: req.partner.name,
    };
    expense.editHistory.push(historyEntry);
    Object.assign(expense, req.body);
    await expense.save();
    res.json(expense);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.delete('/:id', protect, async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense) return res.status(404).json({ message: 'Expense not found' });
    expense.status = 'deleted';
    await expense.save();
    res.json({ message: 'Expense deleted' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

export default router;
