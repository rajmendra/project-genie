import { useState, useEffect } from 'react';
import { useBranch } from '../context/BranchContext';
import api from '../api/axios';

export default function ContactGenie() {
  const [activeTab, setActiveTab] = useState('send');
  const { selectedBranch } = useBranch();
  const [messages, setMessages] = useState([]);

  const fetchMessages = () => {
    if (selectedBranch) {
      api.get('/messages', { params: { branch: selectedBranch._id } })
        .then(({ data }) => setMessages(data))
        .catch(() => {});
    }
  };

  useEffect(() => { fetchMessages(); }, [selectedBranch]);

  const tabs = [
    { key: 'send', label: 'Send Message' },
    { key: 'history', label: 'Message History' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-gray-900">Contact Genie</h1>

      <div className="flex gap-1 bg-gray-100 rounded-lg p-1 max-w-xs">
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

      {activeTab === 'send' && <SendMessage branchId={selectedBranch?._id} onSent={fetchMessages} />}
      {activeTab === 'history' && <MessageHistory messages={messages} />}
    </div>
  );
}

function SendMessage({ branchId, onSent }) {
  const [form, setForm] = useState({ to: '', subject: '', body: '', type: 'sms' });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg({ type: '', text: '' });
    try {
      await api.post('/messages', { ...form, branch: branchId });
      setMsg({ type: 'success', text: 'Message sent successfully' });
      setForm({ to: '', subject: '', body: '', type: 'sms' });
      onSent();
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Failed to send' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 max-w-lg">
      {msg.text && (
        <div className={`text-sm px-4 py-3 rounded-lg mb-4 ${msg.type === 'success' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>{msg.text}</div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
            <input type="text" value={form.to} onChange={(e) => setForm({ ...form, to: e.target.value })} placeholder="Phone or email" required className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none">
              <option value="sms">SMS</option>
              <option value="email">Email</option>
              <option value="whatsapp">WhatsApp</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
          <input type="text" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} required className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
          <textarea value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} required rows={4} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none resize-none" />
        </div>
        <button type="submit" disabled={loading} className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-2.5 rounded-lg transition disabled:opacity-50">
          {loading ? 'Sending...' : 'Send Message'}
        </button>
      </form>
    </div>
  );
}

function MessageHistory({ messages }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      {messages.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-8">No messages sent yet</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left text-gray-500">
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">To</th>
                <th className="px-4 py-3 font-medium">Subject</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {messages.map((m) => (
                <tr key={m._id}>
                  <td className="px-4 py-3">{new Date(m.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3">{m.to}</td>
                  <td className="px-4 py-3">{m.subject}</td>
                  <td className="px-4 py-3 capitalize">{m.type}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      m.status === 'delivered' ? 'bg-green-50 text-green-600' :
                      m.status === 'failed' ? 'bg-red-50 text-red-600' :
                      'bg-blue-50 text-blue-600'
                    }`}>{m.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
