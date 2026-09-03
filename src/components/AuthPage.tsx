import React, { useState } from 'react';
import { UserRole, DoctorProfile, Patient } from '../types';
import { CompanyFooter } from './CompanyFooter';
import { SwRakshakLogo } from './SwRakshakLogo';

interface AuthPageProps {
  onLoginDoctor: (doctor: DoctorProfile) => void;
  onLoginPatient: (patient: Patient) => void;
  onRegisterDoctor: (doctor: DoctorProfile) => void;
  onRegisterPatient: (patient: Patient) => void;
  onCancel: () => void;
  doctors: DoctorProfile[];
  patients: Patient[];
  showToast?: (msg: string) => void;
  defaultMode?: 'login' | 'signup';
  defaultRole?: UserRole;
}

export const AuthPage: React.FC<AuthPageProps> = ({
  onLoginDoctor,
  onLoginPatient,
  onRegisterDoctor,
  onRegisterPatient,
  onCancel,
  doctors,
  patients,
  showToast,
  defaultMode = 'login',
  defaultRole = 'doctor',
}) => {
  // Top Option: 'login' or 'signup'
  const [authMode, setAuthMode] = useState<'login' | 'signup'>(defaultMode);
  const [selectedRole, setSelectedRole] = useState<UserRole>(defaultRole);
  const [authError, setAuthError] = useState<string>('');

  // Login Form States
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Signup Form States - Shared (Doctor self-registration only)
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(true);

  // Signup Form States - Patient Specific (disabled for self-registration)
  const [dob, setDob] = useState('1985-05-15');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [bloodType, setBloodType] = useState('O+');

  // Signup Form States - Doctor Specific
  const [department, setDepartment] = useState('Cardiology');
  const [specialty, setSpecialty] = useState('Senior Consultant');
  const [mciNumber, setMciNumber] = useState('MCI/2024/77492');
  const [clinicRoom, setClinicRoom] = useState('OPD-304');

  // Fast 1-Click Demo Login
  const handleQuickLoginDoctor = (doc: DoctorProfile) => {
    setAuthError('');
    onLoginDoctor(doc);
    if (showToast) showToast(`Signed in as ${doc.name} (${doc.department})`);
  };

  const handleQuickLoginPatient = (pat: Patient) => {
    setAuthError('');
    onLoginPatient(pat);
    if (showToast) showToast(`Signed in as ${pat.name} (Patient ID: ${pat.id})`);
  };

  // Handle Login Submit
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');

    if (selectedRole === 'doctor') {
      const query = loginIdentifier.trim().toLowerCase();
      // Find matching doctor or fall back to default
      const matched = query
        ? doctors.find(
            (d) =>
              d.name.toLowerCase().includes(query) ||
              d.employeeId.toLowerCase() === query ||
              (d.email && d.email.toLowerCase() === query)
          ) || doctors[0]
        : doctors[0];

      onLoginDoctor(matched);
      if (showToast) showToast(`Welcome back, ${matched.name}!`);
    } else {
      // Patient Login - Doctor-Issued Patient ID Required
      const query = loginIdentifier.trim();
      if (!query) {
        setAuthError('Please enter your Doctor-Issued Patient ID (e.g., PID-99821, PID-84721).');
        return;
      }

      // Check against registered patients
      const matched = patients.find(
        (p) =>
          p.id.toLowerCase() === query.toLowerCase() ||
          p.phone.replace(/\D/g, '').includes(query.replace(/\D/g, '')) ||
          p.name.toLowerCase() === query.toLowerCase()
      );

      if (!matched) {
        setAuthError(
          `No patient found with ID "${query}". Patients cannot self-register; your attending doctor must add you to their patient registry.`
        );
        return;
      }

      // Check PIN if entered
      if (loginPassword && loginPassword !== (matched.pin || '1234') && loginPassword !== '1234') {
        setAuthError(`Incorrect Patient Security PIN. (Demo PIN is ${matched.pin || '1234'})`);
        return;
      }

      onLoginPatient(matched);
      if (showToast) showToast(`Signed in to Patient Portal: ${matched.name} (${matched.id})`);
    }
  };

  // Handle Signup Submit - Strictly for Doctors / Staff (Patients cannot self-register)
  const handleSignupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');

    if (selectedRole === 'patient') {
      setAuthError('Patients cannot register themselves. Only an attending doctor can enroll patients in SwRakshak.');
      return;
    }

    if (!fullName.trim()) {
      if (showToast) showToast('Please enter your full name');
      return;
    }

    if (!agreedToTerms) {
      if (showToast) showToast('Please accept the HIPAA & Medical Staff terms to continue');
      return;
    }

    if (signupPassword && confirmPassword && signupPassword !== confirmPassword) {
      if (showToast) showToast('Passwords do not match');
      return;
    }

    const newDoctor: DoctorProfile = {
      id: `doc-${Date.now()}`,
      name: fullName.startsWith('Dr.') ? fullName : `Dr. ${fullName}`,
      title: specialty || 'Attending Physician',
      department: department || 'General Medicine',
      room: clinicRoom || 'OPD-101',
      employeeId: mciNumber || `DOC-${Math.floor(1000 + Math.random() * 9000)}`,
      avatarUrl: `https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=200`,
      patientsCount: 0,
      apptsTodayCount: 0,
      biometricEnabled: true,
      criticalAlertsEnabled: true,
      scheduleUpdatesEnabled: true,
      language: 'English (US)',
      pin: '1234',
      email: email || `${fullName.toLowerCase().replace(/\s+/g, '.')}@swrakshak.health`,
      phone: phone || '+91 98765-43210',
    };

    onRegisterDoctor(newDoctor);
    if (showToast) showToast(`Doctor profile created for ${newDoctor.name}`);
  };

  return (
    <div className="min-h-screen bg-[#09040c] text-white flex flex-col font-['Inter'] relative selection:bg-purple-600/30 selection:text-white overflow-x-hidden">
      {/* Dynamic Background Ambient Glowing Orbs */}
      <div className="fixed top-[-10%] left-[-10%] w-[600px] h-[600px] bg-purple-900/20 rounded-full blur-[140px] pointer-events-none z-0"></div>
      <div className="fixed bottom-[-10%] right-[-5%] w-[550px] h-[550px] bg-cyan-900/15 rounded-full blur-[120px] pointer-events-none z-0"></div>
      <div className="fixed top-[40%] right-[20%] w-[350px] h-[350px] bg-orange-900/10 rounded-full blur-[100px] pointer-events-none z-0"></div>

      {/* Top Navbar */}
      <header className="w-full border-b border-white/10 bg-[#09040c]/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 h-20 flex items-center justify-between">
          {/* Brand Logo & Name (Adjusted on top with name in small) */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={onCancel}>
            <SwRakshakLogo size={36} showName={true} nameInSmall={true} showSubtitle={true} />
            <div className="hidden sm:flex flex-col pl-2 border-l border-white/10">
              <span className="px-2 py-0.5 rounded-full bg-purple-500/20 border border-purple-500/30 text-[9px] font-mono font-bold text-purple-300 uppercase">
                HEALTH PLATFORM
              </span>
              <span className="text-[10px] font-mono text-white/50 block -mt-0.5">
                Hospital & Patient Care System
              </span>
            </div>
          </div>

          {/* Right Header Badges & Guest Action */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>256-Bit SSL Encrypted</span>
            </div>

            <button
              onClick={onCancel}
              title="Return to SwRakshak First Appearance Page"
              className="px-4 py-2 rounded-full border border-white/20 bg-white/5 hover:bg-white/15 text-white text-xs font-mono font-semibold flex items-center gap-1.5 transition-all cursor-pointer hover:scale-105"
            >
              <span className="material-symbols-outlined text-[16px]">home</span>
              <span className="hidden sm:inline">Back to</span> First Page
            </button>
          </div>
        </div>
      </header>

      {/* Main Authentication Content Area */}
      <main className="flex-grow flex items-center justify-center px-4 py-12 relative z-10">
        <div className="w-full max-w-xl">
          
          {/* Main Auth Container Card */}
          <div className="bg-[#120818]/90 border border-white/15 rounded-[32px] p-6 sm:p-8 md:p-10 shadow-[0_20px_60px_rgba(0,0,0,0.85)] backdrop-blur-2xl relative overflow-hidden">
            
            {/* Top Accent Gradient Bar */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-purple-600 via-indigo-500 to-cyan-400"></div>

            {/* App Name & Branding Presentation on Top of Card */}
            <div className="text-center mb-8 pt-2 flex flex-col items-center">
              <div className="mb-2">
                <SwRakshakLogo size={56} showName={true} nameInSmall={false} showSubtitle={true} />
              </div>
              <p className="text-xs sm:text-sm text-purple-200/70 mt-2 max-w-md mx-auto">
                Secure Unified Portal for Clinical EHR, Diagnostic Telemetry & Remote Consultations
              </p>
            </div>

            {/* TOP OPTION: LOGIN OR SIGNUP SWITCHER TABS */}
            <div className="mb-6">
              <div className="bg-white/5 p-1 rounded-2xl border border-white/10 flex items-center relative">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('login');
                    setAuthError('');
                  }}
                  className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold font-mono uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    authMode === 'login'
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-[0_0_20px_rgba(147,51,234,0.4)]'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">login</span>
                  <span>{selectedRole === 'patient' ? 'Sign In with ID' : 'Doctor Login'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('signup');
                    setAuthError('');
                  }}
                  className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold font-mono uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    authMode === 'signup'
                      ? 'bg-gradient-to-r from-indigo-600 to-cyan-600 text-white shadow-[0_0_20px_rgba(6,182,212,0.4)]'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {selectedRole === 'patient' ? 'policy' : 'person_add'}
                  </span>
                  <span>{selectedRole === 'patient' ? 'Enrollment Policy' : 'Doctor Register'}</span>
                </button>
              </div>
            </div>

            {/* Role Switcher: Patient vs Doctor / Staff */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-white/50">
                  Select Account Type
                </span>
                {selectedRole === 'patient' && (
                  <span className="text-[10px] font-mono text-cyan-300 bg-cyan-500/15 border border-cyan-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <span className="material-symbols-outlined text-[12px]">lock</span>
                    Doctor-Enrolled ID Only
                  </span>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedRole('patient');
                    setAuthError('');
                  }}
                  className={`p-3.5 rounded-2xl border transition-all flex items-center gap-3 cursor-pointer text-left ${
                    selectedRole === 'patient'
                      ? 'bg-cyan-950/40 border-cyan-400 text-white shadow-[0_0_15px_rgba(34,211,238,0.2)]'
                      : 'bg-white/[0.02] border-white/10 text-white/60 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                      selectedRole === 'patient'
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                        : 'bg-white/5 text-white/40'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[20px]">badge</span>
                  </div>
                  <div>
                    <span className="font-bold text-xs font-mono block">Patient Portal</span>
                    <span className="text-[10px] text-cyan-300/80 block font-mono">Via Doctor ID</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedRole('doctor');
                    setAuthError('');
                  }}
                  className={`p-3.5 rounded-2xl border transition-all flex items-center gap-3 cursor-pointer text-left ${
                    selectedRole === 'doctor'
                      ? 'bg-purple-950/40 border-purple-400 text-white shadow-[0_0_15px_rgba(168,85,247,0.2)]'
                      : 'bg-white/[0.02] border-white/10 text-white/60 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                      selectedRole === 'doctor'
                        ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                        : 'bg-white/5 text-white/40'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[20px]">stethoscope</span>
                  </div>
                  <div>
                    <span className="font-bold text-xs font-mono block">Doctor Hub</span>
                    <span className="text-[10px] text-purple-300/80 block font-mono">Physician Access</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Error Banner if validation fails */}
            {authError && (
              <div className="mb-4 p-3.5 rounded-2xl bg-rose-950/60 border border-rose-500/50 text-rose-200 text-xs font-mono flex items-start gap-2.5 animate-fadeIn">
                <span className="material-symbols-outlined text-rose-400 text-[18px] shrink-0 mt-0.5">
                  error
                </span>
                <div className="flex-1">
                  <span>{authError}</span>
                </div>
              </div>
            )}

            {/* ======================================================== */}
            {/* VIEW 1: LOGIN FORM                                       */}
            {/* ======================================================== */}
            {authMode === 'login' && (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                {/* Patient-Specific Policy Guidance Banner */}
                {selectedRole === 'patient' && (
                  <div className="p-3.5 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 text-xs font-mono text-cyan-200 flex items-start gap-2.5">
                    <span className="material-symbols-outlined text-cyan-400 text-[20px] shrink-0 mt-0.5">
                      info
                    </span>
                    <div>
                      <strong className="text-white block font-bold">Doctor-Enrolled Access Notice</strong>
                      <span className="text-white/70 block mt-0.5">
                        Patients cannot self-register. Your attending physician enrolls you into SwRakshak and generates your unique Patient ID.
                      </span>
                    </div>
                  </div>
                )}

                {/* Identifier Input */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-mono font-medium text-white/70">
                      {selectedRole === 'doctor'
                        ? 'Doctor Email / Employee ID / Name'
                        : 'Doctor-Issued Patient ID'}
                    </label>
                    {selectedRole === 'patient' && (
                      <span className="text-[10px] font-mono text-cyan-400">
                        e.g. PID-99821, PID-84721
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40 text-[18px]">
                      {selectedRole === 'doctor' ? 'badge' : 'fingerprint'}
                    </span>
                    <input
                      type="text"
                      value={loginIdentifier}
                      onChange={(e) => {
                        setLoginIdentifier(e.target.value);
                        if (authError) setAuthError('');
                      }}
                      placeholder={
                        selectedRole === 'doctor'
                          ? 'e.g. Dr. Rajesh Sharma or DOC-9842'
                          : 'Enter your ID (e.g. PID-99821)'
                      }
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/15 text-white placeholder-white/30 text-xs sm:text-sm focus:outline-none focus:border-cyan-400 transition-colors"
                    />
                  </div>
                </div>

                {/* Password / PIN Input */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-mono font-medium text-white/70">
                      {selectedRole === 'doctor' ? 'Clinical PIN / Password' : 'Patient Security PIN'}
                    </label>
                    <span className="text-[11px] font-mono text-cyan-400 hover:text-cyan-300 cursor-pointer transition-colors">
                      {selectedRole === 'patient' ? 'Default PIN: 1234' : 'Forgot PIN?'}
                    </span>
                  </div>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40 text-[18px]">
                      lock
                    </span>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={loginPassword}
                      onChange={(e) => {
                        setLoginPassword(e.target.value);
                        if (authError) setAuthError('');
                      }}
                      placeholder={selectedRole === 'patient' ? '4-digit PIN (e.g. 1234)' : '••••••••'}
                      className="w-full pl-10 pr-11 py-3 rounded-xl bg-white/5 border border-white/15 text-white placeholder-white/30 text-xs sm:text-sm focus:outline-none focus:border-purple-400 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white text-[18px] cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        {showPassword ? 'visibility_off' : 'visibility'}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Remember Me Checkbox */}
                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-white/70">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded border-white/20 bg-white/10 text-purple-600 focus:ring-purple-500"
                    />
                    <span>Remember on this workstation</span>
                  </label>

                  <span className="text-[11px] font-mono text-white/40 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[13px] text-emerald-400">check_circle</span>
                    ABDM Encrypted
                  </span>
                </div>

                {/* Primary Submit Button */}
                <button
                  type="submit"
                  className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white font-mono font-bold text-xs sm:text-sm uppercase tracking-wider shadow-[0_10px_30px_rgba(147,51,234,0.4)] transition-all transform hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer mt-2"
                >
                  <span className="material-symbols-outlined text-[19px]">lock_open</span>
                  {selectedRole === 'doctor' ? 'Sign In as Physician' : 'Sign In with Patient ID'}
                </button>

                {/* Fast 1-Click Demo Profiles (Essential for Testing) */}
                <div className="pt-4 border-t border-white/10">
                  <span className="block text-[11px] font-mono uppercase text-white/50 mb-2.5 text-center">
                    {selectedRole === 'patient'
                      ? '⚡ Select an Enrolled Patient to Sign In Directly'
                      : '⚡ Fast 1-Click Physician Demo Access'}
                  </span>
                  
                  {selectedRole === 'doctor' ? (
                    <div className="grid grid-cols-2 gap-2">
                      {doctors.slice(0, 2).map((doc) => (
                        <button
                          key={doc.id}
                          type="button"
                          onClick={() => handleQuickLoginDoctor(doc)}
                          className="p-2.5 rounded-xl bg-white/[0.04] hover:bg-purple-900/30 border border-white/10 hover:border-purple-500/40 text-left transition-all cursor-pointer flex items-center gap-2.5"
                        >
                          <img
                            src={doc.avatarUrl}
                            alt={doc.name}
                            className="w-8 h-8 rounded-full object-cover border border-white/20 shrink-0"
                          />
                          <div className="overflow-hidden">
                            <span className="text-xs font-bold font-mono text-white block truncate">
                              {doc.name}
                            </span>
                            <span className="text-[10px] text-purple-300 block truncate">
                              {doc.department}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {patients.slice(0, 4).map((pat) => (
                          <button
                            key={pat.id}
                            type="button"
                            onClick={() => handleQuickLoginPatient(pat)}
                            className="p-2.5 rounded-xl bg-cyan-950/30 hover:bg-cyan-900/40 border border-cyan-500/20 hover:border-cyan-400 text-left transition-all cursor-pointer flex items-center gap-2.5 group"
                          >
                            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-300 font-mono font-bold text-xs flex items-center justify-center shrink-0 group-hover:bg-cyan-500/30">
                              {pat.name.charAt(0)}
                            </div>
                            <div className="overflow-hidden">
                              <span className="text-xs font-bold font-mono text-white block truncate">
                                {pat.name}
                              </span>
                              <span className="text-[10px] font-mono text-cyan-300 block truncate">
                                Login ID: <strong className="text-white">{pat.id}</strong> (PIN: 1234)
                              </span>
                            </div>
                          </button>
                        ))}
                      </div>
                      <p className="text-[10px] font-mono text-white/40 text-center pt-1">
                        Need an ID? Your attending doctor registers you via the Doctor Hub &gt; Add Patient.
                      </p>
                    </div>
                  )}
                </div>

                {/* Government / SSO Alternative */}
                <div className="pt-2 flex items-center justify-center gap-3 text-xs text-white/50">
                  <span className="text-[11px] font-mono">Government ABDM / ABHA Login Supported</span>
                </div>
              </form>
            )}

            {/* ======================================================== */}
            {/* VIEW 2: SIGN UP TAB                                      */}
            {/* If Patient: Show Policy (Cannot self-register)           */}
            {/* If Doctor: Show Physician Self-Registration Form         */}
            {/* ======================================================== */}
            {authMode === 'signup' && selectedRole === 'patient' && (
              <div className="space-y-5 py-1 animate-fadeIn">
                {/* Policy Notice Card */}
                <div className="p-6 rounded-3xl bg-cyan-950/40 border border-cyan-500/30 text-center space-y-3">
                  <div className="w-14 h-14 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 mx-auto flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.3)]">
                    <span className="material-symbols-outlined text-[32px]">shield_person</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-widest px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 font-bold">
                      CLINICAL POLICY • RESTRICTED ACCESS
                    </span>
                    <h2 className="text-xl font-bold font-mono text-white mt-2.5">
                      Patients Cannot Register Themselves
                    </h2>
                    <p className="text-xs sm:text-sm text-white/70 font-mono mt-2 leading-relaxed max-w-md mx-auto">
                      In accordance with hospital EHR security guidelines, all patient profiles in SwRakshak are registered by attending doctors during clinical consultations or hospital intake.
                    </p>
                  </div>
                </div>

                {/* 2-Step Enrollment Guidance */}
                <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-4 sm:p-5 space-y-3 text-xs font-mono">
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center justify-center shrink-0 font-bold">
                      1
                    </div>
                    <div>
                      <strong className="text-white block text-sm">Your Doctor Adds You</strong>
                      <span className="text-white/60 leading-relaxed block mt-0.5">
                        During your appointment, your physician creates your electronic health record and issues your unique <strong>Patient ID</strong> (e.g. <code>PID-99821</code>) and security PIN.
                      </span>
                    </div>
                  </div>

                  <div className="h-px bg-white/10 my-1"></div>

                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center justify-center shrink-0 font-bold">
                      2
                    </div>
                    <div>
                      <strong className="text-white block text-sm">Login with Your Issued ID</strong>
                      <span className="text-white/60 leading-relaxed block mt-0.5">
                        Return to SwRakshak anytime, enter your Patient ID and PIN to review prescriptions, track continuous vitals, and join video teleconsultations.
                      </span>
                    </div>
                  </div>
                </div>

                {/* Primary Action: Go to ID Login */}
                <div className="space-y-3 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('login');
                      setSelectedRole('patient');
                      setAuthError('');
                    }}
                    className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-cyan-600 via-indigo-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white font-mono font-bold text-xs sm:text-sm uppercase tracking-wider shadow-[0_10px_30px_rgba(6,182,212,0.4)] transition-all cursor-pointer flex items-center justify-center gap-2.5 hover:scale-[1.01] active:scale-[0.99]"
                  >
                    <span className="material-symbols-outlined text-[20px]">badge</span>
                    <span>Sign In with Doctor-Issued Patient ID</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedRole('doctor');
                      setAuthError('');
                    }}
                    className="w-full py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white font-mono text-xs transition-colors cursor-pointer text-center flex items-center justify-center gap-1.5"
                  >
                    <span>Are you an Attending Physician? Register Doctor Profile</span>
                    <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                  </button>
                </div>

                {/* Quick Enrolled Patient Demo Access */}
                <div className="pt-4 border-t border-white/10">
                  <span className="block text-[11px] font-mono text-white/50 uppercase tracking-wider text-center mb-3">
                    ⚡ Or Sign In as an Already Enrolled Patient
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {patients.slice(0, 4).map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => handleQuickLoginPatient(p)}
                        className="p-3 rounded-xl bg-cyan-950/30 hover:bg-cyan-900/50 border border-cyan-500/20 hover:border-cyan-400 text-left transition-all cursor-pointer flex items-center gap-2.5 group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-300 font-mono font-bold text-xs flex items-center justify-center shrink-0 group-hover:bg-cyan-500/30">
                          {p.name.charAt(0)}
                        </div>
                        <div className="overflow-hidden">
                          <span className="text-xs font-bold font-mono text-white block truncate">
                            {p.name}
                          </span>
                          <span className="text-[10px] font-mono text-cyan-300 block truncate">
                            ID: <strong className="text-white">{p.id}</strong> (PIN: 1234)
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Doctor Self-Registration Form */}
            {authMode === 'signup' && selectedRole === 'doctor' && (
              <form onSubmit={handleSignupSubmit} className="space-y-4 animate-fadeIn">
                <div className="p-3 rounded-xl bg-purple-950/40 border border-purple-500/30 text-xs font-mono text-purple-200 flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-purple-400 text-[18px] shrink-0">
                    verified_user
                  </span>
                  <span>Physician & Clinical Specialist Self-Registration</span>
                </div>

                {/* Full Name */}
                <div>
                  <label className="block text-xs font-mono font-medium text-white/70 mb-1.5">
                    Full Name & Title
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40 text-[18px]">
                      person
                    </span>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Dr. Ananya Roy, MD"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white placeholder-white/30 text-xs sm:text-sm focus:outline-none focus:border-purple-400 transition-colors"
                    />
                  </div>
                </div>

                {/* Contact: Email & Phone Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-mono font-medium text-white/70 mb-1.5">
                      Professional Email
                    </label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40 text-[18px]">
                        mail
                      </span>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="doctor@swrakshak.health"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white placeholder-white/30 text-xs focus:outline-none focus:border-purple-400 transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-mono font-medium text-white/70 mb-1.5">
                      Mobile Number
                    </label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40 text-[18px]">
                        phone
                      </span>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+91 98765-43210"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white placeholder-white/30 text-xs focus:outline-none focus:border-purple-400 transition-colors"
                      />
                    </div>
                  </div>
                </div>

                {/* Doctor Department & MCI */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-2xl bg-purple-950/30 border border-purple-500/20">
                  <div>
                    <label className="block text-[11px] font-mono text-purple-200 mb-1">
                      Department / Specialization
                    </label>
                    <input
                      type="text"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      placeholder="Cardiology / Internal Med"
                      className="w-full px-3 py-2 rounded-lg bg-black/40 border border-purple-500/30 text-white text-xs focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono text-purple-200 mb-1">
                      MCI / State Medical Reg. No.
                    </label>
                    <input
                      type="text"
                      value={mciNumber}
                      onChange={(e) => setMciNumber(e.target.value)}
                      placeholder="MCI/2024/77890"
                      className="w-full px-3 py-2 rounded-lg bg-black/40 border border-purple-500/30 text-white text-xs focus:outline-none"
                    />
                  </div>
                </div>

                {/* Password & Confirm Password */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-mono font-medium text-white/70 mb-1">
                      Set Password / PIN
                    </label>
                    <input
                      type="password"
                      required
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/15 text-white text-xs focus:outline-none focus:border-purple-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono font-medium text-white/70 mb-1">
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/15 text-white text-xs focus:outline-none focus:border-purple-400"
                    />
                  </div>
                </div>

                {/* Consent & HIPAA agreement */}
                <label className="flex items-start gap-2.5 cursor-pointer text-[11px] text-white/70 pt-1">
                  <input
                    type="checkbox"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    className="mt-0.5 rounded border-white/20 bg-white/10 text-purple-600 focus:ring-purple-500 shrink-0"
                  />
                  <span>
                    I certify that I am a licensed medical practitioner and agree to SwRakshak Telemedicine Practice Guidelines and HIPAA compliance.
                  </span>
                </label>

                {/* Create Account Submit Button */}
                <button
                  type="submit"
                  className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white font-mono font-bold text-xs sm:text-sm uppercase tracking-wider shadow-[0_10px_30px_rgba(147,51,234,0.4)] transition-all transform hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer mt-2"
                >
                  <span className="material-symbols-outlined text-[19px]">how_to_reg</span>
                  Complete Physician Registration
                </button>
              </form>
            )}

            {/* Bottom Help / Cancellation */}
            <div className="mt-6 pt-4 border-t border-white/10 text-center">
              <button
                type="button"
                onClick={onCancel}
                className="text-xs font-mono text-white/50 hover:text-white transition-colors cursor-pointer"
              >
                ← Return to Clinical Dashboard (Guest Mode)
              </button>
            </div>

          </div>
        </div>
      </main>

      {/* REUSABLE RICH COMPANY FOOTER WITH FULL ADDRESS, MAIL INFO, HELPLINES */}
      <CompanyFooter onOpenAuth={() => window.scrollTo({ top: 0, behavior: 'smooth' })} />
    </div>
  );
};
