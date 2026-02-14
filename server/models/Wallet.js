import mongoose from 'mongoose';

const walletSchema = new mongoose.Schema({
  partner: { type: mongoose.Schema.Types.ObjectId, ref: 'Partner', required: true },
  branch: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch', required: true },
  balance: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.model('Wallet', walletSchema);
