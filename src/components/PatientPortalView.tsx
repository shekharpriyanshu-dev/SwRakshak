import React, { useState } from 'react';
import {
  Patient,
  ClinicalRecord,
  PatientSection,
  VitalTrendPoint,
  UploadedLabTest,
  DoctorProfile,
  VideoConsultationSession,
} from '../types';
import { MealPlannerView } from './MealPlannerView';
import { MedicineAlarmView } from './MedicineAlarmView';
import { MedicineSearchView } from './MedicineSearchView';
import { VitalsTrendsChart } from './VitalsTrendsChart';
import { LabUploadView } from './LabUploadView';
import { VideoConsultationModal } from './VideoConsultationModal';

interface PatientPortalViewProps {
  patient: Patient;
  currentDoctor?: DoctorProfile;
  onOpenReportModal: (record: ClinicalRecord) => void;
  onOpenLabResultsModal: (record: ClinicalRecord) => void;
  onSwitchToDoctorLogin: () => void;
  onUpdatePatientVitals?: (updatedVitalsHistory: VitalTrendPoint[]) => void;
  onUpdatePatientTests?: (updatedTests: UploadedLabTest[]) => void;
  onCompleteConsultation?: (session: VideoConsultationSession) => void;
  showToast: (msg: string) => void;
}

