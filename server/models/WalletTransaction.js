import mongoose from 'mongoose';

const walletTransactionSchema = new mongoose.Schema({
  wallet: { type: mongoose.Schema.Types.ObjectId, ref: 'Wallet', required: true },
  partner: { type: mongoose.Schema.Types.ObjectId, ref: 'Partner', required: true },
  branch: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch', required: true },
  type: { type: String, enum: ['credit', 'debit'], required: true },
  amount: { type: Number, required: true },
  description: { type: String },
  referenceId: { type: String },
  balanceAfter: { type: Number },
}, { timestamps: true });

export default mongoose.model('WalletTransaction', walletTransactionSchema);
