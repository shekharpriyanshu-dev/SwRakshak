import React, { useState, useEffect } from 'react';
import { DoctorProfile, Patient, CustomInfoCard } from '../types';
import { CompanyFooter } from './CompanyFooter';
import { SwRakshakLogo } from './SwRakshakLogo';

interface LandingPageProps {
  onEnterAuth: (mode?: 'login' | 'signup') => void;
  onEnterDoctorHub: (doc?: DoctorProfile) => void;
  onEnterPatientPortal: (pat?: Patient) => void;
  doctors: DoctorProfile[];
  patients: Patient[];
  showToast?: (msg: string) => void;
}

const STORAGE_INFO_KEY = 'swrakshak_custom_info_cards';

const DEFAULT_INFO_CARDS: CustomInfoCard[] = [
  {
    id: 'info-1',
    title: 'Free Preventive Cardiac Health & ECG Camp This Saturday',
    category: 'Announcement',
    content: 'ApexCare Hospital in collaboration with SwRakshak is hosting a comprehensive cardiac health screening camp on Saturday, 9:00 AM - 3:00 PM at OPD Wing B. Free blood pressure, blood glucose, and ECG evaluations for all walk-in patients.',
    author: 'Dr. Rajesh Sharma (Head of Cardiology)',
    date: 'Sep 03, 2026',
    contact: '+91 1800-208-2273',
    isPinned: true,
  },
  {
    id: 'info-2',
    title: 'Extended Evening OPD Hours for Multispeciality Clinics',
    category: 'Clinic Hours',
    content: 'To accommodate working professionals, our General Medicine, Paediatrics, and Orthopaedics clinics are now open until 9:00 PM on weekdays. Both in-person walk-ins and SwRakshak Video Teleconsultations are available.',
    author: 'ApexCare Administration',
    date: 'Sep 01, 2026',
    contact: 'OPD Desk: Ext 402',
    isPinned: true,
  },
  {
    id: 'info-3',
    title: 'Monsoon Seasonal Health Advisory: Dengue & Viral Fever Protocols',
    category: 'Health Advisory',
    content: 'High humidity and stagnant water increase vector-borne risks. Patients presenting with high fever, retro-orbital headache, or joint pain should report to our 24x7 Emergency Room immediately. SwRakshak Rapid Platelet & Dengue NS1 kits available.',
    author: 'Infection Control Committee',
    date: 'Aug 29, 2026',
    contact: 'Emergency: Ext 101',
    isPinned: false,
  },
  {
    id: 'info-4',
    title: 'New 3-Tesla High-Resolution MRI Diagnostic Suite Inaugurated',
    category: 'Facility Update',
    content: 'Our Radiology department has integrated a state-of-the-art 3T Silent MRI scanner. Digital DICOM imaging reports are automatically synced to your SwRakshak patient health locker within 60 minutes of scan completion.',
    author: 'Radiology Dept.',
    date: 'Aug 25, 2026',
    contact: 'radiology@swrakshak.health',
    isPinned: false,
  },
];

