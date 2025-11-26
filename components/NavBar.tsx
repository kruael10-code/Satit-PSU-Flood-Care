import React from 'react';
import { Home, AlertTriangle, MessageCircle, ShieldAlert } from 'lucide-react';
import { ViewState } from '../types';

interface NavBarProps {
  currentView: ViewState;
  setView: (view: ViewState) => void;
}

const NavBar: React.FC<NavBarProps> = ({ currentView, setView }) => {
  const navItem = (view: ViewState, icon: React.ReactNode, label: string) => (
    <button
      onClick={() => setView(view)}
      className={`flex flex-col items-center justify-center w-full py-2 transition-colors ${
        currentView === view ? 'text-blue-600' : 'text-gray-400 hover:text-blue-400'
      }`}
    >
      {icon}
      <span className="text-xs mt-1 font-medium">{label}</span>
    </button>
  );

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-[0_-2px_10px_rgba(0,0,0,0.05)] z-50">
      <div className="flex justify-around max-w-md mx-auto">
        {navItem('HOME', <Home size={24} />, 'หน้าหลัก')}
        {navItem('REPORT', <AlertTriangle size={24} />, 'แจ้งเหตุ')}
        {navItem('ADMIN', <ShieldAlert size={24} />, 'จนท.')}
      </div>
    </div>
  );
};

export default NavBar;
