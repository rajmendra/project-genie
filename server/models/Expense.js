import mongoose from 'mongoose';

const expenseSchema = new mongoose.Schema({
  partner: { type: mongoose.Schema.Types.ObjectId, ref: 'Partner', required: true },
  branch: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch', required: true },
  category: { type: String, required: true },
  subCategory: { type: String },
  amount: { type: Number, required: true },
  description: { type: String },
  date: { type: Date, default: Date.now },
  paymentMode: { type: String, enum: ['Cash', 'UPI', 'Card', 'Bank Transfer'], default: 'Cash' },
  status: { type: String, enum: ['pending', 'approved', 'rejected', 'deleted'], default: 'pending' },
  editHistory: [{
    editedAt: { type: Date, default: Date.now },
    previousAmount: Number,
    newAmount: Number,
    previousCategory: String,
    newCategory: String,
    editedBy: String,
  }],
}, { timestamps: true });

export default mongoose.model('Expense', expenseSchema);