export const PatientPortalView: React.FC<PatientPortalViewProps> = ({
  patient,
  currentDoctor,
  onOpenReportModal,
  onOpenLabResultsModal,
  onSwitchToDoctorLogin,
  onUpdatePatientVitals,
  onUpdatePatientTests,
  onCompleteConsultation,
  showToast,
}) => {
  const [activeSection, setActiveSection] = useState<PatientSection>('overview');
  const [selectedRecordType, setSelectedRecordType] = useState<string>('ALL');
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  const filteredHistory = patient.clinicalHistory.filter((rec) => {
    if (selectedRecordType === 'ALL') return true;
    return rec.type === selectedRecordType;
  });

  const handleDownloadHealthCard = () => {
    showToast(`Generating Digital Health Summary for ${patient.name}...`);
    setTimeout(() => {
      window.print();
    }, 500);
  };

  return (
    <div className="flex-grow w-full max-w-6xl mx-auto px-4 py-4 md:py-8 pb-32 md:pb-16 space-y-6">
      {/* Patient Welcome Header Banner */}
      <section className="bg-gradient-to-r from-purple-950/70 via-[#150a1c] to-orange-950/40 border border-white/15 rounded-[28px] p-6 md:p-8 shadow-2xl backdrop-blur-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-56 h-56 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-purple-600 to-orange-400 p-0.5 shadow-[0_0_25px_rgba(168,85,247,0.4)] shrink-0">
              <div className="w-full h-full rounded-[14px] overflow-hidden bg-[#0a050b] flex items-center justify-center">
                {patient.avatarUrl ? (
                  <img
                    src={patient.avatarUrl}
                    alt={patient.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-2xl font-bold font-mono text-purple-300">
                    {patient.initials || patient.name.slice(0, 2).toUpperCase()}
                  </span>
                )}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="font-headline-lg text-2xl md:text-3xl font-bold text-white tracking-tight">
                  {patient.name}
                </h1>
                <span className="px-3 py-1 rounded-full text-[11px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  PATIENT ACCESS ACTIVE
                </span>
              </div>

              <div className="flex flex-wrap gap-x-5 gap-y-1 mt-2 text-xs font-mono text-white/60">
                <span className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-purple-300">badge</span>
                  Patient ID: <strong className="text-white">{patient.id}</strong>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-purple-300">calendar_today</span>
                  DOB: {patient.dob} ({patient.age} years)
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-orange-300">bloodtype</span>
                  Blood Group: {patient.bloodType}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto justify-end flex-wrap">
            <button
              onClick={() => setIsVideoModalOpen(true)}
              className="px-4 py-2.5 rounded-full bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-mono text-xs font-bold uppercase tracking-wider shadow-lg shadow-cyan-900/40 hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[17px]">videocam</span>
              Video Call Doctor
            </button>
            <button
              onClick={() => setActiveSection('lab-upload')}
              className="px-4 py-2.5 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-mono text-xs font-bold uppercase tracking-wider shadow-lg shadow-purple-900/40 hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[17px]">upload_file</span>
              Upload Lab Test
            </button>
            <button
              onClick={handleDownloadHealthCard}
              className="px-3.5 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white font-mono text-xs font-bold uppercase tracking-wider border border-white/20 flex items-center gap-1.5 transition-all cursor-pointer shadow-md hover:scale-105"
            >
              <span className="material-symbols-outlined text-[16px]">print</span>
              Print Card
            </button>
            <button
              onClick={onSwitchToDoctorLogin}
              className="px-3.5 py-2.5 rounded-full bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 border border-purple-400/30 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer hover:scale-105"
            >
              <span className="material-symbols-outlined text-[16px]">medical_services</span>
              Doctor Login
            </button>
          </div>
        </div>

        {/* Assigned Doctor & Care Team Banner */}
        <div className="mt-6 pt-5 border-t border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="bg-white/5 p-3.5 rounded-2xl border border-white/10">
            <span className="text-white/40 block text-[10px] font-mono font-bold uppercase tracking-wider mb-1">
              Primary Treating Doctor
            </span>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-purple-300 text-[18px]">stethoscope</span>
                <span className="font-bold text-white text-sm">
                  {patient.assignedDoctorName || 'Dr. Rajesh Sharma'}
                </span>
              </div>
              <button
                onClick={() => setIsVideoModalOpen(true)}
                className="text-[11px] font-mono font-bold text-cyan-300 hover:text-cyan-200 flex items-center gap-0.5"
              >
                <span className="material-symbols-outlined text-[14px]">videocam</span>
                Call Now
              </button>
            </div>
          </div>

          <div className="bg-white/5 p-3.5 rounded-2xl border border-white/10">
            <span className="text-white/40 block text-[10px] font-mono font-bold uppercase tracking-wider mb-1">
              Allergies & Sensitivities
            </span>
            <div className="flex items-center gap-1.5 flex-wrap">
              {patient.allergies && patient.allergies.length > 0 ? (
                patient.allergies.map((allergy, i) => (
                  <span
                    key={i}
                    className="bg-rose-500/20 border border-rose-500/30 text-rose-300 px-2 py-0.5 rounded-md font-mono text-[10px] font-bold"
                  >
                    {allergy}
                  </span>
                ))
              ) : (
                <span className="text-white/70 font-mono">No known drug allergies</span>
              )}
            </div>
          </div>

          <div className="bg-white/5 p-3.5 rounded-2xl border border-white/10">
            <span className="text-white/40 block text-[10px] font-mono font-bold uppercase tracking-wider mb-1">
              Telehealth & Remote Care
            </span>
            <div className="flex items-center gap-2 text-emerald-300 font-mono font-semibold">
              <span className="material-symbols-outlined text-[18px]">verified_user</span>
              <span>Encrypted Doctor Connect</span>
            </div>
          </div>
        </div>
      </section>

      {/* Navigation Tabs Bar */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-3 overflow-x-auto">
        <button
          onClick={() => setActiveSection('overview')}
          className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap border flex items-center gap-1.5 ${
            activeSection === 'overview'
              ? 'bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.2)]'
              : 'bg-white/5 text-white/60 hover:text-white border-white/10'
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">monitor_heart</span>
          My Health & Vitals
        </button>

        <button
          onClick={() => setActiveSection('lab-upload')}
          className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap border flex items-center gap-1.5 ${
            activeSection === 'lab-upload'
              ? 'bg-gradient-to-r from-purple-600 via-indigo-600 to-orange-500 text-white border-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.4)]'
              : 'bg-purple-500/10 text-purple-300 hover:bg-purple-500/20 border-purple-500/30'
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">upload_file</span>
          Upload Lab Tests 🧪
        </button>

        <button
          onClick={() => setIsVideoModalOpen(true)}
          className="px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap border flex items-center gap-1.5 bg-cyan-600/20 text-cyan-300 hover:bg-cyan-600/30 border-cyan-500/40"
        >
          <span className="material-symbols-outlined text-[16px]">videocam</span>
          Live Video Consult 📹
        </button>

        <button
          onClick={() => setActiveSection('vitals-trends')}
          className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap border flex items-center gap-1.5 ${
            activeSection === 'vitals-trends'
              ? 'bg-gradient-to-r from-purple-600 via-indigo-600 to-orange-500 text-white border-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.4)]'
              : 'bg-purple-500/10 text-purple-300 hover:bg-purple-500/20 border-purple-500/30'
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">timeline</span>
          Vitals Trends 📈
        </button>

        <button
          onClick={() => setActiveSection('suggestions')}
          className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap border flex items-center gap-1.5 ${
            activeSection === 'suggestions'
              ? 'bg-gradient-to-r from-purple-600 to-orange-500 text-white border-white/30 shadow-[0_0_15px_rgba(168,85,247,0.4)]'
              : 'bg-white/5 text-white/60 hover:text-white border-white/10'
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">tips_and_updates</span>
          Doctor Suggestions ({patient.doctorSuggestions?.length || 0})
        </button>

        <button
          onClick={() => setActiveSection('alarms')}
          className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap border flex items-center gap-1.5 ${
            activeSection === 'alarms'
              ? 'bg-purple-600 text-white border-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.4)]'
              : 'bg-purple-500/10 text-purple-300 hover:bg-purple-500/20 border-purple-500/30'
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">alarm</span>
          Medicine Alarms ⏰
        </button>

        <button
          onClick={() => setActiveSection('meals')}
          className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap border flex items-center gap-1.5 ${
            activeSection === 'meals'
              ? 'bg-emerald-600 text-white border-emerald-400 shadow-[0_0_15px_rgba(160,185,129,0.4)]'
              : 'bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20 border-emerald-500/30'
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">restaurant_menu</span>
          Meal Suggestion Chart 🥗
        </button>

        <button
          onClick={() => setActiveSection('medicine-search')}
          className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap border flex items-center gap-1.5 ${
            activeSection === 'medicine-search'
              ? 'bg-blue-600 text-white border-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.4)]'
              : 'bg-blue-500/10 text-blue-300 hover:bg-blue-500/20 border-blue-500/30'
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">search</span>
          Search Medicines 🔍
        </button>

        <button
          onClick={() => setActiveSection('medications')}
          className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap border flex items-center gap-1.5 ${
            activeSection === 'medications'
              ? 'bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.2)]'
              : 'bg-white/5 text-white/60 hover:text-white border-white/10'
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">prescriptions</span>
          Prescriptions ({patient.medications?.length || 0})
        </button>

        <button
          onClick={() => setActiveSection('records')}
          className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap border flex items-center gap-1.5 ${
            activeSection === 'records'
              ? 'bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.2)]'
              : 'bg-white/5 text-white/60 hover:text-white border-white/10'
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">clinical_notes</span>
          Diagnostic Reports ({patient.clinicalHistory.length})
        </button>
      </div>

      {/* SECTION 1: HEALTH OVERVIEW & VITALS */}
      {activeSection === 'overview' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Quick Shortcuts Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
            {/* Lab Upload Shortcut */}
            <div
              onClick={() => setActiveSection('lab-upload')}
              className="bg-gradient-to-br from-purple-950/60 via-[#180a26] to-transparent border border-purple-500/30 hover:border-purple-400/70 rounded-2xl p-4 cursor-pointer transition-all hover:scale-[1.02] shadow-xl group"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[22px]">upload_file</span>
                </div>
                <span className="text-[10px] font-mono text-purple-300 bg-purple-500/20 px-2 py-0.5 rounded-full border border-purple-500/30">
                  NEW
                </span>
              </div>
              <h4 className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors">
                Upload Lab Test
              </h4>
              <p className="text-[11px] text-white/60 mt-0.5">
                Send home blood & radiology reports to doctor for review.
              </p>
            </div>

            {/* Video Call Shortcut */}
            <div
              onClick={() => setIsVideoModalOpen(true)}
              className="bg-gradient-to-br from-cyan-950/60 via-[#071926] to-transparent border border-cyan-500/30 hover:border-cyan-400/70 rounded-2xl p-4 cursor-pointer transition-all hover:scale-[1.02] shadow-xl group"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-300 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[22px]">videocam</span>
                </div>
                <span className="text-[10px] font-mono text-cyan-300 bg-cyan-500/20 px-2 py-0.5 rounded-full border border-cyan-500/30">
                  LIVE
                </span>
              </div>
              <h4 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                Video Call Doctor
              </h4>
              <p className="text-[11px] text-white/60 mt-0.5">
                Instant encrypted HD video conferencing with Dr. Sharma.
              </p>
            </div>

            {/* Alarm Shortcut */}
            <div
              onClick={() => setActiveSection('alarms')}
              className="bg-gradient-to-br from-purple-950/40 via-[#180a22] to-transparent border border-purple-500/20 hover:border-purple-400/50 rounded-2xl p-4 cursor-pointer transition-all hover:scale-[1.02] shadow-xl group"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[22px]">alarm</span>
                </div>
                <span className="text-[10px] font-mono text-purple-300 bg-purple-500/20 px-2 py-0.5 rounded-full border border-purple-500/30">
                  ALARM
                </span>
              </div>
              <h4 className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors">
                Medicine Alarms
              </h4>
              <p className="text-[11px] text-white/60 mt-0.5">
                Scheduled reminders with audio chimes for timely medicine.
              </p>
            </div>

            {/* Meal Chart Shortcut */}
            <div
              onClick={() => setActiveSection('meals')}
              className="bg-gradient-to-br from-emerald-950/40 via-[#0a1e16] to-transparent border border-emerald-500/20 hover:border-emerald-400/50 rounded-2xl p-4 cursor-pointer transition-all hover:scale-[1.02] shadow-xl group"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[22px]">restaurant_menu</span>
                </div>
                <span className="text-[10px] font-mono text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  DIET
                </span>
              </div>
              <h4 className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors">
                Meal Suggestion Chart
              </h4>
              <p className="text-[11px] text-white/60 mt-0.5">
                Indian meal schedule, hydration tracker, do's & don'ts.
              </p>
            </div>

            {/* Search Box Shortcut */}
            <div
              onClick={() => setActiveSection('medicine-search')}
              className="bg-gradient-to-br from-blue-950/40 via-[#0b1626] to-transparent border border-blue-500/20 hover:border-blue-400/50 rounded-2xl p-4 cursor-pointer transition-all hover:scale-[1.02] shadow-xl group"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-300 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[22px]">search</span>
                </div>
                <span className="text-[10px] font-mono text-blue-300 bg-blue-500/20 px-2 py-0.5 rounded-full border border-blue-500/30">
                  SEARCH
                </span>
              </div>
              <h4 className="text-sm font-bold text-white group-hover:text-blue-300 transition-colors">
                Medicine Guide
              </h4>
              <p className="text-[11px] text-white/60 mt-0.5">
                Look up uses, best timings, precautions & side effects.
              </p>
            </div>
          </div>

          {/* Vitals Trends Recharts Visualizer */}
          <VitalsTrendsChart
            patient={patient}
            onUpdatePatientVitals={onUpdatePatientVitals}
            showToast={showToast}
          />

          {/* Latest Vitals Grid */}
          <section className="bg-white/[0.04] border border-white/10 rounded-[24px] p-6 shadow-2xl backdrop-blur-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-['Inter'] text-xs font-bold text-white/50 uppercase tracking-[0.2em] flex items-center gap-2">
                <span className="material-symbols-outlined text-purple-300 text-[18px]">monitor_heart</span>
                YOUR RECORDED HEALTH METRICS
              </h2>
              <span className="text-xs font-mono text-emerald-400 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                Vitals Updated
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {/* BP */}
              <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                <span className="text-xs text-white/60 font-medium block">Blood Pressure</span>
                <div className="flex items-baseline gap-1 my-1">
                  <span className="text-2xl font-bold font-mono text-white">{patient.vitals.bloodPressure.value}</span>
                  <span className="text-xs font-mono text-white/40">{patient.vitals.bloodPressure.unit}</span>
                </div>
                <p className="text-[11px] text-emerald-300 font-semibold flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">check_circle</span>
                  {patient.vitals.bloodPressure.status}
                </p>
              </div>

              {/* Heart Rate */}
              <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                <span className="text-xs text-white/60 font-medium block">Heart Rate</span>
                <div className="flex items-baseline gap-1 my-1">
                  <span className="text-2xl font-bold font-mono text-white">{patient.vitals.heartRate.value}</span>
                  <span className="text-xs font-mono text-white/40">{patient.vitals.heartRate.unit}</span>
                </div>
                <p className="text-[11px] text-white/50 font-medium">{patient.vitals.heartRate.status}</p>
              </div>

              {/* SpO2 */}
              <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                <span className="text-xs text-white/60 font-medium block">Oxygen Saturation</span>
                <div className="flex items-baseline gap-1 my-1">
                  <span className="text-2xl font-bold font-mono text-cyan-300">{patient.vitals.spO2.value}</span>
                  <span className="text-xs font-mono text-white/40">{patient.vitals.spO2.unit}</span>
                </div>
                <p className="text-[11px] text-emerald-300 font-medium">{patient.vitals.spO2.condition}</p>
              </div>

              {/* Weight */}
              <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                <span className="text-xs text-white/60 font-medium block">Body Weight</span>
                <div className="flex items-baseline gap-1 my-1">
                  <span className="text-2xl font-bold font-mono text-orange-200">{patient.vitals.weight.value}</span>
                  <span className="text-xs font-mono text-white/40">{patient.vitals.weight.unit}</span>
                </div>
                <p className="text-[11px] text-white/50 font-medium">{patient.vitals.weight.change}</p>
              </div>
            </div>
          </section>

          {/* Highlights: Top Doctor Suggestion & Next Action */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Top Doctor Advice */}
            <div className="bg-gradient-to-br from-purple-950/40 via-white/[0.04] to-transparent border border-purple-500/20 rounded-[24px] p-6 shadow-xl backdrop-blur-xl">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-headline-md text-base font-bold text-white flex items-center gap-2">
                  <span className="material-symbols-outlined text-purple-300">medical_information</span>
                  Latest Doctor Care Advice
                </h3>
                <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  {patient.doctorSuggestions?.[0]?.category || 'General'}
                </span>
              </div>

              {patient.doctorSuggestions && patient.doctorSuggestions.length > 0 ? (
                <div>
                  <p className="text-sm text-white/90 leading-relaxed bg-white/5 p-4 rounded-2xl border border-white/10">
                    "{patient.doctorSuggestions[0].suggestion}"
                  </p>
                  <div className="flex items-center justify-between mt-3 text-xs font-mono text-white/50">
                    <span>— {patient.doctorSuggestions[0].doctorName}</span>
                    <span>{patient.doctorSuggestions[0].date}</span>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-white/40 italic p-4">No doctor suggestions logged yet.</p>
              )}
            </div>

            {/* Active Prescriptions Quick View */}
            <div className="bg-gradient-to-br from-orange-950/40 via-white/[0.04] to-transparent border border-orange-500/20 rounded-[24px] p-6 shadow-xl backdrop-blur-xl">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-headline-md text-base font-bold text-white flex items-center gap-2">
                  <span className="material-symbols-outlined text-orange-300">medication</span>
                  Current Prescribed Medications
                </h3>
                <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-orange-500/20 text-orange-200 border border-orange-500/30">
                  {patient.medications?.length || 0} ACTIVE
                </span>
              </div>

              {patient.medications && patient.medications.length > 0 ? (
                <div className="space-y-2">
                  {patient.medications.slice(0, 2).map((med) => (
                    <div key={med.id} className="bg-white/5 p-3 rounded-xl border border-white/10 flex items-center justify-between">
                      <div>
                        <p className="font-bold text-white text-sm">{med.name}</p>
                        <p className="text-xs text-white/60 font-mono mt-0.5">{med.dosage} • {med.frequency}</p>
                      </div>
                      <span className="text-[11px] font-mono text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded-full">
                        {med.status}
                      </span>
                    </div>
                  ))}
                  {patient.medications.length > 2 && (
                    <button
                      onClick={() => setActiveSection('medications')}
                      className="text-xs text-orange-300 hover:underline font-mono pt-1 block"
                    >
                      + View {patient.medications.length - 2} more prescriptions →
                    </button>
                  )}
                </div>
              ) : (
                <p className="text-sm text-white/40 italic p-4">No active prescriptions on file.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SECTION: LAB TEST UPLOADS & REMOTE DOCTOR REVIEWS */}
      {activeSection === 'lab-upload' && (
        <div className="space-y-6 animate-fadeIn">
          <LabUploadView
            patient={patient}
            currentDoctor={currentDoctor}
            isDoctorMode={false}
            onUpdatePatientTests={onUpdatePatientTests}
            onStartVideoConsult={() => setIsVideoModalOpen(true)}
            showToast={showToast}
          />
        </div>
      )}

      {/* SECTION: DEDICATED VITALS TRENDS & CHARTS */}
      {activeSection === 'vitals-trends' && (
        <div className="space-y-6 animate-fadeIn">
          <VitalsTrendsChart
            patient={patient}
            onUpdatePatientVitals={onUpdatePatientVitals}
            showToast={showToast}
          />
        </div>
      )}

      {/* SECTION 2: DOCTOR SUGGESTIONS */}
      {activeSection === 'suggestions' && (
        <section className="space-y-4 animate-fadeIn">
          <div className="bg-white/[0.04] border border-white/10 rounded-[24px] p-6 shadow-2xl backdrop-blur-xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-headline-md text-lg font-bold text-white">
                  Doctor Suggestions & Care Instructions
                </h2>
                <p className="text-xs font-mono text-white/50 mt-0.5">
                  Guidance, dietary instructions, and follow-up advice given by your hospital medical team
                </p>
              </div>
              <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-mono font-bold">
                {patient.doctorSuggestions?.length || 0} Suggestions
              </span>
            </div>

            {patient.doctorSuggestions && patient.doctorSuggestions.length > 0 ? (
              <div className="space-y-4">
                {patient.doctorSuggestions.map((sug) => (
                  <div
                    key={sug.id}
                    className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/[0.08] transition-all space-y-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 rounded-full text-[11px] font-mono font-bold uppercase tracking-wider bg-purple-500/20 text-purple-200 border border-purple-500/30">
                          {sug.category}
                        </span>
                        {sug.priority === 'Immediate' && (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/30">
                            Immediate Attention
                          </span>
                        )}
                        {sug.priority === 'High' && (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            Important
                          </span>
                        )}
                      </div>
                      <span className="text-xs font-mono text-white/40">{sug.date}</span>
                    </div>

                    <p className="text-sm text-white/90 leading-relaxed font-sans pl-1">
                      {sug.suggestion}
                    </p>

                    <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs font-mono text-white/60">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-purple-300 text-[16px]">verified</span>
                        <span>{sug.doctorName} • {sug.doctorTitle}</span>
                      </div>
                      <span className="text-[11px] text-white/40">Verified Clinical Advice</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white/5 p-8 rounded-2xl border border-white/10 text-center text-sm text-white/50">
                No clinical suggestions have been recorded for your profile yet.
              </div>
            )}
          </div>
        </section>
      )}

      {/* SECTION 3: MEDICINE ALARMS */}
      {activeSection === 'alarms' && (
        <MedicineAlarmView patient={patient} showToast={showToast} />
      )}

      {/* SECTION 4: MEAL SUGGESTION CHART */}
      {activeSection === 'meals' && (
        <MealPlannerView patient={patient} showToast={showToast} />
      )}

      {/* SECTION 5: MEDICINE KNOWLEDGE SEARCH */}
      {activeSection === 'medicine-search' && (
        <MedicineSearchView
          patient={patient}
          onSetReminderForMed={(name, strength, time) => {
            setActiveSection('alarms');
            showToast(`Redirected to Alarms to configure reminder for ${name} (${strength})!`);
          }}
          showToast={showToast}
        />
      )}

      {/* SECTION 6: MEDICATIONS & PRESCRIPTIONS */}
      {activeSection === 'medications' && (
        <section className="space-y-4 animate-fadeIn">
          <div className="bg-white/[0.04] border border-white/10 rounded-[24px] p-6 shadow-2xl backdrop-blur-xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-headline-md text-lg font-bold text-white">
                  Prescriptions & Medication Schedule
                </h2>
                <p className="text-xs font-mono text-white/50 mt-0.5">
                  Authorized prescriptions with recommended dosages and intake instructions
                </p>
              </div>
              <span className="px-3 py-1 rounded-full bg-orange-500/20 text-orange-200 border border-orange-500/30 text-xs font-mono font-bold">
                {patient.medications?.length || 0} Medications
              </span>
            </div>

            {patient.medications && patient.medications.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {patient.medications.map((med) => (
                  <div
                    key={med.id}
                    className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/[0.08] transition-all space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-bold text-white text-base">{med.name}</h3>
                        <p className="text-xs font-mono text-orange-300 mt-0.5">{med.dosage}</p>
                      </div>
                      <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase">
                        {med.status}
                      </span>
                    </div>

                    <div className="bg-black/30 p-3 rounded-xl border border-white/10 text-xs space-y-1 font-mono">
                      <p className="text-white/80">
                        <strong className="text-purple-300">Frequency:</strong> {med.frequency}
                      </p>
                      <p className="text-white/80">
                        <strong className="text-purple-300">Instructions:</strong> {med.instructions}
                      </p>
                    </div>

                    <div className="text-[11px] font-mono text-white/40 flex justify-between items-center pt-2 border-t border-white/10">
                      <span>Prescribed by {med.prescribedBy}</span>
                      <span>Since {med.startDate}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white/5 p-8 rounded-2xl border border-white/10 text-center text-sm text-white/50">
                No active medications currently registered on file.
              </div>
            )}
          </div>
        </section>
      )}

      {/* SECTION 7: DIAGNOSTIC & LAB REPORTS */}
      {activeSection === 'records' && (
        <section className="space-y-4 animate-fadeIn">
          <div className="bg-white/[0.04] border border-white/10 rounded-[24px] p-6 shadow-2xl backdrop-blur-xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
              <div>
                <h2 className="font-headline-md text-lg font-bold text-white">
                  My Diagnostic & Lab Scans
                </h2>
                <p className="text-xs font-mono text-white/50 mt-0.5">
                  Detailed summaries of your medical imaging, blood tests, and outpatient consultations
                </p>
              </div>

              {/* Filter pills */}
              <div className="flex items-center gap-1.5 bg-white/5 p-1 rounded-full border border-white/10">
                {['ALL', 'MRI', 'BLOOD', 'CLINIC'].map((type) => (
                  <button
                    key={type}
                    onClick={() => setSelectedRecordType(type)}
                    className={`px-3 py-1 rounded-full text-[11px] font-mono font-bold uppercase transition-all ${
                      selectedRecordType === type
                        ? 'bg-purple-600 text-white shadow-md'
                        : 'text-white/50 hover:text-white'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              {filteredHistory.map((rec) => (
                <div
                  key={rec.id}
                  className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/[0.08] transition-all space-y-3"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-white text-base">{rec.title}</h3>
                      <p className="text-xs font-mono text-white/40 mt-0.5">
                        {rec.date} • {rec.clinicOrLab}
                      </p>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-white/10 text-white/90 border border-white/15">
                      {rec.badgeLabel}
                    </span>
                  </div>

                  <p className="text-sm text-white/80 leading-relaxed font-sans">
                    {rec.summary}
                  </p>

                  <div className="pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
                    <span className="text-xs font-mono text-purple-300">
                      Doctor: {rec.doctor}
                    </span>

                    <div className="flex gap-2">
                      {rec.hasReport && (
                        <button
                          onClick={() => onOpenReportModal(rec)}
                          className="px-4 py-1.5 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 border border-purple-400/30 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-all hover:scale-105"
                        >
                          <span className="material-symbols-outlined text-[16px]">visibility</span>
                          View Imaging Report
                        </button>
                      )}
                      {rec.hasLabResults && (
                        <button
                          onClick={() => onOpenLabResultsModal(rec)}
                          className="px-4 py-1.5 rounded-xl bg-orange-500/20 hover:bg-orange-500/30 text-orange-200 border border-orange-400/30 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-all hover:scale-105"
                        >
                          <span className="material-symbols-outlined text-[16px]">science</span>
                          View Lab Values
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Live Encrypted Video Consultation Modal */}
      <VideoConsultationModal
        isOpen={isVideoModalOpen}
        onClose={() => setIsVideoModalOpen(false)}
        patient={patient}
        currentDoctor={currentDoctor}
        isDoctorMode={false}
        showToast={showToast}
        onCompleteConsultation={onCompleteConsultation}
      />
    </div>
  );
};
