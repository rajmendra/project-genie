import { useState, useEffect } from 'react';
import { useBranch } from '../context/BranchContext';
import api from '../api/axios';

const STATUS_TABS = [
  { key: 'search', label: 'Easy Search' },
  { key: 'payable', label: 'Payable Record' },
  { key: 'processing', label: 'Under Processing' },
  { key: 'uncleared', label: 'Uncleared Record' },
];

export default function RemittanceMaster() {
  const [activeTab, setActiveTab] = useState('search');
  const { selectedBranch } = useBranch();
  const [remittances, setRemittances] = useState([]);
  const [search, setSearch] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [paymentModes, setPaymentModes] = useState([]);

  const fetchRemittances = () => {
    if (!selectedBranch) return;
    const params = { branch: selectedBranch._id };
    if (activeTab !== 'search') params.status = activeTab;
    if (search) params.search = search;
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    api.get('/remittances', { params })
      .then(({ data }) => {
        let filtered = data;
        if (paymentModes.length > 0) {
          filtered = data.filter((r) => paymentModes.includes(r.paymentMode));
        }
        setRemittances(filtered);
      })
      .catch(() => setRemittances([]));
  };

  useEffect(() => { fetchRemittances(); }, [selectedBranch, activeTab]);

  const togglePaymentMode = (mode) => {
    setPaymentModes((prev) =>
      prev.includes(mode) ? prev.filter((m) => m !== mode) : [...prev, mode]
    );
  };

  const exportPDF = () => {
    const printWindow = window.open('', '_blank');
    const rows = remittances.map((r) =>
      `<tr><td>${r.invoiceNo}</td><td>${r.memberName || '--'}</td><td>₹${r.amount.toLocaleString()}</td><td>${r.paymentMode}</td><td>${r.status}</td><td>${new Date(r.date).toLocaleDateString()}</td></tr>`
    ).join('');
    printWindow.document.write(`
      <html><head><title>Remittance Report</title><style>
        body{font-family:sans-serif;padding:20px}
        table{width:100%;border-collapse:collapse}
        th,td{border:1px solid #ddd;padding:8px;text-align:left;font-size:13px}
        th{background:#f5f5f5}
      </style></head><body>
      <h2>Remittance Report - ${selectedBranch?.name}</h2>
      <table><thead><tr><th>Invoice</th><th>Member</th><th>Amount</th><th>Payment</th><th>Status</th><th>Date</th></tr></thead>
      <tbody>${rows}</tbody></table></body></html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Remittance Master</h1>
        <button onClick={exportPDF} className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-lg transition">
          Export PDF
        </button>
      </div>

      <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
        {STATUS_TABS.map((tab) => (
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

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 space-y-4">
        <div className="flex flex-wrap gap-3">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search invoice or member..."
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none flex-1 min-w-[200px]"
          />
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none" />
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none" />
          <button onClick={fetchRemittances} className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-lg transition">Search</button>
        </div>

        <div className="flex flex-wrap gap-2">
          {['Cash', 'UPI', 'Card', 'Bank Transfer'].map((mode) => (
            <button
              key={mode}
              onClick={() => togglePaymentMode(mode)}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition ${
                paymentModes.includes(mode)
                  ? 'bg-orange-50 border-orange-300 text-orange-600'
                  : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {remittances.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">No remittance records found</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left text-gray-500">
                  <th className="px-4 py-3 font-medium">Invoice No</th>
                  <th className="px-4 py-3 font-medium">Member</th>
                  <th className="px-4 py-3 font-medium">Amount</th>
                  <th className="px-4 py-3 font-medium">Payment</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {remittances.map((r) => (
                  <tr key={r._id}>
                    <td className="px-4 py-3 font-medium">{r.invoiceNo}</td>
                    <td className="px-4 py-3">{r.memberName || '--'}</td>
                    <td className="px-4 py-3 font-medium">₹{r.amount.toLocaleString()}</td>
                    <td className="px-4 py-3">{r.paymentMode}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        r.status === 'cleared' ? 'bg-green-50 text-green-600' :
                        r.status === 'processing' ? 'bg-blue-50 text-blue-600' :
                        r.status === 'uncleared' ? 'bg-red-50 text-red-600' :
                        'bg-yellow-50 text-yellow-600'
                      }`}>{r.status}</span>
                    </td>
                    <td className="px-4 py-3">{new Date(r.date).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-gray-500">{r.remarks || '--'}</td>
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
