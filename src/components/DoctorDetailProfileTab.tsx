import React, { useState } from 'react';
import { DoctorProfile } from '../types';

interface DoctorDetailProfileTabProps {
  doctor: DoctorProfile;
  allDoctors: DoctorProfile[];
  onSelectDoctor?: (doc: DoctorProfile) => void;
  onBookToken: (doc: DoctorProfile) => void;
  onStartVideoConsult?: (doc: DoctorProfile) => void;
  onUploadLabTest?: () => void;
}

type ProfileSubTab = 'bio' | 'schedule' | 'credentials' | 'reviews';

export const DoctorDetailProfileTab: React.FC<DoctorDetailProfileTabProps> = ({
  doctor,
  allDoctors,
  onSelectDoctor,
  onBookToken,
  onStartVideoConsult,
  onUploadLabTest,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<ProfileSubTab>('bio');
  const [selectedDocId, setSelectedDocId] = useState<string>(doctor.id);

  const currentDoc = allDoctors.find((d) => d.id === selectedDocId) || doctor;

  const handleDocChange = (doc: DoctorProfile) => {
    setSelectedDocId(doc.id);
    if (onSelectDoctor) {
      onSelectDoctor(doc);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Bar: Specialist Selector */}
      <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-4 backdrop-blur-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-purple-400 text-[20px]">group</span>
            <h2 className="text-sm font-bold uppercase tracking-wider text-white">
              SwRakshak Medical Faculty & Specialist Team
            </h2>
          </div>
          <span className="text-[11px] font-mono text-purple-300 bg-purple-900/30 border border-purple-500/30 px-2.5 py-0.5 rounded-full">
            {allDoctors.length} Registered Specialists
          </span>
        </div>

        {/* Doctor Chips Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {allDoctors.map((doc) => {
            const isSelected = doc.id === currentDoc.id;
            return (
              <button
                key={doc.id}
                onClick={() => handleDocChange(doc)}
                className={`flex items-center gap-3 p-2.5 rounded-xl border transition-all text-left cursor-pointer ${
                  isSelected
                    ? 'bg-purple-600/25 border-purple-400 text-white shadow-[0_0_15px_rgba(168,85,247,0.25)]'
                    : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:text-white'
                }`}
              >
                <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-purple-950/60 border border-white/20">
                  {doc.avatarUrl ? (
                    <img src={doc.avatarUrl} alt={doc.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-mono font-bold text-xs text-purple-300">
                      {doc.name.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-xs truncate">{doc.name}</div>
                  <div className="text-[10px] text-white/50 truncate font-mono">{doc.specialty || doc.department}</div>
                </div>
                {isSelected && (
                  <span className="material-symbols-outlined text-purple-300 text-[16px]">check_circle</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Doctor Profile Bento Card */}
      <div className="bg-gradient-to-br from-purple-950/40 via-[#130b1c] to-[#0a050b] border border-white/15 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden backdrop-blur-xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Doctor Header Section */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-6 border-b border-white/10 relative z-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            {/* Avatar */}
            <div className="relative">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border-2 border-purple-400/50 shadow-[0_0_25px_rgba(168,85,247,0.35)] bg-purple-950">
                <img
                  src={currentDoc.avatarUrl}
                  alt={currentDoc.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="absolute -bottom-2 -right-2 bg-emerald-500 text-white text-[10px] font-bold font-mono px-2 py-0.5 rounded-full border-2 border-[#0a050b] flex items-center gap-1 shadow-md">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                ACTIVE OPD
              </span>
            </div>

            {/* Core Info */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight font-headline-lg">
                  {currentDoc.name}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  {currentDoc.employeeId}
                </span>
              </div>

              <div className="text-purple-300 font-semibold text-sm sm:text-base">
                {currentDoc.title}
              </div>

              <div className="text-xs font-mono text-white/60 flex flex-wrap items-center gap-x-4 gap-y-1">
                <span className="flex items-center gap-1 text-white/80">
                  <span className="material-symbols-outlined text-[15px] text-purple-400">local_hospital</span>
                  {currentDoc.department}
                </span>
                <span className="flex items-center gap-1 text-white/80">
                  <span className="material-symbols-outlined text-[15px] text-orange-400">meeting_room</span>
                  {currentDoc.room}
                </span>
                <span className="flex items-center gap-1 text-white/80">
                  <span className="material-symbols-outlined text-[15px] text-amber-400">workspace_premium</span>
                  {currentDoc.experienceYears || 15}+ Yrs Exp
                </span>
              </div>

              {/* Languages & Rating */}
              <div className="flex items-center gap-3 pt-1 flex-wrap">
                <div className="flex items-center gap-1 bg-amber-400/15 border border-amber-400/30 px-2.5 py-0.5 rounded-full text-amber-300 text-xs font-bold font-mono">
                  <span className="material-symbols-outlined text-[14px]">star</span>
                  <span>{currentDoc.rating || 4.9}</span>
                  <span className="text-white/50 text-[10px]">({currentDoc.reviewCount || 350}+ reviews)</span>
                </div>
                <div className="text-[11px] font-mono text-white/60 bg-white/5 px-2.5 py-0.5 rounded-full border border-white/10">
                  🗣️ Languages: <strong className="text-white/90">{currentDoc.language}</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap sm:flex-col gap-2.5 w-full lg:w-auto shrink-0 justify-end">
            <button
              onClick={() => onBookToken(currentDoc)}
              className="flex-1 sm:flex-initial px-5 py-3 rounded-full bg-gradient-to-r from-purple-600 via-indigo-600 to-orange-500 text-white font-mono text-xs font-bold uppercase tracking-wider shadow-lg shadow-purple-900/40 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer border border-white/20"
            >
              <span className="material-symbols-outlined text-[18px]">confirmation_number</span>
              Book Consultation Token
            </button>

            {onStartVideoConsult && (
              <button
                onClick={() => onStartVideoConsult(currentDoc)}
                className="flex-1 sm:flex-initial px-4 py-2.5 rounded-full bg-cyan-950/60 hover:bg-cyan-900/80 text-cyan-300 border border-cyan-500/40 font-mono text-xs font-bold uppercase tracking-wider hover:scale-105 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[17px]">videocam</span>
                Video Call Doctor
              </button>
            )}

            {onUploadLabTest && (
              <button
                onClick={onUploadLabTest}
                className="flex-1 sm:flex-initial px-4 py-2.5 rounded-full bg-white/5 hover:bg-white/10 text-white/80 border border-white/15 font-mono text-xs font-semibold tracking-wider hover:scale-105 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px] text-purple-300">upload_file</span>
                Send Lab Report
              </button>
            )}
          </div>
        </div>

        {/* Doctor Profile Navigation Sub-Tabs */}
        <div className="flex items-center gap-2 pt-6 pb-4 border-b border-white/10 overflow-x-auto">
          <button
            onClick={() => setActiveSubTab('bio')}
            className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap border flex items-center gap-1.5 ${
              activeSubTab === 'bio'
                ? 'bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.2)]'
                : 'bg-white/5 text-white/60 hover:text-white border-white/10'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">person</span>
            Overview & Bio
          </button>

          <button
            onClick={() => setActiveSubTab('schedule')}
            className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap border flex items-center gap-1.5 ${
              activeSubTab === 'schedule'
                ? 'bg-purple-600 text-white border-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.4)]'
                : 'bg-white/5 text-white/60 hover:text-white border-white/10'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">schedule</span>
            OPD Hours & Token Queue
          </button>

          <button
            onClick={() => setActiveSubTab('credentials')}
            className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap border flex items-center gap-1.5 ${
              activeSubTab === 'credentials'
                ? 'bg-indigo-600 text-white border-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.4)]'
                : 'bg-white/5 text-white/60 hover:text-white border-white/10'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">school</span>
            Qualifications & Degrees
          </button>

          <button
            onClick={() => setActiveSubTab('reviews')}
            className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap border flex items-center gap-1.5 ${
              activeSubTab === 'reviews'
                ? 'bg-amber-600 text-white border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.4)]'
                : 'bg-white/5 text-white/60 hover:text-white border-white/10'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">reviews</span>
            Patient Reviews ({currentDoc.reviewCount || 350})
          </button>
        </div>

        {/* SUB-TAB 1: BIO & CLINICAL FOCUS */}
        {activeSubTab === 'bio' && (
          <div className="pt-6 space-y-6 animate-fadeIn">
            {/* Bio Narrative */}
            <div className="bg-white/5 rounded-2xl p-5 border border-white/10">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-purple-300 mb-2 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px]">info</span>
                Clinical Biography & Approach
              </h3>
              <p className="text-white/80 leading-relaxed text-sm sm:text-base font-normal">
                {currentDoc.aboutBio ||
                  `${currentDoc.name} is a senior medical practitioner serving at SwRakshak Multispeciality Center. With extensive diagnostic training and dedication to preventive healthcare, Dr. ${
                    currentDoc.name.split(' ')[1] || 'Specialist'
                  } delivers personalized, patient-centric treatment plans with seamless digital follow-ups.`}
              </p>
            </div>

            {/* Grid: Areas of Clinical Expertise + Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Areas of Expertise */}
              <div className="bg-white/5 rounded-2xl p-5 border border-white/10 space-y-3">
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-300 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px]">verified</span>
                  Specialized Procedures & Clinical Focus
                </h3>
                <div className="space-y-2">
                  {(currentDoc.expertise || [
                    'Specialist Diagnosis & Management',
                    'Outpatient Care & Preventive Screening',
                    'Chronic Condition Follow-up',
                    'Comprehensive Telehealth Consultations',
                  ]).map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2.5 text-xs text-white/90 bg-white/[0.03] p-2.5 rounded-xl border border-white/5"
                    >
                      <span className="material-symbols-outlined text-purple-400 text-[16px]">check_circle</span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Hospital Details & Contact */}
              <div className="bg-white/5 rounded-2xl p-5 border border-white/10 space-y-4">
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-orange-300 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px]">badge</span>
                  Hospital Practice & OPD Wing
                </h3>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="bg-black/30 p-3 rounded-xl border border-white/5">
                    <span className="text-white/40 block text-[10px] font-mono">OPD Location</span>
                    <span className="font-bold text-white text-sm">{currentDoc.room}</span>
                  </div>
                  <div className="bg-black/30 p-3 rounded-xl border border-white/5">
                    <span className="text-white/40 block text-[10px] font-mono">Consultation Fee</span>
                    <span className="font-bold text-emerald-400 text-sm">
                      ₹{currentDoc.consultationFee || 500}
                    </span>
                  </div>
                  <div className="bg-black/30 p-3 rounded-xl border border-white/5">
                    <span className="text-white/40 block text-[10px] font-mono">Emergency Tele-Care</span>
                    <span className="font-bold text-cyan-300 text-sm">Available</span>
                  </div>
                  <div className="bg-black/30 p-3 rounded-xl border border-white/5">
                    <span className="text-white/40 block text-[10px] font-mono">Hospital Helpline</span>
                    <span className="font-bold text-purple-300 text-sm">1800-SWR-CARE</span>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => onBookToken(currentDoc)}
                    className="w-full py-2.5 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 border border-purple-400/40 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">event_available</span>
                    Book Token For {currentDoc.name}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SUB-TAB 2: OPD SCHEDULE & LIVE QUEUE */}
        {activeSubTab === 'schedule' && (
          <div className="pt-6 space-y-6 animate-fadeIn">
            {/* Live OPD Queue Banner */}
            <div className="bg-gradient-to-r from-purple-900/30 to-indigo-900/30 border border-purple-500/30 rounded-2xl p-5">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                    <span className="text-xs font-mono font-bold text-emerald-300 uppercase tracking-wider">
                      Live Hospital OPD Status
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white">
                    {currentDoc.name} — Current OPD Queue
                  </h3>
                  <p className="text-xs text-white/60 mt-0.5">
                    Tokens are called in sequence. Real-time updates automatically sync with patient digital slips.
                  </p>
                </div>

                <div className="flex items-center gap-4 bg-black/40 px-4 py-3 rounded-xl border border-white/10">
                  <div className="text-center">
                    <span className="block text-[10px] font-mono text-white/50 uppercase">Current Token</span>
                    <span className="text-2xl font-bold font-mono text-purple-300">#14</span>
                  </div>
                  <div className="h-8 w-px bg-white/10" />
                  <div className="text-center">
                    <span className="block text-[10px] font-mono text-white/50 uppercase">Next Available</span>
                    <span className="text-2xl font-bold font-mono text-emerald-400">#15</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Weekly Timings Table */}
            <div className="bg-white/5 rounded-2xl p-5 border border-white/10 space-y-3">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-purple-300 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px]">calendar_month</span>
                Consultation Timings & Weekly Slots
              </h3>

              <div className="text-sm font-semibold text-white/90 p-3 bg-black/30 rounded-xl border border-white/5 flex items-center gap-2">
                <span className="material-symbols-outlined text-orange-400 text-[18px]">alarm</span>
                <span>{currentDoc.opdTimings || 'Mon – Sat: 09:30 AM – 01:30 PM | 04:30 PM – 07:30 PM'}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-2">
                <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">Morning Slot (In-Hospital OPD)</span>
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-500/30">
                      Walk-in & Token
                    </span>
                  </div>
                  <p className="text-white/60 text-[11px]">
                    09:30 AM – 01:30 PM (Mon – Sat) • Physical examination, ECG review, and clinical checkups at {currentDoc.room}.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">Evening Slot (Telehealth Video)</span>
                    <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/40 px-2 py-0.5 rounded-full border border-cyan-500/30">
                      Online Video
                    </span>
                  </div>
                  <p className="text-white/60 text-[11px]">
                    04:30 PM – 07:30 PM (Mon – Sat) • Remote video consultation, lab report discussion, and e-prescription refills.
                  </p>
                </div>
              </div>

              {/* Book Token Call to Action */}
              <div className="pt-3">
                <button
                  onClick={() => onBookToken(currentDoc)}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-orange-500 text-white font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer shadow-lg"
                >
                  <span className="material-symbols-outlined text-[18px]">confirmation_number</span>
                  Generate Printable Token For This Slot
                </button>
              </div>
            </div>
          </div>
        )}

        {/* SUB-TAB 3: CREDENTIALS & DEGREES */}
        {activeSubTab === 'credentials' && (
          <div className="pt-6 space-y-6 animate-fadeIn">
            {/* Qualifications Card */}
            <div className="bg-white/5 rounded-2xl p-5 border border-white/10 space-y-3">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-indigo-300 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px]">school</span>
                Medical Education & Degrees
              </h3>

              <div className="space-y-2.5">
                {(currentDoc.education || [
                  `Medical Degree — ${currentDoc.qualifications || 'MBBS, MD'}`,
                  'Registered with National Medical Commission (NMC / State Medical Council)',
                  'Advanced Certification in Telemedicine & Digital Healthcare',
                ]).map((edu, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/5 text-xs"
                  >
                    <span className="material-symbols-outlined text-indigo-400 text-[18px] shrink-0 mt-0.5">
                      workspace_premium
                    </span>
                    <div>
                      <div className="font-semibold text-white/90">{edu}</div>
                      <div className="text-[10px] text-white/50 font-mono">Verified Credential • SwRakshak EHR</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Achievements & Milestones */}
            <div className="bg-white/5 rounded-2xl p-5 border border-white/10 space-y-3">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px]">military_tech</span>
                Clinical Achievements & Accreditations
              </h3>

              <div className="space-y-2">
                {(currentDoc.achievements || [
                  `Over ${currentDoc.patientsCount}+ patients treated with high clinical recovery rate`,
                  'Active Member of Association of Physicians of India',
                  'Leading clinical researcher in evidence-based telemedicine',
                ]).map((ach, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2.5 text-xs text-white/80 p-2.5 rounded-xl bg-white/[0.03] border border-white/5"
                  >
                    <span className="material-symbols-outlined text-amber-400 text-[16px]">stars</span>
                    <span>{ach}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* SUB-TAB 4: PATIENT REVIEWS & RATINGS */}
        {activeSubTab === 'reviews' && (
          <div className="pt-6 space-y-6 animate-fadeIn">
            {/* Ratings Overview Bar */}
            <div className="bg-white/5 rounded-2xl p-5 border border-white/10">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="text-center p-3 rounded-xl bg-amber-400/10 border border-amber-400/30">
                    <span className="text-3xl font-bold font-headline-lg text-amber-300">
                      {currentDoc.rating || 4.9}
                    </span>
                    <span className="block text-[10px] font-mono text-amber-200">OUT OF 5.0</span>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Patient Satisfaction Score</h3>
                    <p className="text-xs text-white/60">
                      Based on {currentDoc.reviewCount || 350}+ verified patient consults on SwRakshak Telehealth & Hospital OPD.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] font-mono w-full sm:w-auto">
                  <div className="bg-black/30 px-3 py-1.5 rounded-lg border border-white/5">
                    <span className="text-white/50">Treatment Outcome: </span>
                    <strong className="text-emerald-300">98%</strong>
                  </div>
                  <div className="bg-black/30 px-3 py-1.5 rounded-lg border border-white/5">
                    <span className="text-white/50">Listening & Empathy: </span>
                    <strong className="text-purple-300">4.9 ★</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Testimonials List */}
            <div className="space-y-3">
              {[
                {
                  patient: 'Ramesh K.',
                  date: 'Aug 24, 2026',
                  comment: `${currentDoc.name} explained my reports in detail and answered every question with great empathy. The digital token system made hospital visit completely painless!`,
                  rating: 5,
                },
                {
                  patient: 'Pooja Verma',
                  date: 'Aug 18, 2026',
                  comment: `The online video consultation was as thorough as an in-person OPD visit. Medication adjustments helped my condition within 48 hours. Highly recommended!`,
                  rating: 5,
                },
                {
                  patient: 'Harpreet Singh',
                  date: 'Jul 30, 2026',
                  comment: `Excellent senior physician. The printable token showed accurate expected time and I was called into the OPD right on schedule.`,
                  rating: 5,
                },
              ].map((rev, i) => (
                <div key={i} className="p-4 rounded-xl bg-white/[0.03] border border-white/5 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-white flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-purple-300 text-[16px]">account_circle</span>
                      {rev.patient}
                    </span>
                    <span className="text-[10px] font-mono text-white/40">{rev.date}</span>
                  </div>
                  <div className="flex items-center text-amber-400 text-[14px]">
                    {'★'.repeat(rev.rating)}
                  </div>
                  <p className="text-xs text-white/70 leading-relaxed italic">
                    "{rev.comment}"
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
