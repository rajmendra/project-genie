import { useState, useEffect } from 'react';
import { useBranch } from '../../context/BranchContext';
import api from '../../api/axios';

export default function ViewBalance() {
  const { selectedBranch, branches } = useBranch();
  const [wallets, setWallets] = useState([]);

  useEffect(() => {
    api.get('/wallet/balance')
      .then(({ data }) => setWallets(data))
      .catch(() => {});
  }, []);

  const currentWallet = wallets.find((w) => w.branch?._id === selectedBranch?._id);

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-gray-900">View Balance</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {wallets.map((w) => (
          <div key={w._id} className={`bg-white rounded-xl p-5 border shadow-sm ${w.branch?._id === selectedBranch?._id ? 'border-orange-300 ring-2 ring-orange-100' : 'border-gray-100'}`}>
            <p className="text-sm text-gray-500">{w.branch?.name || 'Unknown Branch'}</p>
            <p className="text-2xl font-bold text-gray-900 mt-2">₹{w.balance.toLocaleString()}</p>
            <p className="text-xs text-gray-400 mt-1">Updated: {new Date(w.updatedAt).toLocaleDateString()}</p>
          </div>
        ))}
      </div>

      {wallets.length === 0 && (
        <p className="text-sm text-gray-400 text-center py-8">No wallet data found</p>
      )}
    </div>
  );
}
