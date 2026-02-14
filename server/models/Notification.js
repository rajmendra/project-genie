import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  partner: { type: mongoose.Schema.Types.ObjectId, ref: 'Partner' },
  branch: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch' },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, enum: ['team', 'system'], default: 'system' },
  isRead: { type: Boolean, default: false },
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
}, { timestamps: true });

export default mongoose.model('Notification', notificationSchema);
