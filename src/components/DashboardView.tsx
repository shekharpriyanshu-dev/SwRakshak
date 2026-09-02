import React, { useState } from 'react';
import { Patient } from '../types';

interface DashboardViewProps {
  patients: Patient[];
  onSelectPatient: (patient: Patient) => void;
  onOpenNewRecordModal: () => void;
  onOpenRecentScansModal: () => void;
  onOpenPendingLabsFilter: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  patients,
  onSelectPatient,
  onOpenNewRecordModal,
  onOpenRecentScansModal,
  onOpenPendingLabsFilter,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const filteredPatients = searchQuery.trim()
    ? patients.filter(
        (p) =>
          p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (filteredPatients.length > 0) {
      onSelectPatient(filteredPatients[0]);
    } else if (patients.length > 0) {
      onSelectPatient(patients[0]);
    }
  };

  const todayPatients = patients.filter((p) => p.timeSeenToday);

  return (
    <div className="flex-grow p-4 md:p-8 max-w-7xl mx-auto w-full pb-28 md:pb-10 space-y-8">
      {/* Search Bar */}
      <section className="relative max-w-xl mx-auto">
        <form onSubmit={handleSearchSubmit} className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <span className="material-symbols-outlined text-white/40 text-[20px]">search</span>
          </div>
          <input
            id="dashboard-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setTimeout(() => setIsFocused(false), 200)}
            placeholder="Enter Patient Unique ID (e.g., PID-10293)"
            className={`block w-full pl-11 pr-4 py-3.5 border border-white/10 rounded-2xl bg-white/5 text-white placeholder-white/30 backdrop-blur-xl focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-white/30 text-sm transition-all shadow-[0_4px_20px_rgba(0,0,0,0.3)] ${
              isFocused ? 'ring-2 ring-purple-500/40 border-white/30 bg-white/[0.08]' : ''
            }`}
          />
        </form>

        {/* Live Search Suggestions Dropdown */}
        {isFocused && searchQuery.trim().length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-[#120816]/95 border border-white/15 rounded-2xl shadow-[0_10px_35px_rgba(0,0,0,0.8)] backdrop-blur-2xl z-30 overflow-hidden">
            {filteredPatients.length > 0 ? (
              <ul className="divide-y divide-white/5">
                {filteredPatients.map((p) => (
                  <li
                    key={p.id}
                    onMouseDown={() => onSelectPatient(p)}
                    className="p-3.5 hover:bg-white/10 transition-colors cursor-pointer flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-purple-300">{p.id}</span>
                        <span
                          className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider border ${
                            p.status === 'Critical'
                              ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                              : p.status === 'Pending Lab'
                              ? 'bg-orange-500/20 text-orange-200 border-orange-500/30'
                              : 'bg-white/10 text-white/80 border-white/10'
                          }`}
                        >
                          {p.status}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-white/90 mt-1">{p.name}</p>
                    </div>
                    <span className="text-xs text-white/40 font-mono">{p.bloodType} • {p.age}y</span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-4 text-sm text-white/40 text-center">
                No patient found with "{searchQuery}"
              </div>
            )}
          </div>
        )}
      </section>

      {/* Grid: Quick Actions & Activity Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Quick Actions Bento */}
        <div className="col-span-1 space-y-4 flex flex-col">
          {/* New Record Button */}
          <button
            onClick={onOpenNewRecordModal}
            className="flex-1 bg-gradient-to-tr from-purple-600 to-orange-500 text-white rounded-[24px] p-6 flex flex-col items-center justify-center gap-2.5 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer shadow-[0_0_25px_rgba(168,85,247,0.3)] border border-white/20 min-h-[120px] group"
          >
            <span
              className="material-symbols-outlined text-[36px] group-hover:rotate-6 transition-transform"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              note_add
            </span>
            <span className="font-['Inter'] text-[15px] font-bold uppercase tracking-wider">New Record</span>
          </button>

          {/* Recent Scans Button */}
          <button
            onClick={onOpenRecentScansModal}
            className="flex-1 border border-white/15 text-white bg-white/5 rounded-[24px] p-6 flex flex-col items-center justify-center gap-2.5 hover:bg-white/10 hover:border-white/30 active:scale-[0.98] transition-all cursor-pointer shadow-lg backdrop-blur-xl min-h-[120px] group"
          >
            <span className="material-symbols-outlined text-[36px] text-orange-200 group-hover:scale-110 transition-transform">medical_information</span>
            <span className="font-['Inter'] text-[15px] font-bold uppercase tracking-wider text-white/90">Recent Scans</span>
          </button>
        </div>

        {/* Activity Summary Bento */}
        <div className="col-span-1 md:col-span-2 bg-white/[0.04] rounded-[24px] border border-white/10 p-6 flex flex-col shadow-2xl backdrop-blur-xl">
          <div className="flex items-center justify-between mb-5 border-b border-white/10 pb-3">
            <h2 className="font-headline-md text-xs font-bold text-white/40 uppercase tracking-[0.2em]">
              Activity Summary
            </h2>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-orange-400 animate-pulse"></div>
              <span className="text-[11px] font-mono text-orange-200/80 uppercase tracking-tighter">LIVE TELEMETRY</span>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 flex-grow">
            {/* Patients Seen */}
            <div className="bg-white/5 border border-white/10 p-4 rounded-2xl text-center flex flex-col justify-center items-center hover:bg-white/10 transition-colors">
              <span className="data-tabular font-['Public_Sans'] text-[28px] font-bold text-white tracking-tight">
                24
              </span>
              <span className="font-['Inter'] text-[10px] font-bold uppercase tracking-widest text-white/40 mt-1">
                Patients Seen
              </span>
            </div>

            {/* Pending Labs */}
            <button
              onClick={onOpenPendingLabsFilter}
              className="bg-white/5 border border-white/10 p-4 rounded-2xl text-center flex flex-col justify-center items-center hover:bg-white/10 hover:border-white/25 transition-all cursor-pointer group"
            >
              <span className="data-tabular font-['Public_Sans'] text-[28px] font-bold text-orange-200 tracking-tight group-hover:scale-105 transition-transform">
                5
              </span>
              <span className="font-['Inter'] text-[10px] font-bold uppercase tracking-widest text-white/40 mt-1">
                Pending Labs
              </span>
            </button>

            {/* Scans Reviewed */}
            <button
              onClick={onOpenRecentScansModal}
              className="bg-white/5 border border-white/10 p-4 rounded-2xl text-center flex flex-col justify-center items-center hover:bg-white/10 hover:border-white/25 transition-all cursor-pointer group"
            >
              <span className="data-tabular font-['Public_Sans'] text-[28px] font-bold text-purple-300 tracking-tight group-hover:scale-105 transition-transform">
                12
              </span>
              <span className="font-['Inter'] text-[10px] font-bold uppercase tracking-widest text-white/40 mt-1">
                Scans Reviewed
              </span>
            </button>

            {/* Critical Alert */}
            <button
              onClick={() => {
                const critical = patients.find((p) => p.status === 'Critical');
                if (critical) onSelectPatient(critical);
              }}
              className="bg-rose-950/30 border border-rose-500/30 hover:bg-rose-900/40 hover:border-rose-400/50 p-4 rounded-2xl text-center flex flex-col justify-center items-center transition-all cursor-pointer group"
            >
              <span className="data-tabular font-['Public_Sans'] text-[28px] font-bold text-rose-400 tracking-tight group-hover:scale-105 transition-transform">
                1
              </span>
              <span className="font-['Inter'] text-[10px] font-bold uppercase tracking-widest text-rose-300/80 mt-1">
                Critical Alert
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Patients Seen Today Section */}
      <section className="bg-white/[0.04] rounded-[24px] border border-white/10 shadow-2xl backdrop-blur-xl overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <h2 className="font-headline-md text-xs font-bold text-white/40 uppercase tracking-[0.2em]">
            Patients Seen Today
          </h2>
          <span className="text-[11px] font-mono text-white/30">
            {todayPatients.length} NODES LOGGED
          </span>
        </div>

        <ul className="divide-y divide-white/5">
          {todayPatients.map((patient) => {
            const isCritical = patient.status === 'Critical';
            const isPending = patient.status === 'Pending Lab';

            return (
              <li
                key={patient.id}
                onClick={() => onSelectPatient(patient)}
                className="p-4 md:p-5 hover:bg-white/[0.07] transition-all flex items-center justify-between cursor-pointer group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-600/30 to-orange-600/30 border border-white/15 flex items-center justify-center text-white font-['Inter'] text-[14px] font-bold shadow-inner shrink-0 group-hover:scale-105 transition-transform">
                    {patient.initials || patient.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-['Inter'] text-[16px] font-semibold text-white/90 group-hover:text-white transition-colors">
                      {patient.name}
                    </div>
                    <div className="font-mono text-[11px] text-white/40 mt-0.5">
                      ID: #{patient.id}
                    </div>
                  </div>
                </div>

                <div className="text-right flex flex-col items-end">
                  <div className="data-tabular font-mono text-[13px] font-medium text-white/70">
                    {patient.timeSeenToday || '09:00 AM'}
                  </div>
                  <div
                    className={`font-['Inter'] text-[10px] font-bold tracking-wider uppercase px-3 py-1 rounded-full border inline-block mt-1 ${
                      isCritical
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/30 animate-pulse'
                        : isPending
                        ? 'bg-orange-500/20 text-orange-200 border-orange-500/30'
                        : 'bg-white/10 text-white/80 border-white/15'
                    }`}
                  >
                    {patient.status}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
};
