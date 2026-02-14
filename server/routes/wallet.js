import { Router } from 'express';
import Wallet from '../models/Wallet.js';
import WalletTransaction from '../models/WalletTransaction.js';
import protect from '../middleware/auth.js';

const router = Router();

router.get('/balance', protect, async (req, res) => {
  try {
    const { branch } = req.query;
    const filter = { partner: req.partner._id };
    if (branch) filter.branch = branch;
    const wallets = await Wallet.find(filter).populate('branch');
    res.json(wallets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/history', protect, async (req, res) => {
  try {
    const { branch } = req.query;
    const filter = { partner: req.partner._id };
    if (branch) filter.branch = branch;
    const transactions = await WalletTransaction.find(filter)
      .populate('branch')
      .sort({ createdAt: -1 });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/add-money', protect, async (req, res) => {
  try {
    const { branch, amount, description } = req.body;
    let wallet = await Wallet.findOne({ partner: req.partner._id, branch });
    if (!wallet) {
      wallet = await Wallet.create({ partner: req.partner._id, branch, balance: 0 });
    }
    wallet.balance += amount;
    await wallet.save();
    const transaction = await WalletTransaction.create({
      wallet: wallet._id,
      partner: req.partner._id,
      branch,
      type: 'credit',
      amount,
      description: description || 'Wallet top-up',
      balanceAfter: wallet.balance,
    });
    res.status(201).json({ wallet, transaction });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

export default router;
