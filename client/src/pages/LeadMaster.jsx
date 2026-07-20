import { useEffect, useMemo, useState } from 'react';
import { useBranch } from '../context/BranchContext';
import api from '../api/axios';
import {
  HiOutlinePhone,
  HiOutlineChatAlt2,
  HiOutlineClipboardCheck,
  HiOutlineUserAdd,
  HiOutlineDocumentText,
} from 'react-icons/hi';

const STAGES = [
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

const BUCKETS = [
  { key: 'today', label: "Today's Follow-up" },
  { key: 'upcoming', label: 'Upcoming' },
  { key: 'overdue', label: 'Overdue' },
  { key: 'enrolled', label: 'Enrolled' },
  { key: 'closed', label: 'Closed' },
];

const needsNextFollowUp = new Set([
  'Prospect - Follow-up Required',
  'Did Not Pick',
  'Switched Off / Out of Network',
  'Contacted',
  'Interested',
  'Admission Discussion',
]);

const INITIAL_INTEREST_OPTIONS = [
  { value: 'Potential', label: 'Potential – Lead has shown interest and may become a customer.' },
  { value: 'Interested', label: 'Interested – Positive interest shown and actively discussing requirements.' },
  { value: 'Hot', label: 'Hot – High probability of closing soon.' },
  { value: 'Not Interested', label: 'Not Interested – No current interest, just inquired.' },
];

const buildGreetingMessage = ({ clientName = '{ClientName}', gymName = '{GymName}' } = {}) => (
  `Hello ${clientName} !! Thank you for your interest in ${gymName}. Your inquiry has been received and our team will contact you shortly.\n\nPowered by The Genie Fit App\n— Genie connecting your destiny to the world’s finest fitness gyms, trainers, and wellness services.\nDownload Now on the Play Store & the App Store`
);

const today = () => new Date().toISOString().slice(0, 10);
const addDays = (days) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
};

