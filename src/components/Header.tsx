import React from 'react';
import { ActiveTab, UserRole, DoctorProfile, Patient } from '../types';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onSearchClick: () => void;
  userRole: UserRole;
  currentDoctor: DoctorProfile;
  currentPatient: Patient | null;
  onOpenDoctorSwitchModal: () => void;
  onOpenPatientLoginModal: () => void;
  onSwitchRole: (role: UserRole) => void;
  onOpenAuthPage?: () => void;
  dbType?: string;
  isDbConnected?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onSearchClick,
  userRole,
  currentDoctor,
  currentPatient,
  onOpenDoctorSwitchModal,
  onOpenPatientLoginModal,
  onSwitchRole,
  onOpenAuthPage,
  dbType,
  isDbConnected = true,
}) => {
  return (
    <header className="bg-[#0a050b]/80 w-full top-0 sticky border-b border-white/10 backdrop-blur-md z-40">
      <div className="flex items-center justify-between px-4 sm:px-8 h-20 w-full max-w-7xl mx-auto">
        {/* Left: Brand Logo & Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab('landing')}
            aria-label="SwRakshak First Appearance Page"
            title="SwRakshak First Page & About"
            className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-600 to-orange-400 p-0.5 flex items-center justify-center shadow-[0_0_16px_rgba(168,85,247,0.4)] hover:scale-105 transition-transform cursor-pointer shrink-0"
          >
            <div className="w-full h-full rounded-full bg-[#0a050b]/40 flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-[20px]">
                {userRole === 'doctor' ? 'clinical_notes' : 'health_and_safety'}
              </span>
            </div>
          </button>

          <div
            onClick={() => setActiveTab('landing')}
            title="Go to SwRakshak First Page"
            className="flex flex-col cursor-pointer select-none hover:opacity-90 transition-opacity"
          >
            <div className="flex items-center gap-2">
              <span className="text-lg md:text-xl font-bold tracking-tight text-white font-mono">
                SwRakshak
              </span>
              <span
                className={`px-2 py-0.5 text-[10px] font-bold tracking-widest rounded-full uppercase border hidden sm:inline-block ${
                  userRole === 'doctor'
                    ? 'bg-purple-500/20 text-purple-200 border-purple-500/30'
                    : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
                }`}
              >
                {userRole === 'doctor' ? 'DOCTOR HUB' : 'PATIENT PORTAL'}
              </span>

              {dbType && (
                <span
                  title={
                    dbType === 'postgres'
                      ? 'Connected to PostgreSQL Database'
                      : 'Connected to local SQLite SQL Database (swrakshak.db)'
                  }
                  className="px-2 py-0.5 text-[9px] font-mono font-semibold tracking-wider rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 hidden md:inline-flex items-center gap-1"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
                  SQL: {dbType === 'postgres' ? 'POSTGRESQL' : 'SQLITE'}
                </span>
              )}
            </div>
            <span className="text-[11px] font-mono text-white/50 -mt-0.5 hidden sm:block">
              {userRole === 'doctor'
                ? `${currentDoctor.name} • ${currentDoctor.department}`
                : currentPatient
                ? `${currentPatient.name} (${currentPatient.id})`
                : 'Patient Medical Access'}
            </span>
          </div>
        </div>

        {/* Desktop Navigation Links (Doctor Mode) */}
        {userRole === 'doctor' && (
          <nav className="hidden md:flex items-center gap-2">
            <button
              onClick={() => setActiveTab('landing')}
              className={`px-3 py-2 rounded-full text-xs font-semibold tracking-wider uppercase transition-all flex items-center gap-1 cursor-pointer ${
                activeTab === 'landing'
                  ? 'bg-purple-600/30 text-purple-200 border border-purple-500/40'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              <span className="material-symbols-outlined text-[15px]">home</span>
              <span>Home / About</span>
            </button>
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-4 py-2 rounded-full text-xs font-semibold tracking-wider uppercase transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-white/15 text-white border border-white/20 shadow-[0_0_12px_rgba(255,255,255,0.1)]'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('patients')}
              className={`px-4 py-2 rounded-full text-xs font-semibold tracking-wider uppercase transition-all ${
                activeTab === 'patients'
                  ? 'bg-white/15 text-white border border-white/20 shadow-[0_0_12px_rgba(255,255,255,0.1)]'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              Patients
            </button>
            <button
              onClick={() => setActiveTab('records')}
              className={`px-4 py-2 rounded-full text-xs font-semibold tracking-wider uppercase transition-all ${
                activeTab === 'records'
                  ? 'bg-white/15 text-white border border-white/20 shadow-[0_0_12px_rgba(255,255,255,0.1)]'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              Clinical Records
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`px-4 py-2 rounded-full text-xs font-semibold tracking-wider uppercase transition-all ${
                activeTab === 'profile'
                  ? 'bg-white/15 text-white border border-white/20 shadow-[0_0_12px_rgba(255,255,255,0.1)]'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              My Profile
            </button>
          </nav>
        )}

        {/* Desktop Navigation Links (Patient Mode) */}
        {userRole === 'patient' && (
          <nav className="hidden md:flex items-center gap-2">
            <button
              onClick={() => setActiveTab('landing')}
              className={`px-3 py-2 rounded-full text-xs font-semibold tracking-wider uppercase transition-all flex items-center gap-1 cursor-pointer ${
                activeTab === 'landing'
                  ? 'bg-cyan-600/30 text-cyan-200 border border-cyan-500/40'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              <span className="material-symbols-outlined text-[15px]">home</span>
              <span>Home / About</span>
            </button>
            <button
              onClick={() => setActiveTab('my-health')}
              className={`px-4 py-2 rounded-full text-xs font-semibold tracking-wider uppercase transition-all ${
                activeTab === 'my-health'
                  ? 'bg-cyan-500/20 text-cyan-200 border border-cyan-400/40 shadow-[0_0_12px_rgba(6,182,212,0.2)]'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              My Health & Suggestions
            </button>
          </nav>
        )}

        {/* Right: Quick Role Switch & Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Dedicated Login / Sign Up Page Link */}
          {onOpenAuthPage && (
            <button
              onClick={onOpenAuthPage}
              title="SwRakshak Login & Sign Up Page"
              className="px-3 py-1.5 rounded-full bg-gradient-to-r from-purple-600/30 via-indigo-600/30 to-cyan-600/30 hover:from-purple-600/50 hover:to-cyan-600/50 text-white border border-white/20 text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm hover:scale-105"
            >
              <span className="material-symbols-outlined text-[16px] text-cyan-300">account_circle</span>
              <span className="hidden sm:inline">Login / Sign Up</span>
              <span className="sm:hidden">Auth</span>
            </button>
          )}

          {userRole === 'doctor' ? (
            <>
              {/* Switch Doctor Button */}
              <button
                onClick={onOpenDoctorSwitchModal}
                title="Switch Doctor / Add Login"
                className="px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/15 text-white/80 hover:text-white border border-white/15 text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px] text-purple-300">swap_horiz</span>
                <span className="hidden lg:inline">Doctor:</span> {currentDoctor.name.split(' ')[1] || 'Doctor'}
              </button>

              {/* Switch to Patient Login */}
              <button
                onClick={onOpenPatientLoginModal}
                title="Patient Login Portal"
                className="px-3.5 py-1.5 rounded-full bg-cyan-950/40 hover:bg-cyan-900/60 text-cyan-300 border border-cyan-500/30 text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm hover:scale-105"
              >
                <span className="material-symbols-outlined text-[16px]">person</span>
                <span>Patient Login</span>
              </button>

              {/* Search Action */}
              <button
                onClick={onSearchClick}
                aria-label="Search patient records"
                className="w-9 h-9 rounded-full border border-white/20 bg-white/5 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 hover:border-white/40 transition-all cursor-pointer shadow-sm"
              >
                <span className="material-symbols-outlined text-[18px]">search</span>
              </button>
            </>
          ) : (
            <>
              {/* Patient switch profile */}
              <button
                onClick={onOpenPatientLoginModal}
                title="Switch Patient Account"
                className="px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/15 text-white/80 hover:text-white border border-white/15 text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px] text-cyan-300">swap_horiz</span>
                <span className="hidden sm:inline">Switch Patient</span>
              </button>

              {/* Return to Doctor Hub */}
              <button
                onClick={() => onSwitchRole('doctor')}
                title="Doctor Hub Portal"
                className="px-3.5 py-1.5 rounded-full bg-purple-950/50 hover:bg-purple-900/70 text-purple-200 border border-purple-400/30 text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm hover:scale-105"
              >
                <span className="material-symbols-outlined text-[16px]">medical_services</span>
                <span>Doctor Portal</span>
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
