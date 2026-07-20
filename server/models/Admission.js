import mongoose from 'mongoose';

const admissionSchema = new mongoose.Schema({
  partner: { type: mongoose.Schema.Types.ObjectId, ref: 'Partner', required: true },
  branch: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch', required: true },
  lead: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead', required: true },
  memberName: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  membershipType: { type: String, required: true },
  packageName: { type: String, required: true },
  membershipDuration: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  totalAmount: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  paidAmount: { type: Number, required: true },
  balanceAmount: { type: Number, default: 0 },
  paymentMode: { type: String, enum: ['Cash', 'UPI', 'Card', 'Bank Transfer'], default: 'Cash' },
  paymentRemark: { type: String },
}, { timestamps: true });

export default mongoose.model('Admission', admissionSchema);