function Badge({ children, tone = 'gray' }) {
  const tones = {
    gray: 'bg-gray-100 text-gray-600',
    red: 'bg-red-50 text-red-600',
    green: 'bg-green-50 text-green-600',
    orange: 'bg-orange-50 text-orange-600',
    blue: 'bg-blue-50 text-blue-600',
  };
  return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${tones[tone]}`}>{children}</span>;
}

export default function LeadMaster() {
  const { selectedBranch } = useBranch();
  const [activeTab, setActiveTab] = useState('add');
  const [bucket, setBucket] = useState('today');
  const [leads, setLeads] = useState([]);
  const [stats, setStats] = useState(null);
  const [selectedLead, setSelectedLead] = useState(null);
  const [admissionLead, setAdmissionLead] = useState(null);

  const fetchLeads = () => {
    if (!selectedBranch) return;
    api.get('/leads', { params: { branch: selectedBranch._id, bucket } })
      .then(({ data }) => setLeads(data))
      .catch(() => setLeads([]));
  };

  const fetchStats = () => {
    if (!selectedBranch) return;
    api.get('/leads/stats', { params: { branch: selectedBranch._id } })
      .then(({ data }) => setStats(data))
      .catch(() => setStats(null));
  };

  useEffect(() => {
    fetchLeads();
    fetchStats();
  }, [selectedBranch, bucket]);

  const tabs = [
    { key: 'add', label: 'Add Lead' },
    { key: 'manage', label: 'Manage Leads' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">My Lead Master</h1>
          <p className="text-sm text-gray-500 mt-1">{selectedBranch?.name || 'Select a branch'} lead CRM</p>
        </div>
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm">
            <Metric label="Leads" value={stats.totalLeads} />
            <Metric label="Today" value={stats.todayFollowUps} />
            <Metric label="Overdue" value={stats.overdueFollowUps} tone="red" />
            <Metric label="Enroll %" value={`${stats.conversionRate}%`} tone="green" />
          </div>
        )}
      </div>

      <div className="flex gap-1 bg-gray-100 rounded-lg p-1 max-w-sm">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition ${
              activeTab === tab.key ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'add' && (
        <AddLeadForm
          branchId={selectedBranch?._id}
          onSuccess={() => {
            setActiveTab('manage');
            fetchLeads();
            fetchStats();
          }}
        />
      )}

      {activeTab === 'manage' && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {BUCKETS.map((item) => (
              <button
                key={item.key}
                onClick={() => setBucket(item.key)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                  bucket === item.key ? 'bg-orange-500 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-orange-200'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
          <LeadTable leads={leads} bucket={bucket} onAction={setSelectedLead} onAdmission={setAdmissionLead} />
        </div>
      )}

      {selectedLead && (
        <FollowUpModal
          lead={selectedLead}
          onClose={() => setSelectedLead(null)}
          onSuccess={(lead) => {
            setSelectedLead(null);
            if (lead.stage === 'Successful Enrolled') setAdmissionLead(lead);
            fetchLeads();
            fetchStats();
          }}
        />
      )}

      {admissionLead && (
        <AdmissionModal
          lead={admissionLead}
          onClose={() => setAdmissionLead(null)}
          onSuccess={() => {
            setAdmissionLead(null);
            fetchLeads();
            fetchStats();
          }}
        />
      )}
    </div>
  );
}

function Metric({ label, value, tone = 'gray' }) {
  const color = tone === 'red' ? 'text-red-600' : tone === 'green' ? 'text-green-600' : 'text-gray-900';
  return (
    <div className="bg-white border border-gray-100 rounded-lg px-3 py-2 min-w-24">
      <p className="text-[11px] text-gray-500">{label}</p>
      <p className={`text-base font-bold ${color}`}>{value}</p>
    </div>
  );
}

function AddLeadForm({ branchId, onSuccess }) {
  const [sameWhatsapp, setSameWhatsapp] = useState(true);
  const [showGreetingPreview, setShowGreetingPreview] = useState(false);
  const [form, setForm] = useState({
    leadName: '',
    phoneNumber: '',
    whatsappNumber: '',
    email: '',
    followUpDate: today(),
    followUpTime: '10:00',
    source: '',
    remark: '',
    initialInterest: '',
    greetingMode: '',
  });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  const updateForm = (patch) => {
    setForm((prev) => {
      const next = { ...prev, ...patch };
      if (sameWhatsapp && patch.phoneNumber !== undefined) next.whatsappNumber = patch.phoneNumber;
      return next;
    });
  };

  const handleSameWhatsapp = (checked) => {
    setSameWhatsapp(checked);
    if (checked) setForm((prev) => ({ ...prev, whatsappNumber: prev.phoneNumber }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg({ type: '', text: '' });
    try {
      await api.post('/leads', { ...form, branch: branchId });
      setMsg({ type: 'success', text: 'Lead added successfully' });
      setForm({
        leadName: '',
        phoneNumber: '',
        whatsappNumber: '',
        email: '',
        followUpDate: today(),
        followUpTime: '10:00',
        source: '',
        remark: '',
        initialInterest: '',
        greetingMode: '',
      });
      onSuccess();
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Failed to add lead' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 max-w-4xl">
      {msg.text && (
        <div className={`text-sm px-4 py-3 rounded-lg mb-4 ${msg.type === 'success' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
          {msg.text}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Lead Name">
            <input value={form.leadName} onChange={(e) => updateForm({ leadName: e.target.value })} required className={inputClass} />
          </Field>
          <Field label="Email ID (optional field)">
            <input type="email" value={form.email} onChange={(e) => updateForm({ email: e.target.value })} className={inputClass} />
          </Field>
          <Field label="Phone Number">
            <input value={form.phoneNumber} onChange={(e) => updateForm({ phoneNumber: e.target.value })} required className={inputClass} />
          </Field>
          <Field label="WhatsApp Number">
            <input value={form.whatsappNumber} onChange={(e) => updateForm({ whatsappNumber: e.target.value })} required disabled={sameWhatsapp} className={`${inputClass} disabled:bg-gray-50`} />
            <label className="flex items-center gap-2 mt-2 text-xs text-gray-500">
              <input type="checkbox" checked={sameWhatsapp} onChange={(e) => handleSameWhatsapp(e.target.checked)} className="rounded border-gray-300 text-orange-500 focus:ring-orange-500" />
              Same as Phone Number
            </label>
          </Field>
          <Field label="Follow-up Date">
            <input type="date" value={form.followUpDate} onChange={(e) => updateForm({ followUpDate: e.target.value })} required className={inputClass} />
          </Field>
          <Field label="Follow-up Time">
            <input type="time" value={form.followUpTime} onChange={(e) => updateForm({ followUpTime: e.target.value })} required className={inputClass} />
          </Field>
          <Field label="Lead Source">
            <input value={form.source} onChange={(e) => updateForm({ source: e.target.value })} placeholder="Walk-in, Instagram, Referral" className={inputClass} />
          </Field>
          <Field label="Greeting Message">
            <select value={form.greetingMode} onChange={(e) => updateForm({ greetingMode: e.target.value })} className={inputClass}>
              <option value="">Do not send</option>
              <option value="sms">Send via SMS</option>
              <option value="whatsapp">Send via WhatsApp</option>
              <option value="both">Send via Both</option>
            </select>
            <p className="mt-2 text-xs text-gray-500">
              <button type="button" onClick={() => setShowGreetingPreview(true)} className="underline text-orange-600 hover:text-orange-700">
                Click Here
              </button>{' '}
              to preview greeting message
            </p>
          </Field>
        </div>
        <Field label="Remark (if any)">
          <textarea value={form.remark} onChange={(e) => updateForm({ remark: e.target.value })} rows={3} className={`${inputClass} resize-none`} />
        </Field>
        <Field label="Initial Interest">
          <select value={form.initialInterest} onChange={(e) => updateForm({ initialInterest: e.target.value })} className={inputClass}>
            <option value="">Select initial interest</option>
            {INITIAL_INTEREST_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </Field>
        <button type="submit" disabled={loading || !branchId} className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-medium px-5 py-2.5 rounded-lg transition disabled:opacity-50">
          <HiOutlineUserAdd className="w-5 h-5" />
          {loading ? 'Saving...' : form.greetingMode ? 'Add Lead With Greeting' : 'Add Lead'}
        </button>
      </form>
      {showGreetingPreview && (
        <Modal title="Greeting Message Preview" onClose={() => setShowGreetingPreview(false)}>
          <p className="whitespace-pre-line text-sm leading-6 text-gray-700">
            {buildGreetingMessage({
              clientName: form.leadName || '{ClientName}',
              gymName: '{GymName}',
            })}
          </p>
        </Modal>
      )}
    </div>
  );
}

function LeadTable({ leads, bucket, onAction, onAdmission }) {
  if (leads.length === 0) {
    return <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-8 text-center text-sm text-gray-400">No leads found</div>;
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-left text-gray-500">
              <th className="px-4 py-3 font-medium">Lead</th>
              <th className="px-4 py-3 font-medium">Phone</th>
              <th className="px-4 py-3 font-medium">Follow-up</th>
              <th className="px-4 py-3 font-medium">Stage</th>
              <th className="px-4 py-3 font-medium">Last Remark</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {leads.map((lead) => (
              <tr key={lead._id} className={bucket === 'overdue' ? 'bg-red-50/40' : ''}>
                <td className="px-4 py-3">
                  <p className="font-medium text-gray-900">{lead.leadName}</p>
                  <p className="text-xs text-gray-400">{lead.source || 'No lead source'}</p>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-col gap-1">
                    <a href={`tel:${lead.phoneNumber}`} className="inline-flex items-center gap-1 text-gray-700 hover:text-orange-600">
                      <HiOutlinePhone className="w-4 h-4" /> {lead.phoneNumber}
                    </a>
                    <a href={`https://wa.me/${lead.whatsappNumber}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-gray-500 hover:text-green-600">
                      <HiOutlineChatAlt2 className="w-4 h-4" /> {lead.whatsappNumber}
                    </a>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <p>{new Date(lead.followUpDate).toLocaleDateString()}</p>
                  <p className="text-xs text-gray-400">{lead.followUpTime}</p>
                </td>
                <td className="px-4 py-3"><Badge tone={lead.status === 'enrolled' ? 'green' : lead.status === 'closed' ? 'red' : 'orange'}>{lead.stage}</Badge></td>
                <td className="px-4 py-3 text-gray-500 max-w-48 truncate">{lead.lastRemark || lead.remark || '--'}</td>
                <td className="px-4 py-3"><Badge tone={bucket === 'overdue' ? 'red' : lead.status === 'enrolled' ? 'green' : 'blue'}>{bucket === 'overdue' ? overdueText(lead) : lead.status}</Badge></td>
                <td className="px-4 py-3">
                  {lead.status === 'enrolled' ? (
                    <button onClick={() => onAdmission(lead)} className="text-green-600 hover:text-green-700 font-medium text-xs">Admission</button>
                  ) : lead.status === 'closed' ? (
                    <span className="text-xs text-gray-400">Closed</span>
                  ) : (
                    <button onClick={() => onAction(lead)} className="text-orange-500 hover:text-orange-600 font-medium text-xs">Action</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function FollowUpModal({ lead, onClose, onSuccess }) {
  const [form, setForm] = useState({
    stage: lead.stage,
    remark: '',
    nextFollowUpDate: addDays(1),
    nextFollowUpTime: lead.followUpTime || '10:00',
  });
  const [loading, setLoading] = useState(false);
  const requiresNext = useMemo(() => needsNextFollowUp.has(form.stage), [form.stage]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...form };
      if (!requiresNext) {
        payload.nextFollowUpDate = '';
        payload.nextFollowUpTime = '';
      }
      const { data } = await api.patch(`/leads/${lead._id}/follow-up`, payload);
      onSuccess(data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal title={`Follow-up: ${lead.leadName}`} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Stage">
          <select value={form.stage} onChange={(e) => setForm({ ...form, stage: e.target.value })} className={inputClass}>
            {STAGES.map((stage) => <option key={stage} value={stage}>{stage}</option>)}
          </select>
        </Field>
        <Field label="Remark">
          <textarea value={form.remark} onChange={(e) => setForm({ ...form, remark: e.target.value })} required rows={3} className={`${inputClass} resize-none`} />
        </Field>
        {requiresNext && (
          <div className="grid grid-cols-2 gap-4">
            <Field label="Next Follow-up Date">
              <input type="date" value={form.nextFollowUpDate} onChange={(e) => setForm({ ...form, nextFollowUpDate: e.target.value })} required className={inputClass} />
            </Field>
            <Field label="Next Follow-up Time">
              <input type="time" value={form.nextFollowUpTime} onChange={(e) => setForm({ ...form, nextFollowUpTime: e.target.value })} required className={inputClass} />
            </Field>
          </div>
        )}
        <button disabled={loading} className="w-full inline-flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-medium py-2.5 rounded-lg transition disabled:opacity-50">
          <HiOutlineClipboardCheck className="w-5 h-5" />
          {form.stage === 'Successful Enrolled' ? 'Next' : 'Submit'}
        </button>
      </form>
    </Modal>
  );
}

function AdmissionModal({ lead, onClose, onSuccess }) {
  const [invoice, setInvoice] = useState(null);
  const [form, setForm] = useState({
    memberName: lead.leadName,
    phoneNumber: lead.phoneNumber,
    membershipType: 'General',
    packageName: '',
    membershipDuration: '1 Month',
    startDate: today(),
    endDate: addDays(30),
    totalAmount: '',
    discount: 0,
    paidAmount: '',
    paymentMode: 'Cash',
    paymentRemark: '',
  });
  const [loading, setLoading] = useState(false);
  const balance = Math.max(Number(form.totalAmount || 0) - Number(form.discount || 0) - Number(form.paidAmount || 0), 0);

  const submitAdmission = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post(`/leads/${lead._id}/admission`, {
        ...form,
        totalAmount: Number(form.totalAmount),
        discount: Number(form.discount || 0),
        paidAmount: Number(form.paidAmount),
      });
      setInvoice(data.invoice);
      onSuccess();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal title={`Admission: ${lead.leadName}`} onClose={onClose} wide>
      {invoice ? (
        <div className="space-y-4">
          <div className="bg-green-50 text-green-700 rounded-lg p-4 text-sm">
            Invoice generated successfully: <span className="font-semibold">{invoice.invoiceNo}</span>
          </div>
          <div className="border border-gray-100 rounded-lg p-4 text-sm space-y-2">
            <p><span className="text-gray-500">Member:</span> {invoice.memberName}</p>
            <p><span className="text-gray-500">Paid:</span> ₹{invoice.amountPaid.toLocaleString()}</p>
            <p><span className="text-gray-500">Balance:</span> ₹{invoice.balanceAmount.toLocaleString()}</p>
            <p><span className="text-gray-500">Payment:</span> {invoice.paymentMode}</p>
          </div>
          <button onClick={onClose} className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-2.5 rounded-lg transition">Close</button>
        </div>
      ) : (
        <form onSubmit={submitAdmission} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Member Name"><input value={form.memberName} onChange={(e) => setForm({ ...form, memberName: e.target.value })} required className={inputClass} /></Field>
            <Field label="Phone Number"><input value={form.phoneNumber} onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })} required className={inputClass} /></Field>
            <Field label="Membership Type"><input value={form.membershipType} onChange={(e) => setForm({ ...form, membershipType: e.target.value })} required className={inputClass} /></Field>
            <Field label="Package Name"><input value={form.packageName} onChange={(e) => setForm({ ...form, packageName: e.target.value })} required className={inputClass} /></Field>
            <Field label="Membership Duration"><input value={form.membershipDuration} onChange={(e) => setForm({ ...form, membershipDuration: e.target.value })} required className={inputClass} /></Field>
            <Field label="Payment Mode">
              <select value={form.paymentMode} onChange={(e) => setForm({ ...form, paymentMode: e.target.value })} className={inputClass}>
                {['Cash', 'UPI', 'Card', 'Bank Transfer'].map((mode) => <option key={mode}>{mode}</option>)}
              </select>
            </Field>
            <Field label="Start Date"><input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} required className={inputClass} /></Field>
            <Field label="End Date"><input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} required className={inputClass} /></Field>
            <Field label="Total Amount"><input type="number" min="0" value={form.totalAmount} onChange={(e) => setForm({ ...form, totalAmount: e.target.value })} required className={inputClass} /></Field>
            <Field label="Discount"><input type="number" min="0" value={form.discount} onChange={(e) => setForm({ ...form, discount: e.target.value })} className={inputClass} /></Field>
            <Field label="Paid Amount"><input type="number" min="0" value={form.paidAmount} onChange={(e) => setForm({ ...form, paidAmount: e.target.value })} required className={inputClass} /></Field>
            <Field label="Balance Amount"><input value={`₹${balance.toLocaleString()}`} disabled className={`${inputClass} bg-gray-50`} /></Field>
          </div>
          <Field label="Payment Remark"><textarea value={form.paymentRemark} onChange={(e) => setForm({ ...form, paymentRemark: e.target.value })} rows={2} className={`${inputClass} resize-none`} /></Field>
          <button disabled={loading} className="w-full inline-flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-medium py-2.5 rounded-lg transition disabled:opacity-50">
            <HiOutlineDocumentText className="w-5 h-5" />
            {loading ? 'Generating...' : 'Submit Admission & Generate Invoice'}
          </button>
        </form>
      )}
    </Modal>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-gray-700 mb-1">{label}</span>
      {children}
    </label>
  );
}

function Modal({ title, children, onClose, wide = false }) {
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className={`bg-white rounded-xl shadow-xl w-full ${wide ? 'max-w-3xl' : 'max-w-lg'} max-h-[90vh] overflow-y-auto`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">x</button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

const inputClass = 'w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none';

function overdueText(lead) {
  const followUp = new Date(`${new Date(lead.followUpDate).toISOString().slice(0, 10)}T${lead.followUpTime || '00:00'}`);
  const minutes = Math.max(Math.floor((Date.now() - followUp.getTime()) / 60000), 0);
  if (minutes < 60) return `Overdue ${minutes}m`;
  const hours = Math.floor(minutes / 60);
  return `Overdue ${hours}h`;
}
