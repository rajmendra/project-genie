import mongoose from 'mongoose';

export const LEAD_STAGES = [
  'New Lead',
  'Contacted',
  'Interested',
  'Prospect - Follow-up Required',
  'Did Not Pick',
  'Switched Off / Out of Network',
  'Not Interested',
  'Disqualified',
  'Admission Discussion',
  'Successful Enrolled',
];

export const INITIAL_INTEREST_LEVELS = [
  'Potential',
  'Interested',
  'Hot',
  'Not Interested',
];

const followUpSchema = new mongoose.Schema({
  stage: { type: String, enum: LEAD_STAGES, required: true },
  remark: { type: String, required: true },
  nextFollowUpDate: { type: Date },
  nextFollowUpTime: { type: String },
  createdBy: { type: String },
}, { timestamps: true });

const greetingSchema = new mongoose.Schema({
  channel: { type: String, enum: ['sms', 'whatsapp'], required: true },
  amount: { type: Number, required: true },
  status: { type: String, enum: ['sent', 'failed'], default: 'sent' },
  message: { type: String, required: true },
}, { timestamps: true });

const leadSchema = new mongoose.Schema({
  partner: { type: mongoose.Schema.Types.ObjectId, ref: 'Partner', required: true },
  branch: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch', required: true },
  leadName: { type: String, required: true, trim: true },
  phoneNumber: { type: String, required: true, trim: true },
  whatsappNumber: { type: String, required: true, trim: true },
  email: { type: String, trim: true },
  source: { type: String, trim: true },
  remark: { type: String, trim: true },
  initialInterest: { type: String, enum: INITIAL_INTEREST_LEVELS },
  followUpDate: { type: Date, required: true },
  followUpTime: { type: String, required: true },
  stage: { type: String, enum: LEAD_STAGES, default: 'New Lead' },
  status: { type: String, enum: ['active', 'closed', 'enrolled'], default: 'active' },
  lastRemark: { type: String },
  greetings: [greetingSchema],
  followUps: [followUpSchema],
}, { timestamps: true });

leadSchema.index({ partner: 1, branch: 1, phoneNumber: 1 });
leadSchema.index({ partner: 1, branch: 1, followUpDate: 1, followUpTime: 1 });

export default mongoose.model('Lead', leadSchema);
