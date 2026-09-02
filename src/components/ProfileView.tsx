import React, { useState } from 'react';
import { DoctorProfile } from '../types';

interface ProfileViewProps {
  doctor: DoctorProfile;
  onUpdateDoctor: (updated: Partial<DoctorProfile>) => void;
  onOpenChangePinModal: () => void;
  onLogout: () => void;
  onEditPhoto: () => void;
  showToast: (msg: string) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  doctor,
  onUpdateDoctor,
  onOpenChangePinModal,
  onLogout,
  onEditPhoto,
  showToast,
}) => {
  const [selectedLanguage, setSelectedLanguage] = useState(doctor.language);

  const handleToggleBiometrics = () => {
    const newState = !doctor.biometricEnabled;
    onUpdateDoctor({ biometricEnabled: newState });
    showToast(newState ? 'Biometric Authentication enabled' : 'Biometric Authentication disabled');
  };

  const handleToggleCriticalAlerts = () => {
    const newState = !doctor.criticalAlertsEnabled;
    onUpdateDoctor({ criticalAlertsEnabled: newState });
    showToast(newState ? 'Critical Lab Alerts turned ON' : 'Critical Lab Alerts turned OFF');
  };

  const handleToggleScheduleUpdates = () => {
    const newState = !doctor.scheduleUpdatesEnabled;
    onUpdateDoctor({ scheduleUpdatesEnabled: newState });
    showToast(newState ? 'Daily Schedule Updates enabled' : 'Daily Schedule Updates disabled');
  };

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const lang = e.target.value;
    setSelectedLanguage(lang);
    onUpdateDoctor({ language: lang });
    showToast(`Language preference updated to ${lang}`);
  };

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto px-4 py-4 md:py-6 pb-32 md:pb-12">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left Column: Profile Overview Bento */}
        <div className="md:col-span-4 flex flex-col gap-5">
          {/* Profile Card */}
          <div className="bg-white/[0.04] rounded-[24px] p-6 border border-white/10 shadow-2xl backdrop-blur-xl relative overflow-hidden group">
            <div className="flex flex-col items-center text-center">
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-purple-500/30 shadow-[0_0_25px_rgba(168,85,247,0.3)] mb-4 relative bg-purple-950/40">
                <img
                  src={doctor.avatarUrl}
                  alt={`Doctor portrait of ${doctor.name}`}
                  data-alt="A highly detailed professional medical portrait of a senior cardiologist wearing a white coat and stethoscope, set against a clean, modern clinic background with soft, natural lighting. The overall mood is authoritative, calm, and trustworthy, fitting a clinical light-mode UI aesthetic."
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={onEditPhoto}
                  aria-label="Change photo"
                  className="absolute bottom-1 right-1 bg-gradient-to-tr from-purple-600 to-orange-500 text-white p-2 rounded-full shadow-lg hover:scale-110 transition-transform cursor-pointer border border-white/30"
                >
                  <span className="material-symbols-outlined text-[16px]">edit</span>
                </button>
              </div>

              <h1 className="font-headline-lg text-[22px] md:text-[24px] font-bold text-white mb-1">
                {doctor.name}
              </h1>
              <p className="font-['Inter'] text-[14px] text-orange-200 font-semibold mb-4">
                {doctor.title}
              </p>

              <div className="w-full h-px bg-white/10 my-2"></div>

              <div className="w-full text-left space-y-2.5 mt-2 font-mono">
                <div className="flex items-center text-white/60 text-xs">
                  <span className="material-symbols-outlined text-purple-300 mr-2 text-[18px]">
                    location_on
                  </span>
                  <span>
                    {doctor.department}, {doctor.room}
                  </span>
                </div>
                <div className="flex items-center text-white/60 text-xs">
                  <span className="material-symbols-outlined text-orange-300 mr-2 text-[18px]">
                    badge
                  </span>
                  <span>NODE ID: {doctor.employeeId}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats Bento */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/5 rounded-2xl p-4 border border-white/10 text-center backdrop-blur-md hover:bg-white/[0.08] transition-all">
              <span className="material-symbols-outlined text-purple-300 mb-1 text-[22px]">
                group
              </span>
              <div className="data-tabular font-mono text-[22px] font-bold text-white">
                {doctor.patientsCount.toLocaleString()}
              </div>
              <div className="font-['Inter'] text-[10px] font-bold text-white/40 uppercase tracking-widest mt-1">
                Patients
              </div>
            </div>

            <div className="bg-white/5 rounded-2xl p-4 border border-white/10 text-center backdrop-blur-md hover:bg-white/[0.08] transition-all">
              <span className="material-symbols-outlined text-orange-300 mb-1 text-[22px]">
                calendar_month
              </span>
              <div className="data-tabular font-mono text-[22px] font-bold text-white">
                {doctor.apptsTodayCount}
              </div>
              <div className="font-['Inter'] text-[10px] font-bold text-white/40 uppercase tracking-widest mt-1">
                Appts Today
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Settings Sections */}
        <div className="md:col-span-8 flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h2 className="font-headline-md text-xs font-bold text-white/40 uppercase tracking-[0.2em]">
              Account Settings
            </h2>
            <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              ENCRYPTED CONTEXT
            </span>
          </div>

          {/* Security & PIN Card */}
          <div className="bg-white/[0.04] rounded-[24px] border border-white/10 shadow-2xl backdrop-blur-xl overflow-hidden">
            <div className="px-5 py-3.5 bg-white/[0.02] border-b border-white/10 flex items-center">
              <span className="material-symbols-outlined text-purple-300 mr-2 text-[20px]">
                lock
              </span>
              <h3 className="font-['Inter'] text-[14px] font-bold text-white uppercase tracking-wider">
                Security & PIN
              </h3>
            </div>

            <ul className="divide-y divide-white/5">
              {/* Change Login PIN */}
              <li
                onClick={onOpenChangePinModal}
                className="px-5 py-4 flex items-center justify-between hover:bg-white/[0.07] transition-colors cursor-pointer group"
              >
                <div>
                  <div className="font-['Inter'] text-[14px] font-medium text-white/90 group-hover:text-orange-200 transition-colors">
                    Change Login PIN
                  </div>
                  <div className="font-mono text-[11px] text-white/40 mt-0.5">
                    Last updated 45 days ago
                  </div>
                </div>
                <span className="material-symbols-outlined text-white/30 group-hover:text-white group-hover:translate-x-1 transition-all text-[20px]">
                  chevron_right
                </span>
              </li>

              {/* Biometric Authentication */}
              <li className="px-5 py-4 flex items-center justify-between hover:bg-white/[0.07] transition-colors">
                <div>
                  <div className="font-['Inter'] text-[14px] font-medium text-white/90">
                    Biometric Authentication
                  </div>
                  <div className="font-mono text-[11px] text-white/40 mt-0.5">
                    Face ID / Fingerprint Key
                  </div>
                </div>

                {/* Toggle Switch */}
                <button
                  onClick={handleToggleBiometrics}
                  role="switch"
                  aria-checked={doctor.biometricEnabled}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    doctor.biometricEnabled
                      ? 'bg-gradient-to-r from-purple-600 to-orange-500 shadow-[0_0_12px_rgba(168,85,247,0.5)]'
                      : 'bg-white/20'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                      doctor.biometricEnabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </li>
            </ul>
          </div>

          {/* Notification Preferences Card */}
          <div className="bg-white/[0.04] rounded-[24px] border border-white/10 shadow-2xl backdrop-blur-xl overflow-hidden">
            <div className="px-5 py-3.5 bg-white/[0.02] border-b border-white/10 flex items-center">
              <span className="material-symbols-outlined text-orange-300 mr-2 text-[20px]">
                notifications
              </span>
              <h3 className="font-['Inter'] text-[14px] font-bold text-white uppercase tracking-wider">
                Notification Preferences
              </h3>
            </div>

            <ul className="divide-y divide-white/5">
              {/* Critical Lab Alerts */}
              <li className="px-5 py-4 flex items-center justify-between hover:bg-white/[0.07] transition-colors">
                <div>
                  <div className="font-['Inter'] text-[14px] font-medium text-white/90">
                    Critical Lab Alerts
                  </div>
                  <div className="font-mono text-[11px] text-white/40 mt-0.5">
                    Push notifications for abnormal clinical telemetry
                  </div>
                </div>

                <button
                  onClick={handleToggleCriticalAlerts}
                  role="switch"
                  aria-checked={doctor.criticalAlertsEnabled}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    doctor.criticalAlertsEnabled
                      ? 'bg-gradient-to-r from-purple-600 to-orange-500 shadow-[0_0_12px_rgba(168,85,247,0.5)]'
                      : 'bg-white/20'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                      doctor.criticalAlertsEnabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </li>

              {/* Schedule Updates */}
              <li className="px-5 py-4 flex items-center justify-between hover:bg-white/[0.07] transition-colors">
                <div>
                  <div className="font-['Inter'] text-[14px] font-medium text-white/90">
                    Schedule Updates
                  </div>
                  <div className="font-mono text-[11px] text-white/40 mt-0.5">
                    Daily sync and department rotations
                  </div>
                </div>

                <button
                  onClick={handleToggleScheduleUpdates}
                  role="switch"
                  aria-checked={doctor.scheduleUpdatesEnabled}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    doctor.scheduleUpdatesEnabled
                      ? 'bg-gradient-to-r from-purple-600 to-orange-500 shadow-[0_0_12px_rgba(168,85,247,0.5)]'
                      : 'bg-white/20'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                      doctor.scheduleUpdatesEnabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </li>
            </ul>
          </div>

          {/* Language & Region Card */}
          <div className="bg-white/[0.04] rounded-[24px] border border-white/10 shadow-2xl backdrop-blur-xl overflow-hidden">
            <div className="px-5 py-3.5 bg-white/[0.02] border-b border-white/10 flex items-center">
              <span className="material-symbols-outlined text-cyan-300 mr-2 text-[20px]">
                language
              </span>
              <h3 className="font-['Inter'] text-[14px] font-bold text-white uppercase tracking-wider">
                Language & Region
              </h3>
            </div>

            <div className="p-5">
              <div className="relative">
                <select
                  value={selectedLanguage}
                  onChange={handleLanguageChange}
                  className="block w-full appearance-none rounded-2xl border border-white/15 bg-white/5 px-4 py-3 font-['Inter'] text-[14px] text-white shadow-lg backdrop-blur-xl focus:border-white/40 focus:outline-none cursor-pointer"
                >
                  <option value="English (US)" className="bg-[#150b1a] text-white">English (US)</option>
                  <option value="Spanish (ES)" className="bg-[#150b1a] text-white">Spanish (ES)</option>
                  <option value="French (FR)" className="bg-[#150b1a] text-white">French (FR)</option>
                  <option value="German (DE)" className="bg-[#150b1a] text-white">German (DE)</option>
                  <option value="Portuguese (BR)" className="bg-[#150b1a] text-white">Portuguese (BR)</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-white/40">
                  <span className="material-symbols-outlined text-[20px]">arrow_drop_down</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Area */}
          <div className="pt-4 mt-2 border-t border-white/10 flex justify-end">
            <button
              onClick={onLogout}
              className="flex items-center justify-center px-6 py-2.5 rounded-full border border-rose-500/40 text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 transition-all font-['Inter'] text-[12px] font-bold uppercase tracking-wider cursor-pointer shadow-lg hover:scale-105 active:scale-95"
            >
              <span className="material-symbols-outlined mr-2 text-[18px]">logout</span>
              Logout Securely
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