export const LandingPage: React.FC<LandingPageProps> = ({
  onEnterAuth,
  onEnterDoctorHub,
  onEnterPatientPortal,
  doctors,
  patients,
  showToast,
}) => {
  // Custom Information Cards State (Persisted in LocalStorage)
  const [infoCards, setInfoCards] = useState<CustomInfoCard[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_INFO_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_INFO_CARDS;
  });

  // Save info cards whenever updated
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_INFO_KEY, JSON.stringify(infoCards));
    } catch (e) {
      console.error(e);
    }
  }, [infoCards]);

  // Filter & Search states for the Info Board
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Add Custom Info Modal / Form State
  const [isAddingInfo, setIsAddingInfo] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState<string>('');
  const [newCategory, setNewCategory] = useState<CustomInfoCard['category']>('Announcement');
  const [newContent, setNewContent] = useState<string>('');
  const [newAuthor, setNewAuthor] = useState<string>('');
  const [newContact, setNewContact] = useState<string>('');
  const [newIsPinned, setNewIsPinned] = useState<boolean>(false);

  // Handle Add New Info Form Submit
  const handleCreateCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) {
      if (showToast) showToast('Please enter both title and details');
      return;
    }

    const newCard: CustomInfoCard = {
      id: `info-${Date.now()}`,
      title: newTitle.trim(),
      category: newCategory,
      content: newContent.trim(),
      author: newAuthor.trim() || 'Hospital Administration',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      contact: newContact.trim() || undefined,
      isPinned: newIsPinned,
    };

    setInfoCards((prev) => [newCard, ...prev]);
    setIsAddingInfo(false);
    // Reset Form
    setNewTitle('');
    setNewCategory('Announcement');
    setNewContent('');
    setNewAuthor('');
    setNewContact('');
    setNewIsPinned(false);

    if (showToast) showToast(`✓ Added: "${newCard.title}" to Information Board`);
  };

  // Delete Card
  const handleDeleteCard = (id: string, title: string) => {
    setInfoCards((prev) => prev.filter((c) => c.id !== id));
    if (showToast) showToast(`Removed notice: "${title}"`);
  };

  // Toggle Pin
  const handleTogglePin = (id: string) => {
    setInfoCards((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isPinned: !c.isPinned } : c))
    );
  };

  // Filter Cards
  const filteredCards = infoCards.filter((card) => {
    const matchesCategory = selectedCategory === 'All' || card.category === selectedCategory;
    const matchesSearch =
      card.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      card.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      card.author.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#08030c] text-white flex flex-col font-['Inter'] relative selection:bg-purple-600/30 selection:text-white overflow-x-hidden">
      
      {/* Dynamic Ambient Background Glow Elements */}
      <div className="fixed top-[-10%] left-1/4 w-[700px] h-[500px] bg-purple-900/15 rounded-full blur-[160px] pointer-events-none z-0"></div>
      <div className="fixed top-1/3 -right-20 w-[600px] h-[600px] bg-cyan-900/15 rounded-full blur-[160px] pointer-events-none z-0"></div>
      <div className="fixed bottom-10 left-[-5%] w-[500px] h-[500px] bg-indigo-900/10 rounded-full blur-[140px] pointer-events-none z-0"></div>

      {/* ========================================================================= */}
      {/* 1. TOP NAVIGATION HEADER                                                 */}
      {/* ========================================================================= */}
      <header className="w-full border-b border-white/10 bg-[#08030c]/85 backdrop-blur-xl sticky top-0 z-40 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          {/* Brand Logo & Name (Adjusted on top with small name) */}
          <div className="flex items-center gap-3">
            <SwRakshakLogo size={38} showName={true} nameInSmall={true} showSubtitle={true} />
            <div className="hidden sm:flex flex-col pl-2 border-l border-white/10">
              <div className="flex items-center gap-1.5">
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-[9px] font-mono font-bold text-emerald-300 uppercase tracking-wide">
                  LIVE EHR
                </span>
                <span className="px-2 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-[9px] font-mono font-medium text-cyan-300 hidden md:inline-block">
                  TELE-CARE
                </span>
              </div>
              <span className="text-[10px] font-mono text-white/50 block -mt-0.5">
                Hospital Telemedicine Platform
              </span>
            </div>
          </div>

          {/* Center Navigation Links (Desktop) */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-mono">
            <a href="#about" className="text-white/70 hover:text-white transition-colors">
              About SwRakshak
            </a>
            <a href="#services" className="text-white/70 hover:text-white transition-colors">
              Clinical Services
            </a>
            <a href="#info-board" className="text-purple-300 hover:text-white transition-colors flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping"></span>
              Hospital Info & Notices
            </a>
            <a href="#contact" className="text-white/70 hover:text-white transition-colors">
              Emergency & Helplines
            </a>
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            <button
              onClick={() => onEnterAuth('login')}
              className="px-4 py-2 rounded-full border border-white/20 bg-white/5 hover:bg-white/15 text-white text-xs font-mono font-bold uppercase tracking-wider transition-all cursor-pointer hover:scale-105"
            >
              Sign In
            </button>
            <button
              onClick={() => onEnterAuth('signup')}
              className="px-4 sm:px-5 py-2 rounded-full bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white text-xs font-mono font-bold uppercase tracking-wider shadow-[0_0_20px_rgba(147,51,234,0.4)] transition-all cursor-pointer hover:scale-105"
            >
              Register / Sign Up
            </button>
          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. HERO / FIRST APPEARANCE SECTION                                       */}
      {/* ========================================================================= */}
      <section className="relative z-10 pt-12 sm:pt-20 pb-16 sm:pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-4xl mx-auto space-y-6">
          
          {/* Trust Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.05] border border-white/15 backdrop-blur-md shadow-inner text-xs font-mono text-purple-300">
            <span className="material-symbols-outlined text-[16px] text-cyan-400">verified_user</span>
            <span>ABDM Enabled • NABH Hospital Accredited • HIPAA 256-bit Encrypted</span>
          </div>

          {/* Main Title: SwRakshak */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold font-mono tracking-tight text-white leading-tight">
            SwRakshak
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-indigo-300 to-cyan-400 text-2xl sm:text-4xl md:text-5xl mt-2 font-sans font-bold">
              Next-Gen Clinical Healthcare & Telehealth Platform
            </span>
          </h1>

          {/* About SwRakshak Intro Paragraph */}
          <p className="text-base sm:text-lg text-white/70 max-w-3xl mx-auto font-normal leading-relaxed pt-2">
            Welcome to <span className="text-white font-semibold">SwRakshak</span> — India’s comprehensive digital healthcare ecosystem engineered for modern hospitals, medical specialists, and patients. We unify electronic health records (EHR), automated pathology telemetry, continuous vitals tracking, and encrypted high-definition teleconsultations into one seamless experience.
          </p>

          {/* Direct CTA Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 pt-4">
            {/* Enter Auth Page */}
            <button
              onClick={() => onEnterAuth('login')}
              className="px-6 sm:px-8 py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white font-mono font-bold text-xs sm:text-sm uppercase tracking-wider shadow-[0_10px_35px_rgba(147,51,234,0.45)] transition-all cursor-pointer hover:scale-105 active:scale-95 flex items-center gap-2.5"
            >
              <span className="material-symbols-outlined text-[20px]">account_circle</span>
              <span>Login or Sign Up</span>
            </button>

            {/* Doctor Hub */}
            <button
              onClick={() => onEnterDoctorHub(doctors[0])}
              className="px-5 sm:px-6 py-3.5 rounded-2xl bg-purple-950/40 hover:bg-purple-900/50 border border-purple-500/40 text-purple-200 font-mono font-bold text-xs sm:text-sm uppercase tracking-wider transition-all cursor-pointer hover:scale-105 active:scale-95 flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[20px] text-purple-400">stethoscope</span>
              <span>Doctor Hub</span>
            </button>

            {/* Patient Portal */}
            <button
              onClick={() => onEnterPatientPortal(patients[0])}
              className="px-5 sm:px-6 py-3.5 rounded-2xl bg-cyan-950/40 hover:bg-cyan-900/50 border border-cyan-500/40 text-cyan-200 font-mono font-bold text-xs sm:text-sm uppercase tracking-wider transition-all cursor-pointer hover:scale-105 active:scale-95 flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[20px] text-cyan-400">folder_shared</span>
              <span>Patient Portal</span>
            </button>

            {/* Add Custom Info Button */}
            <a
              href="#info-board"
              onClick={() => setIsAddingInfo(true)}
              className="px-5 sm:px-6 py-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/15 text-white/90 font-mono font-bold text-xs sm:text-sm uppercase tracking-wider transition-all cursor-pointer hover:scale-105 active:scale-95 flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[20px] text-amber-400">add_circle</span>
              <span>Add Hospital Info</span>
            </a>
          </div>

          {/* Quick Key Metrics Strip */}
          <div className="pt-10 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-sm text-center">
              <span className="text-2xl sm:text-3xl font-bold font-mono text-purple-400 block">
                45,000+
              </span>
              <span className="text-xs text-white/50 font-mono mt-0.5 block">
                Clinical EHRs Synced
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-sm text-center">
              <span className="text-2xl sm:text-3xl font-bold font-mono text-cyan-400 block">
                120+
              </span>
              <span className="text-xs text-white/50 font-mono mt-0.5 block">
                Consulting Physicians
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-sm text-center">
              <span className="text-2xl sm:text-3xl font-bold font-mono text-emerald-400 block">
                24x7
              </span>
              <span className="text-xs text-white/50 font-mono mt-0.5 block">
                Emergency & Telehealth
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-sm text-center">
              <span className="text-2xl sm:text-3xl font-bold font-mono text-orange-400 block">
                100%
              </span>
              <span className="text-xs text-white/50 font-mono mt-0.5 block">
                HIPAA & ABDM Compliant
              </span>
            </div>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. ABOUT SWRAKSHAK DETAILED SECTION                                      */}
      {/* ========================================================================= */}
      <section id="about" className="py-16 sm:py-20 bg-white/[0.01] border-y border-white/10 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            {/* Left Column: Mission & About Story (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-purple-500/10 border border-purple-500/30 text-xs font-mono text-purple-300">
                <span className="material-symbols-outlined text-[15px]">info</span>
                ABOUT SWRAKSHAK HEALTHCARE
              </div>

              <h2 className="text-3xl sm:text-4xl font-bold font-mono tracking-tight text-white leading-tight">
                Empowering Doctors. Protecting Patients. Connecting Care Everywhere.
              </h2>

              <p className="text-sm sm:text-base text-white/70 leading-relaxed">
                SwRakshak was conceived to solve the critical fragmentation in Indian healthcare. Traditional paper charts get lost, lab results are delayed, and patients traveling from remote regions often lack continuity of clinical history.
              </p>

              <p className="text-sm sm:text-base text-white/70 leading-relaxed">
                Our platform introduces a single unified source of truth: doctors can review instant longitudinal vitals, digitally approve diagnostic lab work, execute encrypted HD video consultations, and issue verifiable e-prescriptions with automatic QR code validation.
              </p>

              {/* Three Core Feature Pillars */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-2">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-300 flex items-center justify-center">
                    <span className="material-symbols-outlined text-[18px]">verified</span>
                  </div>
                  <h3 className="font-bold font-mono text-xs text-white">Clinical Integrity</h3>
                  <p className="text-[11px] text-white/50 leading-normal">
                    Cryptographically stamped clinical logs and doctor digital signatures.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-2">
                  <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-300 flex items-center justify-center">
                    <span className="material-symbols-outlined text-[18px]">video_camera_front</span>
                  </div>
                  <h3 className="font-bold font-mono text-xs text-white">HD Telehealth</h3>
                  <p className="text-[11px] text-white/50 leading-normal">
                    Direct WebRTC consultations with live screen sharing and vitals telemetry.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-300 flex items-center justify-center">
                    <span className="material-symbols-outlined text-[18px]">lab_profile</span>
                  </div>
                  <h3 className="font-bold font-mono text-xs text-white">Instant Lab Reports</h3>
                  <p className="text-[11px] text-white/50 leading-normal">
                    Direct diagnostic pathology sync with downloadable PDF lab reports.
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column: Visual Feature Showcase Card (5 cols) */}
            <div className="lg:col-span-5">
              <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#150a1e] to-[#0c0512] border border-white/15 shadow-[0_20px_50px_rgba(0,0,0,0.7)] relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-600/20 rounded-full blur-3xl pointer-events-none"></div>

                <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300 font-mono font-bold text-sm">
                      SR
                    </div>
                    <div>
                      <span className="font-bold font-mono text-sm block text-white">ApexCare Network</span>
                      <span className="text-[11px] text-emerald-400 font-mono flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                        SwRakshak Node Active
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-mono text-white/40">ABDM #9821</span>
                </div>

                <div className="space-y-3 font-mono text-xs">
                  <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between">
                    <span className="text-white/60">Doctor Onboarding</span>
                    <span className="text-purple-300 font-bold">120 Specialists Ready</span>
                  </div>
                  <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between">
                    <span className="text-white/60">Encryption Standard</span>
                    <span className="text-cyan-300 font-bold">AES-256 GCM</span>
                  </div>
                  <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between">
                    <span className="text-white/60">OPD & Virtual Wait Time</span>
                    <span className="text-emerald-400 font-bold">&lt; 4 Minutes</span>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
                  <span className="text-xs text-white/50 font-mono">Ready to experience SwRakshak?</span>
                  <button
                    onClick={() => onEnterAuth('signup')}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-mono font-bold uppercase tracking-wider transition-all cursor-pointer shadow-md"
                  >
                    Join Today
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. INTERACTIVE INFO & BULLETIN BOARD (Add info, details, notices)         */}
      {/* ========================================================================= */}
      <section id="info-board" className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-cyan-500/10 border border-cyan-500/30 text-xs font-mono text-cyan-300 mb-2">
              <span className="material-symbols-outlined text-[15px]">campaign</span>
              DYNAMIC BULLETIN & HOSPITAL DETAILS
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-white">
              SwRakshak Information & Notice Center
            </h2>
            <p className="text-xs sm:text-sm text-white/60 mt-1 max-w-2xl">
              Add, manage, and review live announcements, clinic hours, seasonal health advisories, and facility updates directly on the portal.
            </p>
          </div>

          {/* "+ Add Info / Announcement" Trigger Button */}
          <button
            onClick={() => setIsAddingInfo(!isAddingInfo)}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 text-white font-mono font-bold text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(6,182,212,0.35)] transition-all cursor-pointer flex items-center gap-2 self-start md:self-auto hover:scale-105 active:scale-95"
          >
            <span className="material-symbols-outlined text-[18px]">
              {isAddingInfo ? 'close' : 'add_circle'}
            </span>
            <span>{isAddingInfo ? 'Close Form' : 'Add Info / Details'}</span>
          </button>
        </div>

        {/* INLINE ADD INFO FORM (When toggled open) */}
        {isAddingInfo && (
          <form
            onSubmit={handleCreateCard}
            className="mb-10 p-6 sm:p-8 rounded-3xl bg-[#14081c] border border-cyan-500/30 shadow-[0_15px_40px_rgba(0,0,0,0.8)] backdrop-blur-xl animate-fadeIn space-y-4"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-cyan-400 text-[20px]">post_add</span>
                <span className="font-bold font-mono text-sm text-white">Add New Information / Notice Card</span>
              </div>
              <span className="text-[11px] font-mono text-white/40">Visible to all visitors & patients</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Notice Title */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-mono text-white/70 mb-1">
                  Information Title / Headline *
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Free Cardiology Health Checkup on Saturday"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white placeholder-white/30 text-xs sm:text-sm focus:outline-none focus:border-cyan-400"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-mono text-white/70 mb-1">
                  Category *
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#100717] border border-white/15 text-white text-xs sm:text-sm focus:outline-none focus:border-cyan-400 cursor-pointer"
                >
                  <option value="Announcement">Announcement</option>
                  <option value="Clinic Hours">Clinic Hours</option>
                  <option value="Health Advisory">Health Advisory</option>
                  <option value="Emergency Info">Emergency Info</option>
                  <option value="Facility Update">Facility Update</option>
                </select>
              </div>
            </div>

            {/* Content / Details */}
            <div>
              <label className="block text-xs font-mono text-white/70 mb-1">
                Detailed Information / Description *
              </label>
              <textarea
                required
                rows={3}
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                placeholder="Enter complete instructions, clinic timings, symptoms, or hospital news details..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white placeholder-white/30 text-xs sm:text-sm focus:outline-none focus:border-cyan-400 resize-none"
              />
            </div>

            {/* Author & Contact Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono text-white/70 mb-1">
                  Department / Author
                </label>
                <input
                  type="text"
                  value={newAuthor}
                  onChange={(e) => setNewAuthor(e.target.value)}
                  placeholder="e.g. Dr. Rajesh Sharma or Medical Admin"
                  className="w-full px-3.5 py-2 rounded-xl bg-white/5 border border-white/15 text-white placeholder-white/30 text-xs focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-white/70 mb-1">
                  Contact Helpline / Email (Optional)
                </label>
                <input
                  type="text"
                  value={newContact}
                  onChange={(e) => setNewContact(e.target.value)}
                  placeholder="e.g. +91 1800-208-2273 or desk@swrakshak.health"
                  className="w-full px-3.5 py-2 rounded-xl bg-white/5 border border-white/15 text-white placeholder-white/30 text-xs focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>

            {/* Pin to Top Checkbox & Submit */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-mono text-white/80">
                <input
                  type="checkbox"
                  checked={newIsPinned}
                  onChange={(e) => setNewIsPinned(e.target.checked)}
                  className="rounded border-white/20 bg-white/10 text-cyan-600 focus:ring-cyan-500"
                />
                <span>Pin this notice to top of Information Board</span>
              </label>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsAddingInfo(false)}
                  className="px-4 py-2 rounded-xl border border-white/20 text-white/70 hover:text-white text-xs font-mono cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-emerald-600 text-white text-xs font-mono font-bold uppercase tracking-wider hover:scale-105 transition-all shadow-md cursor-pointer"
                >
                  Publish Notice
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Filter Tabs & Search Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-2">
            {['All', 'Announcement', 'Clinic Hours', 'Health Advisory', 'Emergency Info', 'Facility Update'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-mono transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-purple-600 text-white font-bold shadow-md shadow-purple-900/40'
                    : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-white/40 text-[18px]">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search announcements..."
              className="w-full pl-9 pr-3 py-1.5 rounded-full bg-white/5 border border-white/15 text-xs text-white placeholder-white/40 focus:outline-none focus:border-cyan-400"
            />
          </div>
        </div>

        {/* Notice Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredCards.length === 0 ? (
            <div className="col-span-full py-12 text-center text-white/40 font-mono text-xs bg-white/[0.02] border border-white/5 rounded-3xl">
              No information cards found matching your query.
            </div>
          ) : (
            filteredCards.map((card) => {
              const badgeColors: Record<string, string> = {
                Announcement: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
                'Clinic Hours': 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
                'Health Advisory': 'bg-amber-500/20 text-amber-300 border-amber-500/30',
                'Emergency Info': 'bg-rose-500/20 text-rose-300 border-rose-500/30',
                'Facility Update': 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
              };

              return (
                <div
                  key={card.id}
                  className={`p-6 rounded-3xl border transition-all relative overflow-hidden flex flex-col justify-between group ${
                    card.isPinned
                      ? 'bg-gradient-to-br from-[#180924] to-[#0c0512] border-purple-500/40 shadow-[0_10px_30px_rgba(168,85,247,0.15)]'
                      : 'bg-[#100615] border-white/10 hover:border-white/20'
                  }`}
                >
                  <div>
                    {/* Top Row: Category badge & Pin/Delete actions */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase border ${
                            badgeColors[card.category] || 'bg-white/10 text-white/80 border-white/20'
                          }`}
                        >
                          {card.category}
                        </span>

                        {card.isPinned && (
                          <span className="text-[10px] font-mono text-amber-300 flex items-center gap-0.5">
                            <span className="material-symbols-outlined text-[13px]">push_pin</span>
                            Pinned
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleTogglePin(card.id)}
                          title={card.isPinned ? 'Unpin' : 'Pin to top'}
                          className="p-1 rounded-md hover:bg-white/10 text-white/50 hover:text-amber-300 transition-colors cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[16px]">
                            {card.isPinned ? 'keep_off' : 'push_pin'}
                          </span>
                        </button>
                        <button
                          onClick={() => handleDeleteCard(card.id, card.title)}
                          title="Delete notice"
                          className="p-1 rounded-md hover:bg-white/10 text-white/50 hover:text-rose-400 transition-colors cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[16px]">delete</span>
                        </button>
                      </div>
                    </div>

                    {/* Notice Title */}
                    <h3 className="text-base sm:text-lg font-bold font-mono text-white group-hover:text-cyan-200 transition-colors leading-snug">
                      {card.title}
                    </h3>

                    {/* Notice Body */}
                    <p className="text-xs sm:text-sm text-white/70 mt-2.5 leading-relaxed">
                      {card.content}
                    </p>
                  </div>

                  {/* Notice Footer: Author, Date, Contact */}
                  <div className="mt-5 pt-3.5 border-t border-white/10 flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
                    <div className="flex items-center gap-2 text-white/50">
                      <span className="material-symbols-outlined text-[14px]">person</span>
                      <span>{card.author}</span>
                      <span>•</span>
                      <span>{card.date}</span>
                    </div>

                    {card.contact && (
                      <span className="text-[11px] text-cyan-400 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[13px]">call</span>
                        {card.contact}
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

      </section>

      {/* ========================================================================= */}
      {/* 5. CLINICAL SERVICES GRID (`#services`)                                  */}
      {/* ========================================================================= */}
      <section id="services" className="py-16 sm:py-20 bg-white/[0.015] border-t border-white/10 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-purple-500/10 border border-purple-500/30 text-xs font-mono text-purple-300 mb-2">
              <span className="material-symbols-outlined text-[15px]">medical_services</span>
              CORE SUITE
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-white">
              Integrated Healthcare Modalities
            </h2>
            <p className="text-xs sm:text-sm text-white/60 mt-1">
              End-to-end clinical workflows built for high-throughput inpatient, outpatient, and remote care.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Service 1 */}
            <div className="p-6 rounded-3xl bg-[#110717] border border-white/10 hover:border-purple-500/40 transition-all space-y-3 group">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center">
                <span className="material-symbols-outlined text-[22px]">history_edu</span>
              </div>
              <h3 className="font-bold font-mono text-sm sm:text-base text-white group-hover:text-purple-300 transition-colors">
                Unified Clinical EHR
              </h3>
              <p className="text-xs text-white/60 leading-relaxed">
                Centralized medical case files tracking MRI, CT, blood work, surgical records, and past consultations with instant PDF export.
              </p>
            </div>

            {/* Service 2 */}
            <div className="p-6 rounded-3xl bg-[#110717] border border-white/10 hover:border-cyan-500/40 transition-all space-y-3 group">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-300 flex items-center justify-center">
                <span className="material-symbols-outlined text-[22px]">vital_signs</span>
              </div>
              <h3 className="font-bold font-mono text-sm sm:text-base text-white group-hover:text-cyan-300 transition-colors">
                Real-Time Vitals Telemetry
              </h3>
              <p className="text-xs text-white/60 leading-relaxed">
                Continuous monitoring of Blood Pressure, SpO2, Heart Rate, and Body Weight with automated critical alert indicators.
              </p>
            </div>

            {/* Service 3 */}
            <div className="p-6 rounded-3xl bg-[#110717] border border-white/10 hover:border-emerald-500/40 transition-all space-y-3 group">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center">
                <span className="material-symbols-outlined text-[22px]">video_chat</span>
              </div>
              <h3 className="font-bold font-mono text-sm sm:text-base text-white group-hover:text-emerald-300 transition-colors">
                24x7 HD Telemedicine
              </h3>
              <p className="text-xs text-white/60 leading-relaxed">
                Peer-to-peer encrypted video consultations allowing doctors to conduct virtual rounds and issue instant e-prescriptions.
              </p>
            </div>

            {/* Service 4 */}
            <div className="p-6 rounded-3xl bg-[#110717] border border-white/10 hover:border-orange-500/40 transition-all space-y-3 group">
              <div className="w-10 h-10 rounded-xl bg-orange-500/20 text-orange-300 flex items-center justify-center">
                <span className="material-symbols-outlined text-[22px]">biotechnology</span>
              </div>
              <h3 className="font-bold font-mono text-sm sm:text-base text-white group-hover:text-orange-300 transition-colors">
                Automated Pathology Reports
              </h3>
              <p className="text-xs text-white/60 leading-relaxed">
                Direct diagnostic laboratory synchronization with flagged abnormal items, doctor reviews, and printable reports.
              </p>
            </div>

            {/* Service 5 */}
            <div className="p-6 rounded-3xl bg-[#110717] border border-white/10 hover:border-indigo-500/40 transition-all space-y-3 group">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center">
                <span className="material-symbols-outlined text-[22px]">medication</span>
              </div>
              <h3 className="font-bold font-mono text-sm sm:text-base text-white group-hover:text-indigo-300 transition-colors">
                E-Prescriptions & Meal Schedules
              </h3>
              <p className="text-xs text-white/60 leading-relaxed">
                Interactive dosage management, meal nutritional plans, and audio alarms so patients never miss their regimens.
              </p>
            </div>

            {/* Service 6 */}
            <div className="p-6 rounded-3xl bg-[#110717] border border-white/10 hover:border-rose-500/40 transition-all space-y-3 group">
              <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-300 flex items-center justify-center">
                <span className="material-symbols-outlined text-[22px]">lock</span>
              </div>
              <h3 className="font-bold font-mono text-sm sm:text-base text-white group-hover:text-rose-300 transition-colors">
                ABDM & Ayushman Bharat ID
              </h3>
              <p className="text-xs text-white/60 leading-relaxed">
                National Health Stack integration facilitating seamless patient consent, data portability, and government compliance.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. REUSABLE RICH COMPANY FOOTER WITH ADDRESS, MAIL & HELPLINE            */}
      {/* ========================================================================= */}
      <div id="contact">
        <CompanyFooter onOpenAuth={() => onEnterAuth('login')} />
      </div>

    </div>
  );
};
