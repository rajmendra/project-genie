import { useLocation } from 'react-router-dom';
import { HiOutlineClock } from 'react-icons/hi';

const TITLES = {
  '/account-master': 'My Account Master',
  '/team-master': 'My Team Master',
  '/member-master': 'My Member Master',
  '/lead-master': 'My Lead Master',
  '/session-master': 'My Session Master',
};

export default function ComingSoon() {
  const location = useLocation();
  const title = TITLES[location.pathname] || 'This Module';

  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mb-6">
        <HiOutlineClock className="w-10 h-10 text-orange-500" />
      </div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">{title}</h1>
      <p className="text-gray-500 text-sm">Coming Soon</p>
      <p className="text-gray-400 text-xs mt-2 max-w-sm text-center">
        This module is currently under development. Check back later for updates.
      </p>
    </div>
  );
}
