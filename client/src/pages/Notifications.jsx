import { useState, useEffect } from 'react';
import { useBranch } from '../context/BranchContext';
import api from '../api/axios';

export default function Notifications() {
  const [activeTab, setActiveTab] = useState('team');
  const { selectedBranch } = useBranch();
  const [notifications, setNotifications] = useState([]);
  const [selectedNotif, setSelectedNotif] = useState(null);

  useEffect(() => {
    if (selectedBranch) {
      api.get('/notifications', { params: { branch: selectedBranch._id, type: activeTab } })
        .then(({ data }) => setNotifications(data))
        .catch(() => setNotifications([]));
    }
  }, [selectedBranch, activeTab]);

  const markRead = async (id) => {
    await api.patch(`/notifications/${id}/read`).catch(() => {});
  };

  const tabs = [
    { key: 'team', label: 'By Team' },
    { key: 'system', label: 'By System' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-gray-900">Notifications</h1>

      <div className="flex gap-1 bg-gray-100 rounded-lg p-1 max-w-xs">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => { setActiveTab(tab.key); setSelectedNotif(null); }}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition ${
              activeTab === tab.key ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {selectedNotif ? (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <button onClick={() => setSelectedNotif(null)} className="text-sm text-orange-500 hover:text-orange-600 mb-4">&larr; Back to list</button>
          <h2 className="text-lg font-semibold text-gray-900">{selectedNotif.title}</h2>
          <p className="text-xs text-gray-400 mt-1">{new Date(selectedNotif.createdAt).toLocaleString()}</p>
          <div className="mt-4 text-sm text-gray-700 leading-relaxed">{selectedNotif.message}</div>
          <span className={`inline-block mt-4 px-2 py-0.5 rounded-full text-xs font-medium ${
            selectedNotif.priority === 'high' ? 'bg-red-50 text-red-600' :
            selectedNotif.priority === 'medium' ? 'bg-yellow-50 text-yellow-600' :
            'bg-green-50 text-green-600'
          }`}>{selectedNotif.priority} priority</span>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm divide-y divide-gray-50">
          {notifications.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">No notifications</p>
          ) : (
            notifications.map((n) => (
              <button
                key={n._id}
                onClick={() => { setSelectedNotif(n); markRead(n._id); }}
                className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition flex items-start gap-3 ${!n.isRead ? 'bg-orange-50/30' : ''}`}
              >
                {!n.isRead && <span className="w-2 h-2 bg-orange-500 rounded-full mt-1.5 shrink-0" />}
                <div className="min-w-0">
                  <p className={`text-sm ${!n.isRead ? 'font-semibold' : 'font-medium'} text-gray-900 truncate`}>{n.title}</p>
                  <p className="text-xs text-gray-500 truncate mt-0.5">{n.message}</p>
                  <p className="text-xs text-gray-400 mt-1">{new Date(n.createdAt).toLocaleDateString()}</p>
                </div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
