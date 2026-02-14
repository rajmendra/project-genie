import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema({
  memberId: { type: String, required: true },
  memberName: { type: String, required: true },
  branch: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch', required: true },
  sessionType: { type: String, enum: ['PT', 'Group', 'Open'], default: 'PT' },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  trainer: { type: String },
  status: { type: String, enum: ['active', 'completed', 'overtime', 'near-end'], default: 'active' },
  overtimeMinutes: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.model('Session', sessionSchema);
