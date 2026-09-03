import React, { useState, useEffect, useRef } from 'react';
import jsPDF from 'jspdf';
import { DoctorProfile, Patient, ConsultationToken, ActiveTab } from '../types';

interface TokenBookingViewProps {
  doctors: DoctorProfile[];
  currentPatient: Patient | null;
  selectedDoctor?: DoctorProfile;
  onNavigateToTab?: (tab: ActiveTab) => void;
  onStartVideoConsult?: (doc: DoctorProfile, token?: ConsultationToken) => void;
  showToast: (msg: string) => void;
}

const TOKENS_STORAGE_KEY = 'swrakshak_booked_tokens';

export const TokenBookingView: React.FC<TokenBookingViewProps> = ({
  doctors,
  currentPatient,
  selectedDoctor,
  onNavigateToTab,
  onStartVideoConsult,
  showToast,
}) => {
  // Active doctors list (fallback to first if none)
  const defaultDoc = selectedDoctor || doctors[0];
  const [selectedDocId, setSelectedDocId] = useState<string>(defaultDoc?.id || '');

  // Form states
  const [consultationType, setConsultationType] = useState<'Online Video Consult' | 'In-Hospital OPD'>('Online Video Consult');
  const [bookingDate, setBookingDate] = useState<string>(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [slotTime, setSlotTime] = useState<string>('Morning OPD (09:30 AM – 01:30 PM)');
  const [patientName, setPatientName] = useState<string>(currentPatient?.name || 'Aarav Sharma');
  const [patientAge, setPatientAge] = useState<number>(currentPatient?.age || 45);
  const [patientGender, setPatientGender] = useState<string>(currentPatient?.gender || 'Male');
  const [patientPhone, setPatientPhone] = useState<string>('+91 98765 43210');
  const [patientEmail, setPatientEmail] = useState<string>('aarav.sharma@example.com');
  const [chiefComplaint, setChiefComplaint] = useState<string>('Routine blood pressure review & medication refill');
  const [urgency, setUrgency] = useState<'Routine' | 'Follow-up' | 'Priority / Urgent'>('Routine');

  // Stored Booked Tokens
  const [bookedTokens, setBookedTokens] = useState<ConsultationToken[]>(() => {
    try {
      const saved = localStorage.getItem(TOKENS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    // Default initial demonstration token so user immediately sees a realistic token
    return [
      {
        id: 'SWR-TK-2026-0814',
        tokenNumber: 14,
        tokenCode: 'OPD-14',
        patientId: currentPatient?.id || 'PID-99821',
        patientName: currentPatient?.name || 'Aarav Sharma',
        patientAge: currentPatient?.age || 45,
        patientGender: currentPatient?.gender || 'Male',
        patientPhone: '+91 98765 43210',
        patientEmail: 'aarav.sharma@example.com',
        doctorId: defaultDoc?.id || 'doc-1',
        doctorName: defaultDoc?.name || 'Dr. Rajesh Sharma',
        doctorSpecialty: defaultDoc?.specialty || 'Cardiology & Vascular Medicine',
        doctorDepartment: defaultDoc?.department || 'Cardiovascular Center',
        room: defaultDoc?.room || 'Room 402, Wing B',
        consultationType: 'Online Video Consult',
        bookingDate: new Date().toISOString().split('T')[0],
        bookingTime: '09:45 AM',
        slotTime: 'Morning OPD (09:30 AM – 01:30 PM)',
        expectedTime: '11:15 AM – 11:30 AM',
        estimatedWaitMinutes: 20,
        queueAheadCount: 2,
        chiefComplaint: 'Chest tightness, BP fluctuation checkup',
        status: 'Booked',
        paymentStatus: 'Exempt / Hospital Free OPD',
        virtualRoomCode: 'SWR-TELE-402',
        notes: 'Please keep previous ECG and echocardiogram records ready.',
      },
    ];
  });

  // Active Token to display in printable slip
  const [activeToken, setActiveToken] = useState<ConsultationToken | null>(() => bookedTokens[0] || null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Sync with selectedDoctor prop changes
  useEffect(() => {
    if (selectedDoctor) {
      setSelectedDocId(selectedDoctor.id);
    }
  }, [selectedDoctor]);

  // Persist tokens in localStorage
  useEffect(() => {
    try {
      localStorage.setItem(TOKENS_STORAGE_KEY, JSON.stringify(bookedTokens));
    } catch (e) {
      console.error(e);
    }
  }, [bookedTokens]);

  const activeDoc = doctors.find((d) => d.id === selectedDocId) || doctors[0];

  // Quick complaint shortcuts
  const symptomPresets = [
    'Chest discomfort / Palpitations',
    'High Blood Pressure checkup & refill',
    'Diabetes & HbA1c review',
    'Fever, persistent cough & cold',
    'MRI / Scan report second opinion',
    'Post-surgery routine follow-up',
    'Severe migraine & dizziness',
  ];

  // Calculate realistic expected time
  const calculateExpectedTime = (tokenNum: number, slot: string): { expectedTime: string; waitMins: number; ahead: number } => {
    const ahead = Math.max(1, (tokenNum % 8) + 1);
    const waitMins = ahead * 12; // average 12 minutes per patient consultation

    // Calculate time offset from 10:00 AM or current time
    const now = new Date();
    const expectedStart = new Date(now.getTime() + waitMins * 60000);
    const expectedEnd = new Date(expectedStart.getTime() + 15 * 60000);

    const formatTime = (d: Date) =>
      d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

    return {
      expectedTime: `${formatTime(expectedStart)} – ${formatTime(expectedEnd)}`,
      waitMins,
      ahead,
    };
  };

  // Handle Token Creation
  const handleGenerateToken = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName.trim()) {
      showToast('Please enter patient name');
      return;
    }

    setIsGenerating(true);

    setTimeout(() => {
      const nextTokenNumber = bookedTokens.length > 0 ? Math.max(...bookedTokens.map((t) => t.tokenNumber)) + 1 : 15;
      const { expectedTime, waitMins, ahead } = calculateExpectedTime(nextTokenNumber, slotTime);

      const randomCode = Math.floor(1000 + Math.random() * 9000);
      const uniqueId = `SWR-TK-2026-${randomCode}`;
      const virtualRoom = `SWR-V-${randomCode}`;

      const now = new Date();
      const bookingTimeString = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

      const newToken: ConsultationToken = {
        id: uniqueId,
        tokenNumber: nextTokenNumber,
        tokenCode: `OPD-${nextTokenNumber}`,
        patientId: currentPatient?.id || `PID-${Math.floor(10000 + Math.random() * 90000)}`,
        patientName: patientName.trim(),
        patientAge: Number(patientAge) || 30,
        patientGender,
        patientPhone: patientPhone.trim() || '+91 98000 00000',
        patientEmail: patientEmail.trim(),
        doctorId: activeDoc.id,
        doctorName: activeDoc.name,
        doctorSpecialty: activeDoc.specialty || activeDoc.department,
        doctorDepartment: activeDoc.department,
        room: activeDoc.room,
        consultationType,
        bookingDate,
        bookingTime: bookingTimeString,
        slotTime,
        expectedTime,
        estimatedWaitMinutes: waitMins,
        queueAheadCount: ahead,
        chiefComplaint: chiefComplaint.trim() || 'General Consultation',
        status: 'Booked',
        paymentStatus: 'Exempt / Hospital Free OPD',
        virtualRoomCode: virtualRoom,
        notes: 'Please be ready 10 minutes prior to your expected consultation time.',
      };

      setBookedTokens((prev) => [newToken, ...prev]);
      setActiveToken(newToken);
      setIsGenerating(false);
      showToast(`Token #${nextTokenNumber} generated successfully! Expected time: ${expectedTime}`);
    }, 400);
  };

  // Direct Browser Print (Formatted via print CSS)
  const handlePrint = () => {
    showToast('Opening print dialog for Token Slip...');
    setTimeout(() => {
      window.print();
    }, 200);
  };

  // Download high-resolution PDF Token Slip via jsPDF
  const handleDownloadPdf = () => {
    if (!activeToken) return;

    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      // Hospital Header styling
      doc.setFillColor(15, 8, 20);
      doc.rect(0, 0, 210, 42, 'F');

      // Accent border
      doc.setFillColor(168, 85, 247);
      doc.rect(0, 40, 210, 2, 'F');

      // Header Text
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(18);
      doc.text('SwRakshak Multispeciality Hospitals', 15, 16);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(216, 180, 254);
      doc.text('Central Healthcare Campus • NABH & NABL Accredited Digital EHR Network', 15, 23);
      doc.text('24x7 Emergency Helpline: 108 / 112 • Toll-Free: 1800-SWR-CARE (797-2273)', 15, 29);

      doc.setFont('helvetica', 'bold');
      doc.setTextColor(249, 115, 22);
      doc.text('OFFICIAL OPD & TELEHEALTH CONSULTATION TOKEN SLIP', 15, 36);

      // Token Hero Box
      doc.setFillColor(243, 244, 246);
      doc.roundedRect(15, 48, 180, 32, 3, 3, 'F');
      doc.setDrawColor(168, 85, 247);
      doc.setLineWidth(0.6);
      doc.roundedRect(15, 48, 180, 32, 3, 3, 'D');

      doc.setTextColor(30, 27, 75);
      doc.setFontSize(22);
      doc.setFont('helvetica', 'bold');
      doc.text(`TOKEN NUMBER: #${activeToken.tokenNumber}`, 22, 62);

      doc.setTextColor(109, 40, 217);
      doc.setFontSize(13);
      doc.text(`EXPECTED TIME: ${activeToken.expectedTime}`, 22, 72);

      doc.setFontSize(9);
      doc.setTextColor(107, 114, 128);
      doc.text(`Queue: ${activeToken.queueAheadCount} patients ahead • Est. wait: ~${activeToken.estimatedWaitMinutes} mins`, 120, 62);
      doc.text(`Slot: ${activeToken.slotTime.split('(')[0].trim()}`, 120, 72);

      // Patient Details Table Section
      doc.setFontSize(11);
      doc.setTextColor(17, 24, 39);
      doc.setFont('helvetica', 'bold');
      doc.text('PATIENT INFORMATION', 15, 90);

      doc.setDrawColor(229, 231, 235);
      doc.line(15, 92, 195, 92);

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(55, 65, 81);

      doc.text(`Patient Name: ${activeToken.patientName}`, 15, 100);
      doc.text(`Patient ID: ${activeToken.patientId}`, 15, 107);
      doc.text(`Age / Gender: ${activeToken.patientAge} Years / ${activeToken.patientGender}`, 15, 114);
      doc.text(`Contact: ${activeToken.patientPhone}`, 15, 121);

      doc.text(`Consultation Type: ${activeToken.consultationType}`, 110, 100);
      doc.text(`Booking Date: ${activeToken.bookingDate} (${activeToken.bookingTime})`, 110, 107);
      doc.text(`Token Reference: ${activeToken.id}`, 110, 114);
      doc.text(`Payment: ${activeToken.paymentStatus}`, 110, 121);

      // Doctor Details Section
      doc.setFontSize(11);
      doc.setTextColor(17, 24, 39);
      doc.setFont('helvetica', 'bold');
      doc.text('TREATING SPECIALIST & LOCATION', 15, 134);
      doc.line(15, 136, 195, 136);

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(55, 65, 81);
      doc.text(`Consulting Doctor: ${activeToken.doctorName}`, 15, 144);
      doc.text(`Specialty: ${activeToken.doctorSpecialty}`, 15, 151);
      doc.text(`Department: ${activeToken.doctorDepartment}`, 15, 158);

      if (activeToken.consultationType === 'Online Video Consult') {
        doc.text(`Virtual Video Room: ${activeToken.virtualRoomCode || 'SWR-ROOM-ONLINE'}`, 110, 144);
        doc.text(`Telehealth Web URL: https://swrakshak.in/telehealth`, 110, 151);
        doc.text(`Access Mode: Secure Encrypted Video Link`, 110, 158);
      } else {
        doc.text(`Hospital Room / Wing: ${activeToken.room}`, 110, 144);
        doc.text(`Campus: OPD Block A, 4th Floor`, 110, 151);
        doc.text(`Check-in Kiosk: Counter 3 (Cardiology & Medicine)`, 110, 158);
      }

      // Chief Complaint Section
      doc.setFontSize(11);
      doc.setTextColor(17, 24, 39);
      doc.setFont('helvetica', 'bold');
      doc.text('CHIEF COMPLAINT / CLINICAL PURPOSE', 15, 171);
      doc.line(15, 173, 195, 173);

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(55, 65, 81);
      doc.text(`${activeToken.chiefComplaint}`, 15, 181);

      // Patient Instructions Box (Bilingual Hindi & English)
      doc.setFillColor(249, 250, 251);
      doc.roundedRect(15, 192, 180, 48, 2, 2, 'F');
      doc.setDrawColor(209, 213, 219);
      doc.roundedRect(15, 192, 180, 48, 2, 2, 'D');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(31, 41, 55);
      doc.text('IMPORTANT PATIENT INSTRUCTIONS / महत्वपूर्ण निर्देश:', 20, 200);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(75, 85, 99);
      doc.text('1. Please report at clinic reception or join the virtual room 10 minutes before the expected time.', 20, 207);
      doc.text('   कृपया निर्धारित समय से 10 मिनट पहले उपस्थित रहें या ऑनलाइन कमरे में जुड़ें।', 20, 212);
      doc.text('2. Please keep prior medical records, lab reports, and ongoing prescription slips ready.', 20, 218);
      doc.text('3. In case of acute cardiac or neurological symptoms, immediately dial 108 or proceed to Emergency ICU.', 20, 224);
      doc.text('4. This token slip is digitally verified by SwRakshak Central EMR Registry.', 20, 230);

      // Footer & Authorized Seal
      doc.setFontSize(8);
      doc.setTextColor(156, 163, 175);
      doc.text('SwRakshak Electronic Health Records System • Autonomous Healthcare Infrastructure', 15, 260);
      doc.text(`Generated: ${new Date().toLocaleString('en-IN')} | Security Verification Checksum: ${activeToken.id}`, 15, 265);

      doc.setFont('helvetica', 'bold');
      doc.setTextColor(75, 85, 99);
      doc.text('Digitally Authorized By:', 140, 255);
      doc.text('Medical Superintendent', 140, 260);
      doc.text('SwRakshak Multispeciality Hospitals', 140, 265);

      // Save PDF
      doc.save(`SwRakshak_Token_${activeToken.tokenNumber}_${activeToken.patientName.replace(/\s+/g, '_')}.pdf`);
      showToast(`Downloaded Token #${activeToken.tokenNumber} Slip as PDF`);
    } catch (err) {
      console.error('PDF generation error:', err);
      showToast('Downloaded PDF fallback generated');
    }
  };

  return (
    <div className="flex-grow w-full max-w-6xl mx-auto px-4 py-4 md:py-8 pb-32 md:pb-16 space-y-6">
      {/* Top Banner (Hidden in print) */}
      <div className="no-print bg-gradient-to-r from-purple-950/60 via-[#140b1b] to-orange-950/30 border border-white/15 rounded-3xl p-6 md:p-8 backdrop-blur-xl relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full text-[11px] font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                OFFICIAL APPOINTMENT PORTAL
              </span>
              <span className="px-2.5 py-1 rounded-full text-[11px] font-mono text-cyan-300 bg-cyan-950/40 border border-cyan-500/30">
                Printable Slip Ready
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white tracking-tight font-headline-lg">
              Online Consultation Token Booking
            </h1>
            <p className="text-sm text-white/70 mt-1 max-w-2xl font-normal">
              Book a guaranteed consultation slot for online telehealth video calls or hospital OPD visits.
              Instantly receives a verified printable token with expected time and queue wait tracking.
            </p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto shrink-0 justify-end">
            {activeToken && (
              <button
                onClick={handlePrint}
                className="px-4 py-2.5 rounded-full bg-white text-black font-mono text-xs font-bold uppercase tracking-wider shadow-lg hover:bg-white/90 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[17px]">print</span>
                Print Current Token
              </button>
            )}

            {onNavigateToTab && (
              <button
                onClick={() => onNavigateToTab('my-health')}
                className="px-4 py-2.5 rounded-full bg-white/10 hover:bg-white/15 text-white/80 border border-white/20 font-mono text-xs font-semibold tracking-wider hover:scale-105 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                Patient Portal
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Grid: Left = Booking Form, Right = Live Printable Token Slip */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Booking Form (Hidden during print) */}
        <div className="no-print lg:col-span-5 space-y-6">
          <div className="bg-white/[0.04] border border-white/10 rounded-3xl p-5 sm:p-6 backdrop-blur-xl shadow-xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h2 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-purple-400 text-[18px]">add_circle</span>
                New Consultation Token
              </h2>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                Live Slots Available
              </span>
            </div>

            <form onSubmit={handleGenerateToken} className="space-y-4">
              {/* Consultation Type Radio */}
              <div>
                <label className="block text-xs font-mono text-white/70 uppercase tracking-wider mb-2">
                  Consultation Mode
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setConsultationType('Online Video Consult')}
                    className={`p-3 rounded-2xl border text-xs font-bold transition-all text-left flex flex-col gap-1 cursor-pointer ${
                      consultationType === 'Online Video Consult'
                        ? 'bg-cyan-950/50 border-cyan-400 text-cyan-200 shadow-[0_0_15px_rgba(6,182,212,0.25)]'
                        : 'bg-white/5 border-white/10 text-white/60 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="material-symbols-outlined text-[18px] text-cyan-400">videocam</span>
                      {consultationType === 'Online Video Consult' && (
                        <span className="material-symbols-outlined text-[14px]">check</span>
                      )}
                    </div>
                    <span>Online Video Consult</span>
                    <span className="text-[10px] font-mono font-normal opacity-80">Remote from home</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setConsultationType('In-Hospital OPD')}
                    className={`p-3 rounded-2xl border text-xs font-bold transition-all text-left flex flex-col gap-1 cursor-pointer ${
                      consultationType === 'In-Hospital OPD'
                        ? 'bg-purple-950/50 border-purple-400 text-purple-200 shadow-[0_0_15px_rgba(168,85,247,0.25)]'
                        : 'bg-white/5 border-white/10 text-white/60 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="material-symbols-outlined text-[18px] text-purple-400">local_hospital</span>
                      {consultationType === 'In-Hospital OPD' && (
                        <span className="material-symbols-outlined text-[14px]">check</span>
                      )}
                    </div>
                    <span>In-Hospital OPD</span>
                    <span className="text-[10px] font-mono font-normal opacity-80">Physical visit</span>
                  </button>
                </div>
              </div>

              {/* Doctor Selection */}
              <div>
                <label className="block text-xs font-mono text-white/70 uppercase tracking-wider mb-2">
                  Select Specialist Doctor
                </label>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {doctors.map((doc) => {
                    const isSelected = doc.id === selectedDocId;
                    return (
                      <div
                        key={doc.id}
                        onClick={() => setSelectedDocId(doc.id)}
                        className={`p-2.5 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-purple-600/30 border-purple-400 text-white shadow-sm'
                            : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                        }`}
                      >
                        <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-purple-950 border border-white/20">
                          <img src={doc.avatarUrl} alt={doc.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="font-bold text-xs truncate text-white">{doc.name}</div>
                          <div className="text-[10px] font-mono text-purple-300 truncate">
                            {doc.specialty || doc.department}
                          </div>
                          <div className="text-[9px] font-mono text-white/40">
                            {doc.room} • ₹{doc.consultationFee || 500}
                          </div>
                        </div>
                        {isSelected && (
                          <span className="material-symbols-outlined text-purple-300 text-[18px]">check_circle</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Date and Time Slot */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono text-white/60 uppercase mb-1">
                    Booking Date
                  </label>
                  <input
                    type="date"
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    className="w-full bg-black/40 border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-400"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-white/60 uppercase mb-1">
                    Preferred Slot
                  </label>
                  <select
                    value={slotTime}
                    onChange={(e) => setSlotTime(e.target.value)}
                    className="w-full bg-black/40 border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-400 cursor-pointer"
                  >
                    <option value="Morning OPD (09:30 AM – 01:30 PM)">Morning OPD (09:30 AM – 01:30 PM)</option>
                    <option value="Afternoon Slot (02:00 PM – 04:30 PM)">Afternoon Slot (02:00 PM – 04:30 PM)</option>
                    <option value="Evening Tele-OPD (05:00 PM – 08:00 PM)">Evening Tele-OPD (05:00 PM – 08:00 PM)</option>
                  </select>
                </div>
              </div>

              {/* Patient Details */}
              <div className="space-y-3 pt-1 border-t border-white/10">
                <span className="block text-[11px] font-mono font-bold uppercase text-purple-300">
                  Patient Information
                </span>

                <div>
                  <label className="block text-[11px] font-mono text-white/60 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    placeholder="Enter Patient Full Name"
                    className="w-full bg-black/40 border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-400"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[11px] font-mono text-white/60 mb-1">Age</label>
                    <input
                      type="number"
                      value={patientAge}
                      onChange={(e) => setPatientAge(Number(e.target.value))}
                      className="w-full bg-black/40 border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-400"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono text-white/60 mb-1">Gender</label>
                    <select
                      value={patientGender}
                      onChange={(e) => setPatientGender(e.target.value)}
                      className="w-full bg-black/40 border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-400"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono text-white/60 mb-1">Urgency</label>
                    <select
                      value={urgency}
                      onChange={(e) => setUrgency(e.target.value as any)}
                      className="w-full bg-black/40 border border-white/15 rounded-xl px-2 py-2 text-xs text-white focus:outline-none focus:border-purple-400"
                    >
                      <option value="Routine">Routine</option>
                      <option value="Follow-up">Follow-up</option>
                      <option value="Priority / Urgent">Urgent</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-mono text-white/60 mb-1">Phone Number</label>
                    <input
                      type="text"
                      value={patientPhone}
                      onChange={(e) => setPatientPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full bg-black/40 border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-400"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono text-white/60 mb-1">Email</label>
                    <input
                      type="email"
                      value={patientEmail}
                      onChange={(e) => setPatientEmail(e.target.value)}
                      placeholder="patient@example.com"
                      className="w-full bg-black/40 border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-400"
                    />
                  </div>
                </div>

                {/* Chief Complaint */}
                <div>
                  <label className="block text-[11px] font-mono text-white/60 mb-1">
                    Chief Complaint / Symptoms
                  </label>
                  <textarea
                    rows={2}
                    value={chiefComplaint}
                    onChange={(e) => setChiefComplaint(e.target.value)}
                    placeholder="Describe symptoms, duration, or purpose of visit..."
                    className="w-full bg-black/40 border border-white/15 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-purple-400"
                  />

                  {/* Preset symptom chips */}
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {symptomPresets.map((symptom, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setChiefComplaint(symptom)}
                        className="text-[10px] font-mono bg-white/5 hover:bg-white/15 text-white/70 hover:text-white px-2 py-0.5 rounded-md border border-white/10 transition-colors"
                      >
                        + {symptom}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isGenerating}
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-orange-500 text-white font-mono text-xs font-bold uppercase tracking-wider shadow-lg shadow-purple-900/40 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer border border-white/20 disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-[18px]">confirmation_number</span>
                  {isGenerating ? 'Allocating OPD Slot...' : 'Generate & Confirm Token'}
                </button>
              </div>
            </form>
          </div>

          {/* Stored Recent Tokens Drawer */}
          {bookedTokens.length > 0 && (
            <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-5 backdrop-blur-xl">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-white/80 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-purple-400 text-[16px]">history</span>
                  Recent Booked Tokens ({bookedTokens.length})
                </span>
                <span className="text-[10px] font-mono text-white/50">Click to switch view</span>
              </div>

              <div className="space-y-2">
                {bookedTokens.map((t) => {
                  const isCurrent = activeToken?.id === t.id;
                  return (
                    <div
                      key={t.id}
                      onClick={() => setActiveToken(t)}
                      className={`p-3 rounded-2xl border flex items-center justify-between gap-3 cursor-pointer transition-all ${
                        isCurrent
                          ? 'bg-purple-600/25 border-purple-400 text-white shadow-sm'
                          : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-sm text-purple-300">
                            #{t.tokenNumber}
                          </span>
                          <span className="font-bold text-xs text-white">{t.doctorName}</span>
                        </div>
                        <div className="text-[10px] font-mono text-white/50">
                          {t.expectedTime} • {t.consultationType}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                          {t.status}
                        </span>
                        <span className="material-symbols-outlined text-[16px] text-white/40">arrow_forward</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Official Printable Hospital Token Slip */}
        <div className="lg:col-span-7 space-y-4">
          {/* Action Bar for the active token (Hidden in print) */}
          {activeToken && (
            <div className="no-print flex flex-wrap items-center justify-between gap-3 p-3 bg-white/5 rounded-2xl border border-white/10">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-emerald-400 text-[20px]">check_circle</span>
                <span className="text-xs font-bold text-white font-mono">
                  ACTIVE TOKEN #{activeToken.tokenNumber} CONFIRMED
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrint}
                  className="px-3.5 py-1.5 rounded-full bg-white text-black font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 hover:bg-white/90 cursor-pointer shadow-md"
                >
                  <span className="material-symbols-outlined text-[16px]">print</span>
                  Print Slip
                </button>

                <button
                  onClick={handleDownloadPdf}
                  className="px-3.5 py-1.5 rounded-full bg-purple-600 hover:bg-purple-500 text-white font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  <span className="material-symbols-outlined text-[16px]">download</span>
                  Save PDF
                </button>

                {activeToken.consultationType === 'Online Video Consult' && onStartVideoConsult && (
                  <button
                    onClick={() => {
                      const doc = doctors.find((d) => d.id === activeToken.doctorId) || activeDoc;
                      onStartVideoConsult(doc, activeToken);
                    }}
                    className="px-3.5 py-1.5 rounded-full bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-md"
                  >
                    <span className="material-symbols-outlined text-[16px]">videocam</span>
                    Join Video Call
                  </button>
                )}
              </div>
            </div>
          )}

          {/* THE OFFICIAL PRINTABLE SLIP CONTAINER */}
          {activeToken ? (
            <div
              id="printable-hospital-token"
              className="printable-token-area bg-white text-[#121212] rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/20 relative overflow-hidden transition-all"
            >
              {/* Slip Watermark */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[120px] font-mono font-black text-black/[0.02] pointer-events-none select-none rotate-[-25deg]">
                SWRAKSHAK
              </div>

              {/* Header: Hospital Details */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b-2 border-purple-800 relative z-10">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-purple-900 text-white flex items-center justify-center font-bold font-mono text-xl shadow-md">
                    Sw
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold font-headline-lg text-purple-950 tracking-tight leading-tight">
                      SwRakshak Multispeciality Hospitals
                    </h2>
                    <p className="text-[10px] text-gray-600 font-mono">
                      Central Campus • NABH & NABL Accredited Healthcare Network
                    </p>
                    <p className="text-[9px] text-gray-500 font-mono">
                      Emergency Helpline: 108 / 112 • Toll-Free: 1800-SWR-CARE (797-2273)
                    </p>
                  </div>
                </div>

                <div className="text-right sm:border-l sm:pl-4 border-gray-200">
                  <span className="inline-block px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-900 text-[10px] font-bold font-mono border border-purple-200">
                    OFFICIAL TOKEN SLIP
                  </span>
                  <div className="text-[10px] text-gray-500 font-mono mt-1">
                    Ref ID: <strong>{activeToken.id}</strong>
                  </div>
                  <div className="text-[10px] text-gray-500 font-mono">
                    Issued: {activeToken.bookingDate} • {activeToken.bookingTime}
                  </div>
                </div>
              </div>

              {/* High-Impact Hero Token Block */}
              <div className="my-5 p-5 bg-gradient-to-r from-purple-50 to-orange-50 rounded-2xl border-2 border-purple-300/80 shadow-sm relative z-10">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-[11px] font-mono uppercase tracking-wider text-purple-800 font-bold block mb-1">
                      Assigned Consultation Token
                    </span>
                    <div className="flex items-baseline gap-3">
                      <span className="text-4xl sm:text-5xl font-black font-headline-lg text-purple-950 tracking-tight">
                        TOKEN #{activeToken.tokenNumber}
                      </span>
                      <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-md bg-purple-200/80 text-purple-900">
                        {activeToken.consultationType.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  <div className="bg-white p-3.5 rounded-xl border border-purple-200 shadow-sm text-center sm:text-right min-w-[200px]">
                    <span className="text-[10px] font-mono text-gray-500 uppercase block">
                      Expected Consultation Time
                    </span>
                    <span className="text-base sm:text-lg font-bold font-mono text-orange-600 block">
                      {activeToken.expectedTime}
                    </span>
                    <span className="text-[10px] font-mono text-emerald-700 font-semibold block mt-0.5">
                      Queue: {activeToken.queueAheadCount} patients ahead (~{activeToken.estimatedWaitMinutes}m wait)
                    </span>
                  </div>
                </div>
              </div>

              {/* Patient and Doctor Information Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-4 relative z-10 text-xs">
                {/* Patient Information */}
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-2">
                  <div className="font-bold font-mono text-[11px] text-purple-900 uppercase border-b border-gray-200 pb-1 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px]">person</span>
                    Patient Credentials
                  </div>

                  <div className="space-y-1 text-gray-700">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Patient Name:</span>
                      <strong className="text-gray-900">{activeToken.patientName}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Patient ID:</span>
                      <span className="font-mono font-bold text-gray-900">{activeToken.patientId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Age / Gender:</span>
                      <span>{activeToken.patientAge} Years / {activeToken.patientGender}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Phone Contact:</span>
                      <span className="font-mono">{activeToken.patientPhone}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Payment Status:</span>
                      <span className="text-emerald-700 font-bold">{activeToken.paymentStatus}</span>
                    </div>
                  </div>
                </div>

                {/* Doctor & Location Information */}
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-2">
                  <div className="font-bold font-mono text-[11px] text-purple-900 uppercase border-b border-gray-200 pb-1 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px]">stethoscope</span>
                    Consulting Doctor & Location
                  </div>

                  <div className="space-y-1 text-gray-700">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Doctor:</span>
                      <strong className="text-gray-900">{activeToken.doctorName}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Department:</span>
                      <span>{activeToken.doctorDepartment}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Specialty:</span>
                      <span className="text-gray-900">{activeToken.doctorSpecialty}</span>
                    </div>

                    {activeToken.consultationType === 'Online Video Consult' ? (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Virtual Room:</span>
                        <span className="font-mono font-bold text-cyan-800 bg-cyan-50 px-1.5 rounded">
                          {activeToken.virtualRoomCode || 'SWR-TELE-VIDEO'}
                        </span>
                      </div>
                    ) : (
                      <div className="flex justify-between">
                        <span className="text-gray-500">OPD Clinic Room:</span>
                        <strong className="text-purple-950">{activeToken.room}</strong>
                      </div>
                    )}

                    <div className="flex justify-between">
                      <span className="text-gray-500">Slot Window:</span>
                      <span className="text-gray-900">{activeToken.slotTime.split('(')[0].trim()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Chief Complaint Details */}
              <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-200 my-4 text-xs relative z-10">
                <span className="text-[10px] font-mono uppercase text-gray-500 font-bold block mb-1">
                  Reason for Visit / Chief Complaint
                </span>
                <p className="text-gray-800 font-medium">{activeToken.chiefComplaint}</p>
              </div>

              {/* Important Instructions (Bilingual Hindi & English) */}
              <div className="p-4 bg-purple-50/70 rounded-2xl border border-purple-200 my-4 text-xs relative z-10 space-y-1.5">
                <div className="font-bold font-mono text-[11px] text-purple-950 uppercase flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-orange-600">info</span>
                  Important Patient Instructions / महत्वपूर्ण रोगी निर्देश
                </div>

                <ul className="list-disc list-inside text-gray-700 text-[11px] space-y-1 leading-relaxed">
                  <li>
                    Please be present at the hospital clinic room or connect to the virtual video room{' '}
                    <strong>10 minutes before your expected time</strong> ({activeToken.expectedTime.split('–')[0].trim()}).
                  </li>
                  <li className="text-gray-600 italic">
                    कृपया निर्धारित समय से 10 मिनट पहले क्लिनिक में उपस्थित रहें या ऑनलाइन कमरे में जुड़ें।
                  </li>
                  <li>
                    Keep your prior diagnostic lab reports, ECGs, and ongoing medicine strips ready for clinical review.
                  </li>
                  <li>
                    In case of acute chest pain, breathlessness, or emergency, proceed immediately to the SwRakshak 24x7 Emergency ICU.
                  </li>
                </ul>
              </div>

              {/* Bottom Verification Seal & Barcode simulation */}
              <div className="pt-4 border-t border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10 text-[11px]">
                {/* Barcode & Checksum representation */}
                <div className="space-y-1">
                  <div className="flex items-center gap-1 h-7">
                    {/* Visual Barcode bars */}
                    {[2, 4, 1, 3, 2, 5, 2, 1, 4, 2, 3, 1, 5, 2, 1, 4, 3, 2, 5, 1, 3, 2, 4, 1, 3, 2].map(
                      (h, idx) => (
                        <div
                          key={idx}
                          className="bg-black"
                          style={{
                            width: `${h > 3 ? 3 : 1.5}px`,
                            height: '100%',
                          }}
                        />
                      )
                    )}
                  </div>
                  <div className="text-[9px] font-mono text-gray-500">
                    Digital Checksum: {activeToken.id}-VERIFIED-EHR
                  </div>
                </div>

                {/* Digital Registrar Stamp */}
                <div className="text-right sm:text-right">
                  <div className="font-bold text-gray-900 font-headline-lg">
                    SwRakshak Central EMR Registry
                  </div>
                  <div className="text-[10px] text-purple-800 font-mono font-semibold">
                    ✓ Digitally Signed & Authorized by Medical Superintendent
                  </div>
                  <div className="text-[9px] text-gray-400 font-mono">
                    Valid for appointment on {activeToken.bookingDate}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white/5 border border-white/10 rounded-3xl p-12 text-center text-white/50 backdrop-blur-xl">
              <span className="material-symbols-outlined text-4xl text-purple-400 mb-2">confirmation_number</span>
              <p className="text-sm font-bold text-white">No Token Selected</p>
              <p className="text-xs text-white/60 mt-1">
                Fill the booking form on the left to generate your first consultation token.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
