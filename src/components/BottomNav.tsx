import React from 'react';
import { ActiveTab, UserRole } from '../types';

interface BottomNavProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  userRole: UserRole;
  onOpenPatientLogin?: () => void;
  onOpenDoctorSwitch?: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  setActiveTab,
  userRole,
  onOpenPatientLogin,
  onOpenDoctorSwitch,
}) => {
  if (userRole === 'patient') {
    return (
      <nav className="md:hidden fixed bottom-0 left-0 w-full flex justify-around items-center px-2 pb-safe border-t border-white/10 bg-[#0a050b]/90 backdrop-blur-2xl z-50 h-20 shadow-[0_-4px_25px_rgba(0,0,0,0.5)]">
        {/* Home / Landing */}
        <button
          onClick={() => setActiveTab('landing')}
          className={`flex flex-col items-center justify-center transition-all ${
            activeTab === 'landing'
              ? 'bg-purple-600/20 text-purple-200 border border-purple-400/40 rounded-full px-3 py-1.5'
              : 'text-white/40 px-3 py-1 hover:text-white/80'
          }`}
        >
          <span className="material-symbols-outlined mb-0.5 text-[20px]">home</span>
          <span className="font-['Inter'] text-[10px] font-medium leading-none">Home</span>
        </button>

        {/* My Health */}
        <button
          onClick={() => setActiveTab('my-health')}
          className={`flex flex-col items-center justify-center transition-all ${
            activeTab === 'my-health'
              ? 'bg-cyan-500/20 text-cyan-200 border border-cyan-400/40 shadow-[0_0_12px_rgba(6,182,212,0.2)] rounded-full px-3 py-1.5'
              : 'text-white/40 px-3 py-1 hover:text-white/80'
          }`}
        >
          <span className="material-symbols-outlined mb-0.5 text-[20px]">health_and_safety</span>
          <span className="font-['Inter'] text-[10px] font-medium leading-none">My Health</span>
        </button>

        {/* Token Booking */}
        <button
          onClick={() => setActiveTab('token-booking')}
          className={`flex flex-col items-center justify-center transition-all ${
            activeTab === 'token-booking'
              ? 'bg-amber-500/20 text-amber-200 border border-amber-400/40 shadow-[0_0_12px_rgba(245,158,11,0.2)] rounded-full px-3 py-1.5'
              : 'text-white/40 px-3 py-1 hover:text-white/80'
          }`}
        >
          <span className="material-symbols-outlined mb-0.5 text-[20px]">confirmation_number</span>
          <span className="font-['Inter'] text-[10px] font-medium leading-none">Token</span>
        </button>

        {/* Switch Patient */}
        {onOpenPatientLogin && (
          <button
            onClick={onOpenPatientLogin}
            className="flex flex-col items-center justify-center text-white/40 px-3 py-1 hover:text-white/80 transition-all"
          >
            <span className="material-symbols-outlined mb-0.5 text-[20px]">swap_horiz</span>
            <span className="font-['Inter'] text-[10px] font-medium leading-none">Switch</span>
          </button>
        )}

        {/* Switch to Doctor */}
        {onOpenDoctorSwitch && (
          <button
            onClick={onOpenDoctorSwitch}
            className="flex flex-col items-center justify-center text-purple-300/70 px-3 py-1 hover:text-purple-200 transition-all"
          >
            <span className="material-symbols-outlined mb-0.5 text-[20px]">medical_services</span>
            <span className="font-['Inter'] text-[10px] font-medium leading-none">Doctor Hub</span>
          </button>
        )}

        {/* Auth / Login Option */}
        <button
          onClick={() => setActiveTab('auth')}
          className="flex flex-col items-center justify-center text-white/40 px-3 py-1 hover:text-white/80 transition-all"
        >
          <span className="material-symbols-outlined mb-0.5 text-[20px]">account_circle</span>
          <span className="font-['Inter'] text-[10px] font-medium leading-none">Login</span>
        </button>
      </nav>
    );
  }

  return (
    <nav className="md:hidden fixed bottom-0 left-0 w-full flex justify-around items-center px-2 pb-safe border-t border-white/10 bg-[#0a050b]/90 backdrop-blur-2xl z-50 h-20 shadow-[0_-4px_25px_rgba(0,0,0,0.5)]">
      {/* Home / Landing */}
      <button
        onClick={() => setActiveTab('landing')}
        className={`flex flex-col items-center justify-center transition-all ${
          activeTab === 'landing'
            ? 'bg-purple-600/20 text-purple-200 border border-purple-400/40 rounded-full px-3 py-1'
            : 'text-white/40 px-3 py-1 hover:text-white/80'
        }`}
      >
        <span className="material-symbols-outlined mb-0.5 text-[20px]">home</span>
        <span className="font-['Inter'] text-[10px] font-medium leading-none">Home</span>
      </button>

      {/* Dashboard */}
      <button
        onClick={() => setActiveTab('dashboard')}
        className={`flex flex-col items-center justify-center transition-all ${
          activeTab === 'dashboard'
            ? 'bg-white/15 text-white border border-white/20 shadow-[0_0_12px_rgba(255,255,255,0.15)] rounded-full px-3 py-1 scale-95'
            : 'text-white/40 px-3 py-1 hover:text-white/80'
        }`}
      >
        <span
          className="material-symbols-outlined mb-0.5 text-[20px]"
          style={{ fontVariationSettings: activeTab === 'dashboard' ? "'FILL' 1" : "'FILL' 0" }}
        >
          dashboard
        </span>
        <span className="font-['Inter'] text-[10px] font-medium leading-none">Dashboard</span>
      </button>

      {/* Patients */}
      <button
        onClick={() => setActiveTab('patients')}
        className={`flex flex-col items-center justify-center transition-all ${
          activeTab === 'patients'
            ? 'bg-white/15 text-white border border-white/20 shadow-[0_0_12px_rgba(255,255,255,0.15)] rounded-full px-3 py-1 scale-95'
            : 'text-white/40 px-3 py-1 hover:text-white/80'
        }`}
      >
        <span
          className="material-symbols-outlined mb-0.5 text-[20px]"
          style={{ fontVariationSettings: activeTab === 'patients' ? "'FILL' 1" : "'FILL' 0" }}
        >
          group
        </span>
        <span className="font-['Inter'] text-[10px] font-medium leading-none">Patients</span>
      </button>

      {/* Records */}
      <button
        onClick={() => setActiveTab('records')}
        className={`flex flex-col items-center justify-center transition-all ${
          activeTab === 'records'
            ? 'bg-white/15 text-white border border-white/20 shadow-[0_0_12px_rgba(255,255,255,0.15)] rounded-full px-3 py-1 scale-95'
            : 'text-white/40 px-3 py-1 hover:text-white/80'
        }`}
      >
        <span
          className="material-symbols-outlined mb-0.5 text-[20px]"
          style={{ fontVariationSettings: activeTab === 'records' ? "'FILL' 1" : "'FILL' 0" }}
        >
          receipt_long
        </span>
        <span className="font-['Inter'] text-[10px] font-medium leading-none">Records</span>
      </button>

      {/* Token Booking */}
      <button
        onClick={() => setActiveTab('token-booking')}
        className={`flex flex-col items-center justify-center transition-all ${
          activeTab === 'token-booking'
            ? 'bg-amber-500/20 text-amber-200 border border-amber-400/40 shadow-[0_0_12px_rgba(245,158,11,0.2)] rounded-full px-3 py-1 scale-95'
            : 'text-white/40 px-3 py-1 hover:text-white/80'
        }`}
      >
        <span
          className="material-symbols-outlined mb-0.5 text-[20px]"
          style={{ fontVariationSettings: activeTab === 'token-booking' ? "'FILL' 1" : "'FILL' 0" }}
        >
          confirmation_number
        </span>
        <span className="font-['Inter'] text-[10px] font-medium leading-none">Tokens</span>
      </button>

      {/* Profile */}
      <button
        onClick={() => setActiveTab('profile')}
        className={`flex flex-col items-center justify-center transition-all ${
          activeTab === 'profile'
            ? 'bg-white/15 text-white border border-white/20 shadow-[0_0_12px_rgba(255,255,255,0.15)] rounded-full px-3 py-1 scale-95'
            : 'text-white/40 px-3 py-1 hover:text-white/80'
        }`}
      >
        <span
          className="material-symbols-outlined mb-0.5 text-[20px]"
          style={{ fontVariationSettings: activeTab === 'profile' ? "'FILL' 1" : "'FILL' 0" }}
        >
          person
        </span>
        <span className="font-['Inter'] text-[10px] font-medium leading-none">Profile</span>
      </button>
    </nav>
  );
};
