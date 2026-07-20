import mongoose from 'mongoose';

const invoiceSchema = new mongoose.Schema({
  partner: { type: mongoose.Schema.Types.ObjectId, ref: 'Partner', required: true },
  branch: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch', required: true },
  lead: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead', required: true },
  admission: { type: mongoose.Schema.Types.ObjectId, ref: 'Admission', required: true },
  invoiceNo: { type: String, required: true, unique: true },
  gymName: { type: String, required: true },
  memberName: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  membershipType: { type: String, required: true },
  amountPaid: { type: Number, required: true },
  balanceAmount: { type: Number, default: 0 },
  paymentMode: { type: String, required: true },
  invoiceDate: { type: Date, default: Date.now },
}, { timestamps: true });

export default mongoose.model('Invoice', invoiceSchema);
