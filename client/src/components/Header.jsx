import { HiOutlineMenu, HiOutlineBell, HiOutlineLogout } from 'react-icons/hi';
import { useAuth } from '../context/AuthContext';
import { useBranch } from '../context/BranchContext';

export default function Header({ onMenuClick }) {
  const { partner, logout } = useAuth();
  const { selectedBranch, setSelectedBranch, branches } = useBranch();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-gray-200 px-4 sm:px-6 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={onMenuClick} className="lg:hidden p-1.5 rounded-lg hover:bg-gray-100">
            <HiOutlineMenu className="w-6 h-6 text-gray-600" />
          </button>
          <div>
            <h2 className="text-sm font-semibold text-gray-900">
              {getGreeting()}, {partner?.name || 'Partner'}
            </h2>
            <p className="text-xs text-gray-400">Welcome to your dashboard</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedBranch?._id || ''}
            onChange={(e) => {
              const branch = branches.find((b) => b._id === e.target.value);
              setSelectedBranch(branch);
            }}
            className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            {branches.map((b) => (
              <option key={b._id} value={b._id}>{b.name}</option>
            ))}
          </select>

          <button className="relative p-2 rounded-lg hover:bg-gray-100">
            <HiOutlineBell className="w-5 h-5 text-gray-500" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
          </button>

          <button onClick={logout} className="p-2 rounded-lg hover:bg-gray-100" title="Logout">
            <HiOutlineLogout className="w-5 h-5 text-gray-500" />
          </button>
        </div>
      </div>
    </header>
  );
}
