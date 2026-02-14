import { useState, useEffect } from 'react';
import { useBranch } from '../context/BranchContext';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import {
  HiOutlineCurrencyRupee, HiOutlineUsers, HiOutlineCalendar,
  HiOutlineBell, HiOutlineTrendingUp, HiOutlineClipboardCheck,
} from 'react-icons/hi';

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{label}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
        <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { partner } = useAuth();
  const { selectedBranch } = useBranch();
  const [walletBalance, setWalletBalance] = useState(0);
  const [showLowBalanceModal, setShowLowBalanceModal] = useState(false);

  useEffect(() => {
    if (selectedBranch) {
      api.get('/wallet/balance', { params: { branch: selectedBranch._id } })
        .then(({ data }) => {
          const total = data.reduce((sum, w) => sum + w.balance, 0);
          setWalletBalance(total);
          if (total < 1000) setShowLowBalanceModal(true);
        })
        .catch(() => {});
    }
  }, [selectedBranch]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Overview of your business at {selectedBranch?.name || 'all branches'}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard icon={HiOutlineCurrencyRupee} label="Wallet Balance" value={`₹${walletBalance.toLocaleString()}`} color="bg-orange-500" />
        <StatCard icon={HiOutlineUsers} label="Active Members" value="--" color="bg-blue-500" />
        <StatCard icon={HiOutlineCalendar} label="Today's Sessions" value="--" color="bg-green-500" />
        <StatCard icon={HiOutlineBell} label="Notifications" value="--" color="bg-purple-500" />
        <StatCard icon={HiOutlineTrendingUp} label="Monthly Revenue" value="--" color="bg-indigo-500" />
        <StatCard icon={HiOutlineClipboardCheck} label="Pending Tasks" value="--" color="bg-rose-500" />
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <h3 className="text-base font-semibold text-gray-900 mb-4">Rush Controller</h3>
        <RushController branchId={selectedBranch?._id} />
      </div>

      {showLowBalanceModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <HiOutlineCurrencyRupee className="w-6 h-6 text-red-500" />
            </div>
            <h3 className="text-lg font-semibold text-center text-gray-900">Low Wallet Balance</h3>
            <p className="text-sm text-gray-500 text-center mt-2">
              Your wallet balance is below ₹1,000. Please add money to continue operations.
            </p>
            <button
              onClick={() => setShowLowBalanceModal(false)}
              className="w-full mt-5 bg-orange-500 hover:bg-orange-600 text-white py-2.5 rounded-lg font-medium transition"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function RushController({ branchId }) {
  const [activeTab, setActiveTab] = useState('rush');
  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    if (!branchId) return;
    const statusMap = { rush: 'active', overtime: 'overtime', nearEnd: 'near-end' };
    api.get('/sessions', { params: { branch: branchId, status: statusMap[activeTab] } })
      .then(({ data }) => setSessions(data))
      .catch(() => setSessions([]));
  }, [branchId, activeTab]);

  const tabs = [
    { key: 'rush', label: 'Rush Control Action' },
    { key: 'overtime', label: 'Overtime' },
    { key: 'nearEnd', label: 'Session Near to End' },
  ];

  const handleAction = async (id, action) => {
    try {
      await api.patch(`/sessions/${id}/action`, { action });
      setSessions((prev) => prev.filter((s) => s._id !== id));
    } catch {}
  };

  return (
    <div>
      <div className="flex gap-1 mb-4 bg-gray-100 rounded-lg p-1">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 py-2 text-xs font-medium rounded-md transition ${
              activeTab === tab.key ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {sessions.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-8">No sessions found</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b">
                <th className="pb-2 font-medium">Member</th>
                <th className="pb-2 font-medium">Type</th>
                <th className="pb-2 font-medium">Trainer</th>
                <th className="pb-2 font-medium">Start</th>
                <th className="pb-2 font-medium">End</th>
                <th className="pb-2 font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {sessions.map((s) => (
                <tr key={s._id}>
                  <td className="py-2.5">{s.memberName}</td>
                  <td className="py-2.5">{s.sessionType}</td>
                  <td className="py-2.5">{s.trainer || '--'}</td>
                  <td className="py-2.5">{new Date(s.startTime).toLocaleTimeString()}</td>
                  <td className="py-2.5">{new Date(s.endTime).toLocaleTimeString()}</td>
                  <td className="py-2.5">
                    <div className="flex gap-1">
                      <button onClick={() => handleAction(s._id, 'end')} className="px-2 py-1 bg-red-50 text-red-600 rounded text-xs font-medium hover:bg-red-100">End</button>
                      <button onClick={() => handleAction(s._id, 'extend')} className="px-2 py-1 bg-green-50 text-green-600 rounded text-xs font-medium hover:bg-green-100">Extend</button>
                    </div>
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
