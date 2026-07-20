import { Router } from 'express';
import Lead from '../models/Lead.js';
import Admission from '../models/Admission.js';
import Invoice from '../models/Invoice.js';
import Message from '../models/Message.js';
import Wallet from '../models/Wallet.js';
import WalletTransaction from '../models/WalletTransaction.js';
import protect from '../middleware/auth.js';

const router = Router();

const SMS_CHARGE = Number(process.env.SMS_CHARGE || 1);
const WHATSAPP_CHARGE = Number(process.env.WHATSAPP_CHARGE || 2);
const CLOSED_STAGES = ['Not Interested', 'Disqualified'];

const startOfDay = (date = new Date()) => new Date(date.getFullYear(), date.getMonth(), date.getDate());
const endOfDay = (date = new Date()) => new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);

const greetingTemplate = ({ leadName, gymName }) => (
  `Hello ${leadName} !! Thank you for your interest in ${gymName}. Your inquiry has been received and our team will contact you shortly.\n\nPowered by The Genie Fit App\n— Genie connecting your destiny to the world’s finest fitness gyms, trainers, and wellness services.\nDownload Now on the Play Store & the App Store`
);

const getFollowUpFilter = (bucket) => {
  const now = new Date();
  const todayStart = startOfDay(now);
  const tomorrowStart = endOfDay(now);

  if (bucket === 'today') return { status: 'active', followUpDate: { $gte: todayStart, $lt: tomorrowStart } };
  if (bucket === 'upcoming') return { status: 'active', followUpDate: { $gte: tomorrowStart } };
  if (bucket === 'overdue') {
    return {
      status: 'active',
      $or: [
        { followUpDate: { $lt: todayStart } },
        { followUpDate: { $gte: todayStart, $lt: tomorrowStart }, followUpTime: { $lt: now.toTimeString().slice(0, 5) } },
      ],
    };
  }
  if (bucket === 'closed') return { status: 'closed' };
  if (bucket === 'enrolled') return { status: 'enrolled' };
  return {};
};

const buildInvoiceNo = () => {
  const date = new Date();
  const stamp = date.toISOString().slice(0, 10).replaceAll('-', '');
  return `INV-${stamp}-${Date.now().toString().slice(-6)}`;
};

async function debitGreetingWallet({ partner, branch, channels, leadName, gymName, phoneNumber, whatsappNumber }) {
  const charges = channels.map((channel) => ({
    channel,
    amount: channel === 'sms' ? SMS_CHARGE : WHATSAPP_CHARGE,
  }));
  const totalCharge = charges.reduce((sum, item) => sum + item.amount, 0);
  let wallet = await Wallet.findOne({ partner, branch });

  if (!wallet || wallet.balance < totalCharge) {
    const balance = wallet?.balance || 0;
    const err = new Error(`Insufficient wallet balance. Required ₹${totalCharge}, available ₹${balance}.`);
    err.statusCode = 400;
    throw err;
  }

  const message = greetingTemplate({ leadName, gymName });
  const greetings = [];
  for (const charge of charges) {
    wallet.balance -= charge.amount;
    await wallet.save();
    await WalletTransaction.create({
      wallet: wallet._id,
      partner,
      branch,
      type: 'debit',
      amount: charge.amount,
      description: `${charge.channel.toUpperCase()} greeting sent to ${leadName}`,
      referenceId: `lead-greeting-${Date.now()}`,
      balanceAfter: wallet.balance,
    });
    await Message.create({
      partner,
      branch,
      to: charge.channel === 'sms' ? phoneNumber : whatsappNumber,
      subject: 'Lead greeting',
      body: message,
      type: charge.channel,
      status: 'sent',
    });
    greetings.push({ ...charge, status: 'sent', message });
  }
  return greetings;
}

