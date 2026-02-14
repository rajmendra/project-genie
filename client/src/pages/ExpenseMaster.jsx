import { useState, useEffect } from 'react';
import { useBranch } from '../context/BranchContext';
import api from '../api/axios';

const CATEGORIES = ['Rent', 'Salary', 'Utilities', 'Equipment', 'Marketing', 'Maintenance', 'Other'];
const PAYMENT_MODES = ['Cash', 'UPI', 'Card', 'Bank Transfer'];

export default function ExpenseMaster() {
  const [activeTab, setActiveTab] = useState('add');
  const { selectedBranch } = useBranch();
  const [expenses, setExpenses] = useState([]);
  const [editingExpense, setEditingExpense] = useState(null);
  const [editSummary, setEditSummary] = useState(null);

  const fetchExpenses = () => {
    if (!selectedBranch) return;
    api.get('/expenses', { params: { branch: selectedBranch._id } })
      .then(({ data }) => setExpenses(data))
      .catch(() => {});
  };

  useEffect(() => { fetchExpenses(); }, [selectedBranch]);

  const tabs = [
    { key: 'add', label: 'Add Expense' },
    { key: 'review', label: 'Review & History' },
    { key: 'delete', label: 'Delete Record' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-gray-900">My Expense Master</h1>

      <div className="flex gap-1 bg-gray-100 rounded-lg p-1 max-w-md">
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

      {activeTab === 'add' && <AddExpenseForm branchId={selectedBranch?._id} onSuccess={fetchExpenses} />}
      {activeTab === 'review' && (
        <ReviewHistory
          expenses={expenses}
          onEdit={(e) => setEditingExpense(e)}
        />
      )}
      {activeTab === 'delete' && <DeleteRecord expenses={expenses} onDelete={fetchExpenses} />}

      {editingExpense && (
        <EditExpenseModal
          expense={editingExpense}
          onClose={() => setEditingExpense(null)}
          onSave={(updated) => {
            setEditingExpense(null);
            setEditSummary(updated);
            fetchExpenses();
          }}
        />
      )}

      {editSummary && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Expense Updated</h3>
            <div className="space-y-2 text-sm">
              <p><span className="text-gray-500">Category:</span> {editSummary.category}</p>
              <p><span className="text-gray-500">Amount:</span> ₹{editSummary.amount.toLocaleString()}</p>
              <p><span className="text-gray-500">Description:</span> {editSummary.description}</p>
            </div>
            <button
              onClick={() => setEditSummary(null)}
              className="w-full mt-4 bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-lg font-medium transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function AddExpenseForm({ branchId, onSuccess }) {
  const [form, setForm] = useState({ category: '', subCategory: '', amount: '', description: '', paymentMode: 'Cash', date: new Date().toISOString().split('T')[0] });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg({ type: '', text: '' });
    try {
      await api.post('/expenses', { ...form, amount: Number(form.amount), branch: branchId });
      setMsg({ type: 'success', text: 'Expense added successfully' });
      setForm({ category: '', subCategory: '', amount: '', description: '', paymentMode: 'Cash', date: new Date().toISOString().split('T')[0] });
      onSuccess();
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Failed' });
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} required className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none">
              <option value="">Select</option>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sub Category</label>
            <input type="text" value={form.subCategory} onChange={(e) => setForm({ ...form, subCategory: e.target.value })} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹)</label>
            <input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} required min="1" className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Payment Mode</label>
            <select value={form.paymentMode} onChange={(e) => setForm({ ...form, paymentMode: e.target.value })} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none">
              {PAYMENT_MODES.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
          <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none resize-none" />
        </div>
        <button type="submit" disabled={loading} className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-2.5 rounded-lg transition disabled:opacity-50">
          {loading ? 'Adding...' : 'Add Expense'}
        </button>
      </form>
    </div>
  );
}

function ReviewHistory({ expenses, onEdit }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      {expenses.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-8">No expenses found</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left text-gray-500">
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Amount</th>
                <th className="px-4 py-3 font-medium">Payment</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {expenses.map((exp) => (
                <tr key={exp._id}>
                  <td className="px-4 py-3">{new Date(exp.date).toLocaleDateString()}</td>
                  <td className="px-4 py-3">{exp.category}</td>
                  <td className="px-4 py-3 font-medium">₹{exp.amount.toLocaleString()}</td>
                  <td className="px-4 py-3">{exp.paymentMode}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      exp.status === 'approved' ? 'bg-green-50 text-green-600' :
                      exp.status === 'rejected' ? 'bg-red-50 text-red-600' :
                      'bg-yellow-50 text-yellow-600'
                    }`}>{exp.status}</span>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => onEdit(exp)} className="text-orange-500 hover:text-orange-600 font-medium text-xs">Edit</button>
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

function DeleteRecord({ expenses, onDelete }) {
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this expense?')) return;
    try {
      await api.delete(`/expenses/${id}`);
      onDelete();
    } catch {}
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      {expenses.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-8">No expenses found</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left text-gray-500">
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Amount</th>
                <th className="px-4 py-3 font-medium">Description</th>
                <th className="px-4 py-3 font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {expenses.map((exp) => (
                <tr key={exp._id}>
                  <td className="px-4 py-3">{new Date(exp.date).toLocaleDateString()}</td>
                  <td className="px-4 py-3">{exp.category}</td>
                  <td className="px-4 py-3 font-medium">₹{exp.amount.toLocaleString()}</td>
                  <td className="px-4 py-3 text-gray-500">{exp.description || '--'}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => handleDelete(exp._id)} className="text-red-500 hover:text-red-600 font-medium text-xs">Delete</button>
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

function EditExpenseModal({ expense, onClose, onSave }) {
  const [form, setForm] = useState({
    category: expense.category,
    amount: expense.amount,
    description: expense.description || '',
    paymentMode: expense.paymentMode,
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.put(`/expenses/${expense._id}`, { ...form, amount: Number(form.amount) });
      onSave(data);
    } catch {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Edit Expense</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none">
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹)</label>
            <input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} required className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Payment Mode</label>
            <select value={form.paymentMode} onChange={(e) => setForm({ ...form, paymentMode: e.target.value })} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none">
              {PAYMENT_MODES.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none resize-none" />
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-lg font-medium hover:bg-gray-50 transition">Cancel</button>
            <button type="submit" disabled={loading} className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-2.5 rounded-lg font-medium transition disabled:opacity-50">
              {loading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
