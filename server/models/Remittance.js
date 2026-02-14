import mongoose from 'mongoose';

const remittanceSchema = new mongoose.Schema({
  partner: { type: mongoose.Schema.Types.ObjectId, ref: 'Partner', required: true },
  branch: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch', required: true },
  invoiceNo: { type: String, required: true },
  memberName: { type: String },
  amount: { type: Number, required: true },
  paymentMode: { type: String, enum: ['Cash', 'UPI', 'Card', 'Bank Transfer'], default: 'Cash' },
  date: { type: Date, default: Date.now },
  status: { type: String, enum: ['payable', 'processing', 'cleared', 'uncleared'], default: 'payable' },
  remarks: { type: String },
}, { timestamps: true });

export default mongoose.model('Remittance', remittanceSchema);
