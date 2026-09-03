import React, { useState } from 'react';
import { Patient, PatientStatus } from '../types';

interface PatientsViewProps {
  patients: Patient[];
  onSelectPatient: (patient: Patient) => void;
  onAddNewPatient: () => void;
}

export const PatientsView: React.FC<PatientsViewProps> = ({
  patients,
  onSelectPatient,
  onAddNewPatient,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const filteredPatients = patients.filter((patient) => {
    const matchesSearch =
      patient.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.bloodType.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === 'ALL' || patient.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && filteredPatients.length > 0) {
      onSelectPatient(filteredPatients[0]);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 md:mt-4 space-y-6 pb-28 md:pb-12">
      {/* Doctor Patient Enrollment Notice Banner */}
      <div className="bg-gradient-to-r from-purple-950/70 via-indigo-950/50 to-cyan-950/60 border border-purple-500/30 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300 shrink-0">
            <span className="material-symbols-outlined text-[24px]">verified_user</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm sm:text-base font-bold font-mono text-white">
                Doctor Patient Enrolment Desk
              </h4>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-mono font-semibold">
                Doctor-Assigned ID
              </span>
            </div>
            <p className="text-xs text-white/60 font-mono mt-0.5 leading-relaxed">
              Patients cannot self-register. Register your patients here and issue their unique Patient ID & PIN for Patient Portal login.
            </p>
          </div>
        </div>

        <button
          onClick={onAddNewPatient}
          className="px-4 py-2.5 bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white font-mono font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all cursor-pointer shrink-0 flex items-center gap-2 hover:scale-105 active:scale-95"
        >
          <span className="material-symbols-outlined text-[17px]">person_add</span>
          Register Patient & Issue ID
        </button>
      </div>

      {/* Search Section */}
      <section className="space-y-2">
        <div className="relative w-full">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <span className="material-symbols-outlined text-white/40 text-[20px]">search</span>
          </div>
          <input
            id="patient-search"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search by Unique Patient ID (e.g., PID-99821) or Name"
            className="block w-full pl-12 pr-10 py-3.5 border border-white/10 rounded-2xl bg-white/5 text-white placeholder-white/30 backdrop-blur-xl focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-white/30 font-['Inter'] text-[14px] leading-5 transition-all shadow-[0_4px_20px_rgba(0,0,0,0.3)]"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-white/40 hover:text-white"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          )}
        </div>
        <div className="flex items-center justify-between px-2">
          <p className="font-['Inter'] text-[11px] font-medium text-white/40">
            Press Enter to search across all patient database nodes.
          </p>
          <span className="font-mono text-[11px] text-white/40">
            {filteredPatients.length} record{filteredPatients.length !== 1 ? 's' : ''} found
          </span>
        </div>
      </section>

      {/* Filter Chips & Action */}
      <div className="flex items-center justify-between gap-3 overflow-x-auto pb-1">
        <div className="flex items-center gap-2 flex-wrap">
          {['ALL', 'Active', 'Critical', 'Stable', 'Pending Lab'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase transition-all cursor-pointer border ${
                statusFilter === status
                  ? 'bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.2)]'
                  : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10 border-white/10'
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        <button
          onClick={onAddNewPatient}
          className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-gradient-to-tr from-purple-600 to-orange-500 text-white text-xs font-bold tracking-wider uppercase rounded-full hover:scale-105 active:scale-95 transition-all whitespace-nowrap cursor-pointer shadow-[0_0_15px_rgba(168,85,247,0.3)] border border-white/20"
        >
          <span className="material-symbols-outlined text-[16px]">person_add</span>
          New Patient
        </button>
      </div>

      {/* Results List Card */}
      <section className="bg-white/[0.04] rounded-[24px] border border-white/10 overflow-hidden shadow-2xl backdrop-blur-xl">
        <div className="px-5 py-3.5 border-b border-white/10 bg-white/[0.02] flex items-center justify-between">
          <h2 className="font-['Inter'] text-[11px] font-bold text-white/40 uppercase tracking-[0.2em]">
            {searchQuery ? 'Search Results' : 'Recent Patient Files'}
          </h2>
          <span className="text-[10px] text-white/30 font-mono">Sorted by recent activity</span>
        </div>

        <ul className="divide-y divide-white/5">
          {filteredPatients.map((patient) => {
            const isCritical = patient.status === 'Critical';
            const isActive = patient.status === 'Active';

            return (
              <li
                key={patient.id}
                onClick={() => onSelectPatient(patient)}
                className="p-5 hover:bg-white/[0.08] transition-colors cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-3 group"
              >
                <div>
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="data-tabular font-mono text-[12px] font-semibold text-cyan-300 bg-cyan-950/60 px-2.5 py-0.5 rounded-lg border border-cyan-500/40 flex items-center gap-1.5 shadow-sm">
                      <span className="material-symbols-outlined text-[14px]">badge</span>
                      Login ID: <strong>{patient.id}</strong>
                    </span>
                    {isActive && (
                      <span className="bg-white/10 text-white/80 border border-white/15 rounded-full px-2.5 py-0.5 font-['Inter'] text-[10px] font-bold uppercase tracking-wider">
                        Active
                      </span>
                    )}
                    {isCritical && (
                      <span className="bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-full px-2.5 py-0.5 font-['Inter'] text-[10px] font-bold uppercase tracking-wider animate-pulse">
                        Critical
                      </span>
                    )}
                    {patient.status === 'Pending Lab' && (
                      <span className="bg-orange-500/20 text-orange-200 border border-orange-500/30 rounded-full px-2.5 py-0.5 font-['Inter'] text-[10px] font-bold uppercase tracking-wider">
                        Pending Lab
                      </span>
                    )}
                    {patient.status === 'Stable' && (
                      <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full px-2.5 py-0.5 font-['Inter'] text-[10px] font-bold uppercase tracking-wider">
                        Stable
                      </span>
                    )}
                  </div>

                  <h3 className="font-headline-md text-[20px] font-semibold text-white mt-1.5 group-hover:text-orange-200 transition-colors">
                    {patient.name}
                  </h3>
                </div>

                <div className="flex items-center gap-5 text-white/60 font-['Inter'] text-[14px]">
                  <div className="flex flex-col">
                    <span className="font-['Inter'] text-[10px] font-bold text-white/30 uppercase tracking-widest">
                      Age
                    </span>
                    <span className="data-tabular font-mono font-semibold text-white/90">{patient.age}</span>
                  </div>

                  <div className="h-6 w-px bg-white/10"></div>

                  <div className="flex flex-col">
                    <span className="font-['Inter'] text-[10px] font-bold text-white/30 uppercase tracking-widest">
                      Blood Type
                    </span>
                    <span className="data-tabular font-mono font-semibold text-white/90">
                      {patient.bloodType}
                    </span>
                  </div>

                  <span className="material-symbols-outlined text-white/30 ml-2 hidden md:block group-hover:translate-x-1 group-hover:text-white transition-all">
                    chevron_right
                  </span>
                </div>
              </li>
            );
          })}

          {filteredPatients.length === 0 && (
            <li className="p-10 text-center text-white/40">
              <span className="material-symbols-outlined text-[36px] text-white/20 mb-2">
                person_search
              </span>
              <p className="font-medium text-sm text-white/80">No matching patient records found</p>
              <p className="text-xs text-white/40 mt-1">
                Try searching by different patient ID, name, or change status filters.
              </p>
            </li>
          )}
        </ul>
      </section>
    </div>
  );
};