router.get('/', protect, async (req, res) => {
  try {
    const { branch, bucket, stage, search } = req.query;
    const filter = { partner: req.partner._id, ...getFollowUpFilter(bucket) };
    if (branch) filter.branch = branch;
    if (stage) filter.stage = stage;
    if (search) {
      filter.$or = [
        { leadName: new RegExp(search, 'i') },
        { phoneNumber: new RegExp(search, 'i') },
        { whatsappNumber: new RegExp(search, 'i') },
      ];
    }
    const leads = await Lead.find(filter).populate('branch').sort({ followUpDate: 1, followUpTime: 1, createdAt: -1 });
    res.json(leads);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/stats', protect, async (req, res) => {
  try {
    const { branch } = req.query;
    const base = { partner: req.partner._id };
    if (branch) base.branch = branch;
    const today = { ...base, ...getFollowUpFilter('today') };
    const upcoming = { ...base, ...getFollowUpFilter('upcoming') };
    const overdue = { ...base, ...getFollowUpFilter('overdue') };
    const [totalLeads, todayFollowUps, upcomingFollowUps, overdueFollowUps, enrollments, disqualified, admissions] = await Promise.all([
      Lead.countDocuments(base),
      Lead.countDocuments(today),
      Lead.countDocuments(upcoming),
      Lead.countDocuments(overdue),
      Lead.countDocuments({ ...base, status: 'enrolled' }),
      Lead.countDocuments({ ...base, stage: 'Disqualified' }),
      Admission.find(base),
    ]);
    const todayStart = startOfDay();
    const monthlyStart = new Date(todayStart.getFullYear(), todayStart.getMonth(), 1);
    const todayCollection = admissions
      .filter((item) => item.createdAt >= todayStart)
      .reduce((sum, item) => sum + item.paidAmount, 0);
    const monthlyCollection = admissions
      .filter((item) => item.createdAt >= monthlyStart)
      .reduce((sum, item) => sum + item.paidAmount, 0);
    res.json({
      totalLeads,
      todayFollowUps,
      upcomingFollowUps,
      overdueFollowUps,
      enrollments,
      disqualified,
      todayCollection,
      monthlyCollection,
      conversionRate: totalLeads ? Math.round((enrollments / totalLeads) * 100) : 0,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id', protect, async (req, res) => {
  try {
    const lead = await Lead.findOne({ _id: req.params.id, partner: req.partner._id }).populate('branch');
    if (!lead) return res.status(404).json({ message: 'Lead not found' });
    const admission = await Admission.findOne({ lead: lead._id, partner: req.partner._id });
    const invoice = admission ? await Invoice.findOne({ admission: admission._id, partner: req.partner._id }) : null;
    res.json({ lead, admission, invoice });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', protect, async (req, res) => {
  try {
    const { greetingMode, ...payload } = req.body;
    if (!payload.initialInterest) delete payload.initialInterest;
    const duplicate = await Lead.findOne({
      partner: req.partner._id,
      branch: payload.branch,
      phoneNumber: payload.phoneNumber,
      status: { $ne: 'closed' },
    });
    if (duplicate) return res.status(409).json({ message: 'An active lead already exists with this phone number.' });

    const channels = greetingMode === 'both' ? ['sms', 'whatsapp'] : greetingMode ? [greetingMode] : [];
    const greetings = channels.length
      ? await debitGreetingWallet({
          partner: req.partner._id,
          branch: payload.branch,
          channels,
          leadName: payload.leadName,
          gymName: req.partner.name,
          phoneNumber: payload.phoneNumber,
          whatsappNumber: payload.whatsappNumber,
        })
      : [];

    const lead = await Lead.create({
      ...payload,
      partner: req.partner._id,
      stage: 'New Lead',
      status: 'active',
      lastRemark: payload.remark,
      greetings,
    });
    res.status(201).json(lead);
  } catch (error) {
    res.status(error.statusCode || 400).json({ message: error.message });
  }
});

router.patch('/:id/follow-up', protect, async (req, res) => {
  try {
    const { stage, remark, nextFollowUpDate, nextFollowUpTime } = req.body;
    const lead = await Lead.findOne({ _id: req.params.id, partner: req.partner._id });
    if (!lead) return res.status(404).json({ message: 'Lead not found' });

    lead.stage = stage;
    lead.lastRemark = remark;
    lead.followUps.push({ stage, remark, nextFollowUpDate, nextFollowUpTime, createdBy: req.partner.name });

    if (stage === 'Successful Enrolled') {
      lead.status = 'enrolled';
    } else if (CLOSED_STAGES.includes(stage)) {
      lead.status = 'closed';
    } else if (nextFollowUpDate && nextFollowUpTime) {
      lead.status = 'active';
      lead.followUpDate = nextFollowUpDate;
      lead.followUpTime = nextFollowUpTime;
    }

    await lead.save();
    res.json(lead);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.post('/:id/admission', protect, async (req, res) => {
  try {
    const lead = await Lead.findOne({ _id: req.params.id, partner: req.partner._id });
    if (!lead) return res.status(404).json({ message: 'Lead not found' });

    const totalAmount = Number(req.body.totalAmount);
    const discount = Number(req.body.discount || 0);
    const paidAmount = Number(req.body.paidAmount);
    const balanceAmount = Math.max(totalAmount - discount - paidAmount, 0);

    const admission = await Admission.create({
      ...req.body,
      partner: req.partner._id,
      branch: lead.branch,
      lead: lead._id,
      phoneNumber: req.body.phoneNumber || lead.phoneNumber,
      balanceAmount,
    });

    const invoice = await Invoice.create({
      partner: req.partner._id,
      branch: lead.branch,
      lead: lead._id,
      admission: admission._id,
      invoiceNo: buildInvoiceNo(),
      gymName: req.partner.name,
      memberName: admission.memberName,
      phoneNumber: admission.phoneNumber,
      membershipType: admission.membershipType,
      amountPaid: admission.paidAmount,
      balanceAmount: admission.balanceAmount,
      paymentMode: admission.paymentMode,
    });

    lead.stage = 'Successful Enrolled';
    lead.status = 'enrolled';
    lead.lastRemark = 'Admission Taken / Membership Taken';
    await lead.save();

    res.status(201).json({ admission, invoice, lead });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

export default router;
