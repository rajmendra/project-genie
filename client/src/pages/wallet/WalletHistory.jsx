import { useState, useEffect } from 'react';
import { useBranch } from '../../context/BranchContext';
import api from '../../api/axios';

export default function WalletHistory() {
  const { selectedBranch } = useBranch();
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    if (selectedBranch) {
      api.get('/wallet/history', { params: { branch: selectedBranch._id } })
        .then(({ data }) => setTransactions(data))
        .catch(() => {});
    }
  }, [selectedBranch]);

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-gray-900">Wallet History</h1>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {transactions.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">No transactions found</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left text-gray-500">
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium">Type</th>
                  <th className="px-4 py-3 font-medium">Amount</th>
                  <th className="px-4 py-3 font-medium">Description</th>
                  <th className="px-4 py-3 font-medium">Balance After</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {transactions.map((t) => (
                  <tr key={t._id}>
                    <td className="px-4 py-3">{new Date(t.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${t.type === 'credit' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                        {t.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium">₹{t.amount.toLocaleString()}</td>
                    <td className="px-4 py-3 text-gray-500">{t.description}</td>
                    <td className="px-4 py-3">₹{t.balanceAfter?.toLocaleString()}</td>
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
