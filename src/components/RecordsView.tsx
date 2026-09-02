import React, { useState } from 'react';
import { Patient, ClinicalRecord, RecordType, UploadedLabTest, DoctorProfile } from '../types';
import { VitalsTrendsChart } from './VitalsTrendsChart';
import { LabUploadView } from './LabUploadView';

interface RecordsViewProps {
  patient: Patient;
  allPatients: Patient[];
  onSelectPatient: (patient: Patient) => void;
  onBack: () => void;
  onOpenReportModal: (record: ClinicalRecord) => void;
  onOpenLabResultsModal: (record: ClinicalRecord) => void;
  onOpenAddNoteModal: () => void;
  onOpenEditProfileModal: () => void;
  onOpenUpdateVitalsModal: () => void;
  onOpenAddSuggestionModal?: () => void;
  onOpenAddPrescriptionModal?: () => void;
  onOpenAddObservationModal?: () => void;
  onStartVideoConsult?: () => void;
  onUpdatePatientTests?: (updatedTests: UploadedLabTest[]) => void;
  currentDoctor?: DoctorProfile;
  currentDoctorName?: string;
  showToast?: (msg: string) => void;
}

export const RecordsView: React.FC<RecordsViewProps> = ({
  patient,
  allPatients,
  onSelectPatient,
  onBack,
  onOpenReportModal,
  onOpenLabResultsModal,
  onOpenAddNoteModal,
  onOpenEditProfileModal,
  onOpenUpdateVitalsModal,
  onOpenAddSuggestionModal,
  onOpenAddPrescriptionModal,
  onOpenAddObservationModal,
  onStartVideoConsult,
  onUpdatePatientTests,
  currentDoctor,
  currentDoctorName,
  showToast,
}) => {
  const [filterType, setFilterType] = useState<string>('ALL');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [showTrendsChart, setShowTrendsChart] = useState(false);
  const [showLabUploads, setShowLabUploads] = useState(false);

  const filteredHistory = patient.clinicalHistory.filter((rec) => {
    if (filterType === 'ALL') return true;
    return rec.type === filterType;
  });

  return (
    <div className="flex-grow w-full max-w-5xl mx-auto px-4 py-4 md:py-6 flex flex-col gap-6 pb-28 md:pb-12">
      {/* Mobile Header Context */}
      <div className="bg-[#0a050b]/80 backdrop-blur-xl sticky top-0 z-30 py-2 border-b border-white/10 flex items-center justify-between md:hidden shadow-lg">
        <div className="flex items-center gap-2">
          <button
            onClick={onBack}
            aria-label="Back"
            className="p-2 -ml-1 text-white/60 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[24px]">arrow_back</span>
          </button>
          <div>
            <h2 className="font-headline-md text-[18px] font-bold text-white">
              {patient.name}
            </h2>
            <p className="font-mono text-[11px] text-white/40 font-medium">{patient.id}</p>
          </div>
        </div>

        {/* Quick Switcher dropdown on mobile */}
        <div className="relative">
          <select
            value={patient.id}
            onChange={(e) => {
              const selected = allPatients.find((p) => p.id === e.target.value);
              if (selected) onSelectPatient(selected);
            }}
            aria-label="Select Patient"
            className="text-xs border border-white/15 bg-white/10 rounded-lg px-2.5 py-1.5 text-white focus:outline-none backdrop-blur-md"
          >
            {allPatients.map((p) => (
              <option key={p.id} value={p.id} className="bg-[#150b1a] text-white">
                {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Patient Header Card */}
      <section
        aria-label="Patient Overview"
        className="bg-white/[0.04] rounded-[24px] p-6 border border-white/10 shadow-2xl backdrop-blur-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
      >
        <div className="flex items-center gap-5">
          {/* Avatar / Initials */}
          <div className="relative w-16 h-16 rounded-2xl overflow-hidden border-2 border-purple-500/30 shadow-[0_0_20px_rgba(168,85,247,0.3)] bg-purple-950/40 flex items-center justify-center shrink-0">
            {patient.avatarUrl ? (
              <img
                src={patient.avatarUrl}
                alt={`Portrait of ${patient.name}`}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="font-mono font-bold text-xl text-purple-200">
                {patient.initials || patient.name.slice(0, 2).toUpperCase()}
              </span>
            )}
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="font-headline-lg text-xl md:text-2xl font-bold text-white tracking-tight">
                {patient.name}
              </h1>
              <span
                className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                  patient.status === 'Critical'
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    : patient.status === 'Active'
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                }`}
              >
                {patient.status}
              </span>
            </div>

            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs font-mono text-white/50">
              <p className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-purple-300">badge</span>
                <span>ID: {patient.id}</span>
              </p>
              <p className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-purple-300">
                  calendar_today
                </span>
                <span>DOB: {patient.dob} ({patient.age}y)</span>
              </p>
              <p className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-orange-300">
                  bloodtype
                </span>
                <span>Blood: {patient.bloodType}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Clinical Action Buttons */}
        <div className="flex items-center gap-2.5 w-full md:w-auto justify-end flex-wrap">
          {/* Quick patient selector on desktop */}
          <div className="hidden md:block mr-1">
            <select
              value={patient.id}
              onChange={(e) => {
                const selected = allPatients.find((p) => p.id === e.target.value);
                if (selected) onSelectPatient(selected);
              }}
              aria-label="Switch Patient"
              className="text-xs border border-white/15 bg-white/5 rounded-full px-3 py-2 text-white/90 focus:outline-none focus:border-white/40 cursor-pointer backdrop-blur-md font-mono"
            >
              {allPatients.map((p) => (
                <option key={p.id} value={p.id} className="bg-[#150b1a] text-white">
                  Switch: {p.name} ({p.id})
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={onOpenEditProfileModal}
            className="px-3.5 py-1.5 rounded-full bg-white/10 text-white font-['Inter'] text-[11px] font-bold uppercase tracking-wider border border-white/15 hover:bg-white/20 transition-all cursor-pointer"
          >
            Edit Profile
          </button>

          {onStartVideoConsult && (
            <button
              onClick={onStartVideoConsult}
              className="px-3.5 py-1.5 rounded-full bg-cyan-600/30 text-cyan-200 font-['Inter'] text-[11px] font-bold uppercase tracking-wider border border-cyan-400/40 hover:bg-cyan-600/50 transition-all cursor-pointer flex items-center gap-1 hover:scale-105"
            >
              <span className="material-symbols-outlined text-[15px]">videocam</span>
              Video Call
            </button>
          )}

          {onOpenAddSuggestionModal && (
            <button
              onClick={onOpenAddSuggestionModal}
              className="px-3.5 py-1.5 rounded-full bg-purple-600/30 text-purple-200 font-['Inter'] text-[11px] font-bold uppercase tracking-wider border border-purple-400/40 hover:bg-purple-600/50 transition-all cursor-pointer flex items-center gap-1 hover:scale-105"
            >
              <span className="material-symbols-outlined text-[15px]">tips_and_updates</span>
              Add Suggestion
            </button>
          )}

          {onOpenAddPrescriptionModal && (
            <button
              onClick={onOpenAddPrescriptionModal}
              className="px-3.5 py-1.5 rounded-full bg-orange-600/30 text-orange-200 font-['Inter'] text-[11px] font-bold uppercase tracking-wider border border-orange-400/40 hover:bg-orange-600/50 transition-all cursor-pointer flex items-center gap-1 hover:scale-105"
            >
              <span className="material-symbols-outlined text-[15px]">prescriptions</span>
              Prescribe
            </button>
          )}

          {onOpenAddObservationModal && (
            <button
              onClick={onOpenAddObservationModal}
              className="px-3.5 py-1.5 rounded-full bg-rose-600/30 text-rose-200 font-['Inter'] text-[11px] font-bold uppercase tracking-wider border border-rose-400/40 hover:bg-rose-600/50 transition-all cursor-pointer flex items-center gap-1 hover:scale-105"
            >
              <span className="material-symbols-outlined text-[15px]">lock</span>
              MD Note
            </button>
          )}

          <button
            onClick={onOpenAddNoteModal}
            className="px-4 py-1.5 rounded-full bg-gradient-to-tr from-purple-600 to-orange-500 text-white font-['Inter'] text-[11px] font-bold uppercase tracking-wider hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-[0_0_15px_rgba(168,85,247,0.3)] border border-white/20"
          >
            Add Record
          </button>
        </div>
      </section>

      {/* Key Metrics Bento (LATEST VITALS) */}
      <section aria-label="Key Health Metrics">
        <div className="flex items-center justify-between mb-3 px-1">
          <h3 className="font-['Inter'] text-[11px] font-bold text-white/40 uppercase tracking-[0.2em]">
            LATEST VITALS & TELEMETRY
          </h3>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowLabUploads(!showLabUploads)}
              className={`text-xs font-bold tracking-wider uppercase flex items-center gap-1.5 px-3 py-1 rounded-full border transition-all cursor-pointer ${
                showLabUploads
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white border-purple-400 shadow-[0_0_12px_rgba(168,85,247,0.4)]'
                  : 'bg-purple-500/10 text-purple-300 hover:bg-purple-500/20 border-purple-500/30'
              }`}
            >
              <span className="material-symbols-outlined text-[15px]">science</span>
              {showLabUploads ? 'Hide Home Labs' : `Home Lab Tests (${patient.uploadedLabTests?.length || 0}) 🧪`}
            </button>
            <button
              onClick={() => setShowTrendsChart(!showTrendsChart)}
              className={`text-xs font-bold tracking-wider uppercase flex items-center gap-1.5 px-3 py-1 rounded-full border transition-all cursor-pointer ${
                showTrendsChart
                  ? 'bg-purple-600 text-white border-purple-400 shadow-[0_0_12px_rgba(168,85,247,0.4)]'
                  : 'bg-purple-500/10 text-purple-300 hover:bg-purple-500/20 border-purple-500/30'
              }`}
            >
              <span className="material-symbols-outlined text-[15px]">timeline</span>
              {showTrendsChart ? 'Hide Trends' : 'Vitals Trends 📈'}
            </button>
            <button
              onClick={onOpenUpdateVitalsModal}
              className="text-xs text-orange-200 hover:text-white font-bold tracking-wider uppercase flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <span className="material-symbols-outlined text-[15px]">edit</span>
              Update Vitals
            </button>
          </div>
        </div>

        {/* Doctor Review: Home Lab Test Uploads */}
        {showLabUploads && onUpdatePatientTests && (
          <div className="mb-6">
            <LabUploadView
              patient={patient}
              currentDoctor={currentDoctor}
              isDoctorMode={true}
              onUpdatePatientTests={onUpdatePatientTests}
              onStartVideoConsult={onStartVideoConsult}
              showToast={showToast}
            />
          </div>
        )}

        {/* Optional Expanded Vitals Trends Chart for Doctor */}
        {showTrendsChart && (
          <div className="mb-4">
            <VitalsTrendsChart patient={patient} />
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Metric Card: BP */}
          <div className="bg-white/5 rounded-2xl p-4 flex flex-col justify-between border border-white/10 min-h-[110px] backdrop-blur-md hover:bg-white/[0.08] transition-all">
            <div className="flex items-center justify-between">
              <span className="font-['Inter'] text-[13px] text-white/60 font-medium">
                Blood Pressure
              </span>
              <span
                aria-hidden="true"
                className="material-symbols-outlined text-rose-400 text-[20px]"
              >
                favorite
              </span>
            </div>
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="data-tabular font-mono text-[22px] font-bold text-white">
                  {patient.vitals.bloodPressure.value}
                </span>
                <span className="font-mono text-[11px] text-white/40">
                  {patient.vitals.bloodPressure.unit}
                </span>
              </div>
              <p className="font-['Inter'] text-[11px] text-emerald-300 flex items-center gap-1 mt-1 font-semibold">
                <span className="material-symbols-outlined text-[14px]">arrow_downward</span>
                {patient.vitals.bloodPressure.status}
              </p>
            </div>
          </div>

          {/* Metric Card: HR */}
          <div className="bg-white/5 rounded-2xl p-4 flex flex-col justify-between border border-white/10 min-h-[110px] backdrop-blur-md hover:bg-white/[0.08] transition-all">
            <div className="flex items-center justify-between">
              <span className="font-['Inter'] text-[13px] text-white/60 font-medium">
                Heart Rate
              </span>
              <span
                aria-hidden="true"
                className="material-symbols-outlined text-purple-300 text-[20px]"
              >
                ecg
              </span>
            </div>
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="data-tabular font-mono text-[22px] font-bold text-white">
                  {patient.vitals.heartRate.value}
                </span>
                <span className="font-mono text-[11px] text-white/40">
                  {patient.vitals.heartRate.unit}
                </span>
              </div>
              <p className="font-['Inter'] text-[11px] text-white/50 flex items-center gap-1 mt-1 font-medium">
                {patient.vitals.heartRate.status}
              </p>
            </div>
          </div>

          {/* Metric Card: Weight */}
          <div className="bg-white/5 rounded-2xl p-4 flex flex-col justify-between border border-white/10 min-h-[110px] backdrop-blur-md hover:bg-white/[0.08] transition-all">
            <div className="flex items-center justify-between">
              <span className="font-['Inter'] text-[13px] text-white/60 font-medium">Weight</span>
              <span
                aria-hidden="true"
                className="material-symbols-outlined text-orange-300 text-[20px]"
              >
                scale
              </span>
            </div>
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="data-tabular font-mono text-[22px] font-bold text-white">
                  {patient.vitals.weight.value}
                </span>
                <span className="font-mono text-[11px] text-white/40">
                  {patient.vitals.weight.unit}
                </span>
              </div>
              <p className="font-['Inter'] text-[11px] text-white/50 flex items-center gap-1 mt-1 font-medium">
                {patient.vitals.weight.change}
              </p>
            </div>
          </div>

          {/* Metric Card: SpO2 */}
          <div className="bg-white/5 rounded-2xl p-4 flex flex-col justify-between border border-white/10 min-h-[110px] backdrop-blur-md hover:bg-white/[0.08] transition-all">
            <div className="flex items-center justify-between">
              <span className="font-['Inter'] text-[13px] text-white/60 font-medium">SpO2</span>
              <span
                aria-hidden="true"
                className="material-symbols-outlined text-cyan-300 text-[20px]"
              >
                air
              </span>
            </div>
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="data-tabular font-mono text-[22px] font-bold text-white">
                  {patient.vitals.spO2.value}
                </span>
                <span className="font-mono text-[11px] text-white/40">
                  {patient.vitals.spO2.unit}
                </span>
              </div>
              <p className="font-['Inter'] text-[11px] text-emerald-300 flex items-center gap-1 mt-1 font-medium">
                {patient.vitals.spO2.condition}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* DOCTOR SUGGESTIONS & CARE ADVICE (Shared with Patient) */}
      <section className="bg-white/[0.04] rounded-[24px] p-6 border border-purple-500/20 shadow-xl backdrop-blur-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-headline-md text-base font-bold text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-purple-300">tips_and_updates</span>
              Doctor Suggestions & Care Advice
            </h3>
            <p className="text-xs font-mono text-purple-200/60 mt-0.5">
              These suggestions are published directly to the patient's portal view
            </p>
          </div>
          {onOpenAddSuggestionModal && (
            <button
              onClick={onOpenAddSuggestionModal}
              className="px-3.5 py-1.5 rounded-full bg-purple-600/30 text-purple-200 text-xs font-mono font-bold hover:bg-purple-600/50 border border-purple-400/30 flex items-center gap-1 transition-all cursor-pointer"
            >
              + Add Advice
            </button>
          )}
        </div>

        {patient.doctorSuggestions && patient.doctorSuggestions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {patient.doctorSuggestions.map((sug) => (
              <div key={sug.id} className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono font-bold text-purple-300 bg-purple-950/50 px-2 py-0.5 rounded border border-purple-500/30">
                    {sug.category}
                  </span>
                  <span className="font-mono text-white/40">{sug.date}</span>
                </div>
                <p className="text-sm text-white/90 leading-relaxed">
                  {sug.suggestion}
                </p>
                <div className="text-[11px] font-mono text-white/50 pt-2 border-t border-white/10 flex justify-between">
                  <span>Author: {sug.doctorName}</span>
                  <span className="text-orange-300">{sug.priority}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-white/40 italic">No suggestions added for this patient yet.</p>
        )}
      </section>

      {/* CONFIDENTIAL DOCTOR OBSERVATIONS (Strictly MD ONLY) */}
      <section className="bg-rose-950/20 rounded-[24px] p-6 border border-rose-500/30 shadow-xl backdrop-blur-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-rose-400">shield</span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-headline-md text-base font-bold text-white">
                  Confidential Doctor Observations
                </h3>
                <span className="bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[9px] font-mono px-2 py-0.5 rounded font-bold uppercase">
                  MD Only • Hidden from Patient
                </span>
              </div>
              <p className="text-xs font-mono text-rose-200/60 mt-0.5">
                Internal clinical assessment notes not disclosed in the patient portal
              </p>
            </div>
          </div>
          {onOpenAddObservationModal && (
            <button
              onClick={onOpenAddObservationModal}
              className="px-3.5 py-1.5 rounded-full bg-rose-600/30 text-rose-200 text-xs font-mono font-bold hover:bg-rose-600/50 border border-rose-400/30 flex items-center gap-1 transition-all cursor-pointer"
            >
              + Add MD Observation
            </button>
          )}
        </div>

        {patient.doctorObservations && patient.doctorObservations.length > 0 ? (
          <div className="space-y-2">
            {patient.doctorObservations.map((obs, idx) => (
              <div key={idx} className="bg-black/30 border border-rose-500/20 rounded-xl p-3.5 text-xs text-rose-100 font-mono leading-relaxed flex items-start gap-2.5">
                <span className="material-symbols-outlined text-rose-400 text-[16px] shrink-0 mt-0.5">lock</span>
                <span>{obs}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-white/40 italic">No confidential observations recorded.</p>
        )}
      </section>

      {/* Chronological Timeline */}
      <section aria-label="Medical History Timeline" className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h3 className="font-['Inter'] text-[11px] font-bold text-white/40 uppercase tracking-[0.2em]">
            CLINICAL HISTORY & DIAGNOSTIC SCANS
          </h3>

          <div className="relative">
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="font-['Inter'] text-[12px] text-white/80 flex items-center gap-1.5 hover:text-white cursor-pointer font-bold tracking-wider uppercase px-3 py-1 bg-white/5 rounded-full border border-white/10"
            >
              Filter ({filterType})
              <span className="material-symbols-outlined text-[16px]">filter_list</span>
            </button>

            {isFilterOpen && (
              <div className="absolute right-0 top-full mt-2 bg-[#120816]/95 border border-white/15 rounded-2xl shadow-[0_10px_35px_rgba(0,0,0,0.8)] backdrop-blur-2xl z-20 py-2 w-40 text-sm overflow-hidden">
                {['ALL', 'MRI', 'CLINIC', 'BLOOD'].map((type) => (
                  <button
                    key={type}
                    onClick={() => {
                      setFilterType(type);
                      setIsFilterOpen(false);
                    }}
                    className={`block w-full text-left px-4 py-2 hover:bg-white/10 text-xs font-bold uppercase tracking-wider transition-colors ${
                      filterType === type ? 'text-orange-200 bg-white/10' : 'text-white/60'
                    }`}
                  >
                    {type === 'ALL' ? 'All Records' : `${type} Only`}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="relative pl-6 border-l-2 border-white/10 space-y-6">
          {filteredHistory.map((record, index) => {
            const isFirst = index === 0;

            return (
              <div key={record.id} className="relative group">
                {/* Timeline Dot Node */}
                <div
                  className={`absolute -left-[31px] ${
                    isFirst
                      ? 'bg-gradient-to-tr from-purple-500 to-orange-500 border-white/40 shadow-[0_0_12px_rgba(168,85,247,0.6)]'
                      : 'bg-[#150b1a] border-white/30 group-hover:border-white'
                  } border-2 w-4 h-4 rounded-full mt-2 transition-all`}
                ></div>

                {/* Card */}
                <div className="bg-white/[0.04] border border-white/10 rounded-[24px] p-5 md:p-6 shadow-2xl backdrop-blur-xl group-hover:border-white/20 transition-all">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-headline-md text-[17px] font-bold text-white tracking-tight">
                        {record.title}
                      </h4>
                      <p className="font-mono text-[11px] text-white/40 mt-1">
                        {record.date} • {record.doctor}
                      </p>
                    </div>

                    <span className="bg-white/10 text-white/90 border border-white/15 px-3 py-1 rounded-full text-[10px] font-mono font-bold tracking-widest uppercase">
                      {record.badgeLabel}
                    </span>
                  </div>

                  <p className="font-['Inter'] text-[14px] text-white/70 leading-relaxed">
                    {record.summary}
                  </p>

                  {/* Actions depending on record type */}
                  {record.hasReport && (
                    <div className="mt-4 flex gap-2">
                      <button
                        onClick={() => onOpenReportModal(record)}
                        style={{ backgroundColor: '#524343' }}
                        className="inline-flex items-center gap-2 hover:bg-[#635353] text-white px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer border border-white/15 hover:scale-105"
                      >
                        <span className="material-symbols-outlined text-[16px] text-purple-300">
                          visibility
                        </span>
                        View Report
                      </button>
                    </div>
                  )}

                  {record.hasLabResults && (
                    <div className="mt-4 flex gap-2">
                      <button
                        onClick={() => onOpenLabResultsModal(record)}
                        className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer border border-white/15 hover:scale-105"
                      >
                        <span className="material-symbols-outlined text-[16px] text-orange-300">
                          science
                        </span>
                        Lab Results
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {filteredHistory.length === 0 && (
            <div className="bg-white/5 p-8 rounded-2xl border border-white/10 text-center text-sm text-white/40">
              No {filterType} records found for this patient.
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
