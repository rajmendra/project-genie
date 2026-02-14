import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const partnerSchema = new mongoose.Schema({
  vendorCode: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  branches: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Branch' }],
}, { timestamps: true });

partnerSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

partnerSchema.methods.matchPassword = async function (entered) {
  return bcrypt.compare(entered, this.password);
};

export default mongoose.model('Partner', partnerSchema);
