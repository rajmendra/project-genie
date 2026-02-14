import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  partner: { type: mongoose.Schema.Types.ObjectId, ref: 'Partner', required: true },
  branch: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch', required: true },
  to: { type: String, required: true },
  subject: { type: String, required: true },
  body: { type: String, required: true },
  type: { type: String, enum: ['sms', 'email', 'whatsapp'], default: 'sms' },
  status: { type: String, enum: ['sent', 'delivered', 'failed'], default: 'sent' },
}, { timestamps: true });

export default mongoose.model('Message', messageSchema);
