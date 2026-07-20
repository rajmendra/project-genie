import { useEffect, useState } from 'react';
import { useBranch } from '../context/BranchContext';
import api from '../api/axios';
import { HiOutlinePlusCircle } from 'react-icons/hi';

export default function SessionMaster() {
  const { selectedBranch } = useBranch();
  const [sessions, setSessions] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ memberName: '', trainerName: '', date: new Date().toISOString().slice(0, 10), time: '10:00', duration: 60, type: 'Regular', status: 'Scheduled' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedBranch) fetchSessions();
  }, [selectedBranch]);

  const fetchSessions = async () => {
    try {
      const { data } = await api.get('/sessions', { params: { branch: selectedBranch._id } });
      setSessions(data);
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/sessions', { ...form, branch: selectedBranch._id });
      setForm({ memberName: '', trainerName: '', date: new Date().toISOString().slice(0, 10), time: '10:00', duration: 60, type: 'Regular', status: 'Scheduled' });
      setShowForm(false);
      fetchSessions();
    } catch (err) {
      alert('Error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div><h1 className="text-2xl font-bold text-gray-900">Session Master</h1></div>
        <button onClick={() => setShowForm(!showForm)} className="bg-orange-500 text-white font-medium px-4 py-2 rounded-lg flex items-center gap-2">
          <HiOutlinePlusCircle /> Book Session
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <form onSubmit={handleSubmit} className="space-y-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="text" placeholder="Member Name" value={form.memberName} onChange={(e) => setForm({...form, memberName: e.target.value})} required className="px-3 py-2 border border-gray-300 rounded-lg" />
            <input type="text" placeholder="Trainer Name" value={form.trainerName} onChange={(e) => setForm({...form, trainerName: e.target.value})} required className="px-3 py-2 border border-gray-300 rounded-lg" />
            <input type="date" value={form.date} onChange={(e) => setForm({...form, date: e.target.value})} required className="px-3 py-2 border border-gray-300 rounded-lg" />
            <input type="time" value={form.time} onChange={(e) => setForm({...form, time: e.target.value})} required className="px-3 py-2 border border-gray-300 rounded-lg" />
            <input type="number" placeholder="Duration (mins)" value={form.duration} onChange={(e) => setForm({...form, duration: e.target.value})} required className="px-3 py-2 border border-gray-300 rounded-lg" />
            <select value={form.type} onChange={(e) => setForm({...form, type: e.target.value})} className="px-3 py-2 border border-gray-300 rounded-lg">
              <option>Regular</option><option>Personal</option><option>Group</option><option>Class</option>
            </select>
            <div className="flex gap-2 md:col-span-2">
              <button type="submit" disabled={loading} className="flex-1 bg-orange-500 text-white py-2 rounded-lg">{loading ? 'Booking...' : 'Book'}</button>
              <button type="button" onClick={() => setShowForm(false)} className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        {sessions.length === 0 ? <div className="text-center text-gray-400 py-8">No sessions</div> : (
          <table className="w-full text-sm">
            <thead><tr className="bg-gray-50"><th className="px-4 py-3 text-left">Member</th><th className="px-4 py-3 text-left">Trainer</th><th className="px-4 py-3 text-left">Date & Time</th><th className="px-4 py-3 text-left">Type</th></tr></thead>
            <tbody className="divide-y">{sessions.map(s => (
              <tr key={s._id}><td className="px-4 py-3">{s.memberName}</td><td className="px-4 py-3">{s.trainerName}</td><td className="px-4 py-3">{new Date(s.date).toLocaleDateString()} {s.time}</td><td className="px-4 py-3"><span className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs">{s.type}</span></td></tr>
            ))}</tbody>
          </table>
        )}
      </div>
    </div>
  );
}
