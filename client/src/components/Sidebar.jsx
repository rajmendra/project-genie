import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  HiOutlineHome, HiOutlineCreditCard, HiOutlineUserCircle,
  HiOutlineUsers, HiOutlineUserGroup, HiOutlineClipboardList,
  HiOutlineCurrencyRupee, HiOutlineCalendar, HiOutlineBell,
  HiOutlineChatAlt2, HiOutlineDocumentText, HiOutlineChevronDown,
  HiOutlineChevronRight, HiOutlineEye, HiOutlineClock, HiOutlinePlusCircle,
} from 'react-icons/hi';

const navItems = [
  { label: 'Dashboard', path: '/dashboard', icon: HiOutlineHome },
  {
    label: 'My Wallet Master', path: '/wallet', icon: HiOutlineCreditCard,
    children: [
      { label: 'View Balance', path: '/wallet/balance', icon: HiOutlineEye },
      { label: 'Wallet History', path: '/wallet/history', icon: HiOutlineClock },
      { label: 'Add Money', path: '/wallet/add-money', icon: HiOutlinePlusCircle },
    ],
  },
  { label: 'My Account Master', path: '/account-master', icon: HiOutlineUserCircle },
  { label: 'My Team Master', path: '/team-master', icon: HiOutlineUsers },
  { label: 'My Member Master', path: '/member-master', icon: HiOutlineUserGroup },
  { label: 'My Lead Master', path: '/lead-master', icon: HiOutlineClipboardList },
  { label: 'My Expense Master', path: '/expense-master', icon: HiOutlineCurrencyRupee },
  { label: 'My Session Master', path: '/session-master', icon: HiOutlineCalendar },
  { label: 'Notification', path: '/notifications', icon: HiOutlineBell },
  { label: 'Contact Genie', path: '/contact-genie', icon: HiOutlineChatAlt2 },
  { label: 'Remittance Master', path: '/remittance-master', icon: HiOutlineDocumentText },
];

export default function Sidebar({ isOpen, onClose }) {
  const [expandedItems, setExpandedItems] = useState({});
  const location = useLocation();

  const toggleExpand = (label) => {
    setExpandedItems((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  const linkClass = (path) => {
    const active = location.pathname === path || location.pathname.startsWith(path + '/');
    return `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-colors ${
      active
        ? 'bg-orange-50 text-orange-600 font-medium'
        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
    }`;
  };

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/30 z-40 lg:hidden" onClick={onClose} />
      )}
      <aside className={`fixed top-0 left-0 z-50 h-full w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'} flex flex-col`}>
        <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100">
          <div className="w-9 h-9 bg-orange-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">G</span>
          </div>
          <div>
            <h1 className="text-base font-bold text-gray-900">Genie Fit</h1>
            <p className="text-[11px] text-gray-400">Partner Panel</p>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-0.5">
          {navItems.map((item) => {
            if (item.children) {
              const isExpanded = expandedItems[item.label] || location.pathname.startsWith(item.path);
              return (
                <div key={item.label}>
                  <button
                    onClick={() => toggleExpand(item.label)}
                    className={`${linkClass(item.path)} w-full justify-between`}
                  >
                    <span className="flex items-center gap-3">
                      <item.icon className="w-5 h-5" />
                      {item.label}
                    </span>
                    {isExpanded ? <HiOutlineChevronDown className="w-4 h-4" /> : <HiOutlineChevronRight className="w-4 h-4" />}
                  </button>
                  {isExpanded && (
                    <div className="ml-5 mt-0.5 space-y-0.5">
                      {item.children.map((child) => (
                        <NavLink key={child.path} to={child.path} className={linkClass(child.path)} onClick={onClose}>
                          <child.icon className="w-4 h-4" />
                          {child.label}
                        </NavLink>
                      ))}
                    </div>
                  )}
                </div>
              );
            }
            return (
              <NavLink key={item.path} to={item.path} className={linkClass(item.path)} onClick={onClose}>
                <item.icon className="w-5 h-5" />
                {item.label}
              </NavLink>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
