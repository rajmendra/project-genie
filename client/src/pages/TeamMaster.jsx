import { useEffect, useState } from 'react';
import { useBranch } from '../context/BranchContext';
import api from '../api/axios';
import { HiOutlineUserAdd, HiOutlineTrash, HiOutlinePencil } from 'react-icons/hi';

export default function TeamMaster() {
  const { selectedBranch } = useBranch();
  const [team, setTeam] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', phone: '', role: 'Trainer', joinDate: new Date().toISOString().slice(0, 10) });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedBranch) fetchTeam();
  }, [selectedBranch]);

  const fetchTeam = async () => {
    try {
      const { data } = await api.get('/team', { params: { branch: selectedBranch._id } });
      setTeam(data);
    } catch (err) {
      console.error('Error fetching team:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editId) {
        await api.patch(`/team/${editId}`, form);
      } else {
        await api.post('/team', { ...form, branch: selectedBranch._id });
      }
      setForm({ name: '', email: '', phone: '', role: 'Trainer', joinDate: new Date().toISOString().slice(0, 10) });
      setEditId(null);
      setShowForm(false);
      fetchTeam();
    } catch (err) {
      alert('Error: ' + (err.response?.data?.message || 'Failed to save'));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this team member?')) return;
    try {
      await api.delete(`/team/${id}`);
      fetchTeam();
    } catch (err) {
      alert('Error deleting member');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Team Master</h1>
          <p className="text-sm text-gray-500">{selectedBranch?.name || 'Select branch'}</p>
        </div>
        <button onClick={() => { setShowForm(!showForm); setEditId(null); }} className="bg-orange-500 hover:bg-orange-600 text-white font-medium px-4 py-2 rounded-lg flex items-center gap-2">
          <HiOutlineUserAdd /> Add Staff
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <form onSubmit={handleSubmit} className="space-y-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="text" placeholder="Name" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} required className="px-3 py-2 border border-gray-300 rounded-lg" />
            <input type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} required className="px-3 py-2 border border-gray-300 rounded-lg" />
            <input type="tel" placeholder="Phone" value={form.phone} onChange={(e) => setForm({...form, phone: e.target.value})} required className="px-3 py-2 border border-gray-300 rounded-lg" />
            <select value={form.role} onChange={(e) => setForm({...form, role: e.target.value})} className="px-3 py-2 border border-gray-300 rounded-lg">
              <option>Trainer</option><option>Manager</option><option>Staff</option><option>Admin</option>
            </select>
            <input type="date" value={form.joinDate} onChange={(e) => setForm({...form, joinDate: e.target.value})} required className="px-3 py-2 border border-gray-300 rounded-lg md:col-span-2" />
            <div className="flex gap-2 md:col-span-2">
              <button type="submit" disabled={loading} className="flex-1 bg-orange-500 text-white py-2 rounded-lg hover:bg-orange-600 disabled:opacity-50">{loading ? 'Saving...' : 'Save'}</button>
              <button type="button" onClick={() => setShowForm(false)} className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        {team.length === 0 ? (
          <div className="text-center text-gray-400 py-8">No team members</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-3 text-left font-medium">Name</th>
                  <th className="px-4 py-3 text-left font-medium">Email</th>
                  <th className="px-4 py-3 text-left font-medium">Phone</th>
                  <th className="px-4 py-3 text-left font-medium">Role</th>
                  <th className="px-4 py-3 text-left font-medium">Join Date</th>
                  <th className="px-4 py-3 text-left font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {team.map(m => (
                  <tr key={m._id}>
                    <td className="px-4 py-3">{m.name}</td>
                    <td className="px-4 py-3">{m.email}</td>
                    <td className="px-4 py-3">{m.phone}</td>
                    <td className="px-4 py-3"><span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs">{m.role}</span></td>
                    <td className="px-4 py-3">{new Date(m.joinDate).toLocaleDateString()}</td>
                    <td className="px-4 py-3 flex gap-2">
                      <button onClick={() => { setForm(m); setEditId(m._id); setShowForm(true); }} className="text-blue-600"><HiOutlinePencil /></button>
                      <button onClick={() => handleDelete(m._id)} className="text-red-600"><HiOutlineTrash /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
