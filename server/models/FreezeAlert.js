import mongoose from 'mongoose';

const freezeAlertSchema = new mongoose.Schema({
  memberId: { type: String, required: true },
  memberName: { type: String, required: true },
  branch: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch', required: true },
  alertType: { type: String, enum: ['low-balance', 'freeze', 'expiry'], default: 'low-balance' },
  message: { type: String },
  isRead: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model('FreezeAlert', freezeAlertSchema);
