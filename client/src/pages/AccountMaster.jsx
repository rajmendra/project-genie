import { useEffect, useState } from 'react';
import { useBranch } from '../context/BranchContext';
import api from '../api/axios';

export default function AccountMaster() {
  const { selectedBranch } = useBranch();
  const [form, setForm] = useState({ branchName: '', address: '', city: '', phone: '', gst: '', bankName: '', accountNo: '', subscriptionPlan: 'Basic' });
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (selectedBranch) setForm({ branchName: selectedBranch.name || '', address: selectedBranch.address || '', city: selectedBranch.city || '', phone: selectedBranch.phone || '', gst: '', bankName: '', accountNo: '', subscriptionPlan: 'Basic' });
  }, [selectedBranch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.patch(`/branches/${selectedBranch._id}`, form);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      alert('Error saving');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div><h1 className="text-2xl font-bold text-gray-900">Account Settings</h1></div>
      {saved && <div className="bg-green-50 text-green-700 px-4 py-3 rounded-lg">Saved</div>}

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-6">
        <div>
          <h2 className="font-semibold mb-4">Branch Information</h2>
          <div className="space-y-4">
            <input type="text" placeholder="Branch Name" value={form.branchName} onChange={(e) => setForm({...form, branchName: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
            <input type="text" placeholder="Address" value={form.address} onChange={(e) => setForm({...form, address: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
            <input type="text" placeholder="City" value={form.city} onChange={(e) => setForm({...form, city: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
            <input type="tel" placeholder="Phone" value={form.phone} onChange={(e) => setForm({...form, phone: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
          </div>
        </div>
        <hr />
        <div>
          <h2 className="font-semibold mb-4">Billing</h2>
          <div className="space-y-4">
            <input type="text" placeholder="GST Number" value={form.gst} onChange={(e) => setForm({...form, gst: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
            <input type="text" placeholder="Bank Name" value={form.bankName} onChange={(e) => setForm({...form, bankName: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
            <select value={form.subscriptionPlan} onChange={(e) => setForm({...form, subscriptionPlan: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
              <option>Basic</option><option>Premium</option><option>Enterprise</option>
            </select>
          </div>
        </div>
        <button type="submit" disabled={loading} className="w-full bg-orange-500 text-white font-medium py-2.5 rounded-lg disabled:opacity-50">
          {loading ? 'Saving...' : 'Save'}
        </button>
      </form>
    </div>
  );
}
