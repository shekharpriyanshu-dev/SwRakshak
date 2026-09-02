import React, { useState, useEffect, useRef } from 'react';
import { Patient, DoctorProfile, VideoConsultationSession } from '../types';

interface VideoConsultationModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient;
  currentDoctor?: DoctorProfile;
  isDoctorMode?: boolean;
  showToast: (msg: string) => void;
  onCompleteConsultation?: (session: VideoConsultationSession) => void;
}

interface ChatMessage {
  id: string;
  sender: 'doctor' | 'patient';
  senderName: string;
  time: string;
  text: string;
}

export const VideoConsultationModal: React.FC<VideoConsultationModalProps> = ({
  isOpen,
  onClose,
  patient,
  currentDoctor,
  isDoctorMode = false,
  showToast,
  onCompleteConsultation,
}) => {
  // Call States
  const [callStatus, setCallStatus] = useState<'connecting' | 'connected' | 'ended'>('connecting');
  const [callDuration, setCallDuration] = useState(0);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCamOn, setIsCamOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [activeSidePanel, setActiveSidePanel] = useState<'chat' | 'vitals' | 'notes' | 'none'>('chat');
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);

  // Chat State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'm-1',
      sender: 'doctor',
      senderName: currentDoctor?.name || 'Dr. Rajesh Sharma',
      time: 'Just now',
      text: `Hello ${patient.name}, thank you for joining the secure SwRakshak video consult. How are you feeling today?`,
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');

  // Doctor Notes State
  const [doctorNotes, setDoctorNotes] = useState(
    `Patient attended tele-consult from home. Reviewed recent vitals (${patient.vitals.bloodPressure.value} mmHg, HR ${patient.vitals.heartRate.value} bpm). General condition stable.`
  );
  const [rxNotes, setRxNotes] = useState('Continue regular prescribed medications. Re-check BP in 1 week.');

  // Video Refs
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  // Connection timer
  useEffect(() => {
    if (!isOpen) return;

    setCallStatus('connecting');
    setCallDuration(0);

    const connectTimer = setTimeout(() => {
      setCallStatus('connected');
      showToast('Encrypted Telehealth Room connected (HD Audio/Video) 🔒');
    }, 1200);

    return () => clearTimeout(connectTimer);
  }, [isOpen]);

  // Call duration counter
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isOpen && callStatus === 'connected') {
      interval = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isOpen, callStatus]);

  // Access user camera stream
  useEffect(() => {
    if (!isOpen) return;

    async function startCamera() {
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { width: { ideal: 640 }, height: { ideal: 480 } },
            audio: true,
          });
          localStreamRef.current = stream;
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = stream;
          }
          setHasCameraPermission(true);
        } else {
          setHasCameraPermission(false);
        }
      } catch (err) {
        console.warn('Camera/Mic permission not granted or unavailable, using high-definition simulation stream.', err);
        setHasCameraPermission(false);
      }
    }

    startCamera();

    return () => {
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => track.stop());
        localStreamRef.current = null;
      }
    };
  }, [isOpen]);

  // Toggle mic
  const toggleMic = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach((track) => {
        track.enabled = !isMicOn;
      });
    }
    setIsMicOn(!isMicOn);
    showToast(isMicOn ? 'Microphone muted 🔇' : 'Microphone unmuted 🎙️');
  };

  // Toggle camera
  const toggleCam = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getVideoTracks().forEach((track) => {
        track.enabled = !isCamOn;
      });
    }
    setIsCamOn(!isCamOn);
    showToast(isCamOn ? 'Camera turned off 🚫' : 'Camera turned on 📹');
  };

  // Send message
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: isDoctorMode ? 'doctor' : 'patient',
      senderName: isDoctorMode
        ? currentDoctor?.name || 'Dr. Rajesh Sharma'
        : patient.name,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: inputMessage.trim(),
    };

    setChatMessages((prev) => [...prev, newMsg]);
    setInputMessage('');

    // Simulate doctor auto-reply if in patient mode
    if (!isDoctorMode) {
      setTimeout(() => {
        const replyMsg: ChatMessage = {
          id: `msg-${Date.now() + 1}`,
          sender: 'doctor',
          senderName: currentDoctor?.name || 'Dr. Rajesh Sharma',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          text: `Acknowledged, ${patient.name.split(' ')[0]}. I have reviewed that point and noted it in your tele-consult summary.`,
        };
        setChatMessages((prev) => [...prev, replyMsg]);
      }, 1500);
    }
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleEndCall = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }

    const session: VideoConsultationSession = {
      id: `v-session-${Date.now()}`,
      patientId: patient.id,
      patientName: patient.name,
      doctorId: currentDoctor?.id || 'doc-1',
      doctorName: currentDoctor?.name || 'Dr. Rajesh Sharma',
      doctorSpecialty: currentDoctor?.specialty || 'General Cardiology & Tele-Care',
      scheduledTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'Completed',
      roomCode: `SWR-${Math.floor(1000 + Math.random() * 9000)}`,
      durationMinutes: Math.max(1, Math.round(callDuration / 60)),
      consultationSummary: doctorNotes,
      prescriptionsGiven: [rxNotes],
    };

    if (onCompleteConsultation) {
      onCompleteConsultation(session);
    }

    setCallStatus('ended');
    showToast(`Consultation ended. Telehealth summary generated for ${patient.name} 📋`);
    onClose();
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-lg flex flex-col justify-between overflow-hidden animate-fadeIn">
      {/* Top Header Bar */}
      <div className="w-full bg-[#0a0d18]/90 border-b border-white/10 px-4 md:px-6 py-3 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-purple-600 to-orange-400 p-0.5 flex items-center justify-center">
            <div className="w-full h-full rounded-full bg-[#0a050b] flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-[18px]">videocam</span>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm md:text-base font-bold text-white font-mono">
                SwRakshak Tele-Care Room
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                LIVE ENCRYPTED
              </span>
            </div>
            <p className="text-[11px] font-mono text-white/50">
              {isDoctorMode
                ? `Patient: ${patient.name} (${patient.id}) • Room Code: SWR-8821`
                : `Doctor: ${currentDoctor?.name || 'Dr. Rajesh Sharma'} • ${currentDoctor?.specialty || 'Cardiologist'}`}
            </p>
          </div>
        </div>

        {/* Duration & Status */}
        <div className="flex items-center gap-3">
          <div className="bg-white/10 border border-white/10 rounded-full px-3 py-1 text-xs font-mono text-white font-bold flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[14px] text-red-400 animate-pulse">timer</span>
            {formatDuration(callDuration)}
          </div>

          <button
            onClick={handleEndCall}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
            title="Leave Call"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>
      </div>

      {/* Main Video Stage */}
      <div className="flex-1 relative flex flex-col md:flex-row p-3 md:p-4 gap-3 overflow-hidden">
        {/* Video Canvas Area */}
        <div className="flex-1 relative rounded-2xl md:rounded-[28px] overflow-hidden bg-gradient-to-b from-[#0e172a] to-[#080d1a] border border-white/10 shadow-2xl flex items-center justify-center">
          {/* Main Remote Feed */}
          {callStatus === 'connecting' ? (
            <div className="text-center space-y-3">
              <div className="w-16 h-16 rounded-full border-4 border-purple-500 border-t-transparent animate-spin mx-auto"></div>
              <p className="text-sm font-mono text-white/80">Connecting secure encrypted stream...</p>
            </div>
          ) : (
            <div className="w-full h-full relative flex items-center justify-center bg-black/40">
              {/* Doctor / Remote Participant Visual */}
              <div className="relative w-full h-full flex flex-col items-center justify-center p-6 text-center">
                {/* Simulated Remote Video Avatar with Pulse Wave */}
                <div className="relative mb-4">
                  <div className="w-32 h-32 md:w-44 md:h-44 rounded-full p-1 bg-gradient-to-tr from-purple-500 via-indigo-500 to-orange-400 shadow-[0_0_40px_rgba(168,85,247,0.3)] animate-pulse">
                    <img
                      src={
                        isDoctorMode
                          ? patient.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400'
                          : currentDoctor?.avatarUrl ||
                            'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400'
                      }
                      alt="Remote Feed"
                      className="w-full h-full rounded-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <span className="absolute bottom-2 right-2 w-6 h-6 rounded-full bg-emerald-500 border-2 border-black flex items-center justify-center text-[11px] text-white">
                    <span className="material-symbols-outlined text-[14px]">mic</span>
                  </span>
                </div>

                <h3 className="text-lg md:text-xl font-bold text-white font-mono">
                  {isDoctorMode ? patient.name : currentDoctor?.name || 'Dr. Rajesh Sharma'}
                </h3>
                <p className="text-xs font-mono text-purple-300">
                  {isDoctorMode ? `Age: ${patient.age} • ${patient.gender}` : 'Consulting Physician • SwRakshak Provider Platform'}
                </p>

                {/* Simulated Audio Visualizer Wave */}
                <div className="flex items-center gap-1 mt-4">
                  {[24, 40, 18, 52, 32, 44, 20, 36, 48, 16].map((h, i) => (
                    <div
                      key={i}
                      style={{ height: `${h}px` }}
                      className="w-1 bg-gradient-to-t from-purple-500 to-orange-400 rounded-full animate-pulse"
                    />
                  ))}
                </div>

                {/* Floating Vitals HUD on Video */}
                <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md border border-white/15 rounded-xl p-3 text-left space-y-1 text-xs font-mono hidden sm:block">
                  <span className="text-[10px] text-white/50 uppercase font-bold tracking-wider block">
                    Patient Live Telemetry
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">speed</span>
                      BP {patient.vitals.bloodPressure.value}
                    </span>
                    <span className="text-red-400 font-bold flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">favorite</span>
                      HR {patient.vitals.heartRate.value} bpm
                    </span>
                    <span className="text-cyan-400 font-bold flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">air</span>
                      SpO2 {patient.vitals.spO2.value}%
                    </span>
                  </div>
                </div>

                {/* Screen Share Overlay if active */}
                {isScreenSharing && (
                  <div className="absolute inset-0 bg-[#070b14]/95 backdrop-blur-lg p-6 flex flex-col justify-between overflow-y-auto animate-fadeIn">
                    <div className="flex items-center justify-between border-b border-white/10 pb-3">
                      <div className="flex items-center gap-2 text-cyan-300 font-mono text-xs font-bold">
                        <span className="material-symbols-outlined text-[16px]">screen_share</span>
                        Shared Clinical Chart & Home Diagnostics
                      </div>
                      <button
                        onClick={() => setIsScreenSharing(false)}
                        className="text-xs font-mono text-white/60 hover:text-white px-2 py-1 rounded bg-white/10"
                      >
                        Exit Screen Share
                      </button>
                    </div>

                    <div className="my-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-left font-mono">
                      <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-2">
                        <span className="text-xs text-purple-300 font-bold block">Current Patient Profile:</span>
                        <p className="text-xs text-white/80">{patient.name} ({patient.id}) • {patient.age}y {patient.gender}</p>
                        <p className="text-xs text-white/60">Blood Group: {patient.bloodType} • Allergies: {patient.allergies?.join(', ') || 'None'}</p>
                      </div>

                      <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-2">
                        <span className="text-xs text-emerald-300 font-bold block">Latest Lab Report:</span>
                        <p className="text-xs text-white/80">Fasting Blood Sugar: 138 mg/dL (Target: &lt; 120)</p>
                        <p className="text-xs text-white/60">HbA1c: 6.8% • Total Cholesterol: 195 mg/dL</p>
                      </div>
                    </div>

                    <p className="text-[11px] font-mono text-white/40 text-center">
                      Co-viewing session synced between Doctor and Patient
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Self View (Picture in Picture) */}
          <div className="absolute bottom-4 right-4 w-28 h-28 sm:w-40 sm:h-32 rounded-2xl overflow-hidden border-2 border-purple-500/50 shadow-2xl bg-black z-20">
            {hasCameraPermission && isCamOn ? (
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover transform -scale-x-100"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-gray-900 text-white/70 p-2 text-center">
                <span className="material-symbols-outlined text-2xl text-purple-400">
                  {isCamOn ? 'account_circle' : 'videocam_off'}
                </span>
                <span className="text-[10px] font-mono mt-1">
                  {isCamOn ? 'You (Self Cam)' : 'Camera Off'}
                </span>
              </div>
            )}
            <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-black/60 text-[9px] font-mono text-white font-bold">
              You {!isMicOn && '• Muted'}
            </div>
          </div>
        </div>

        {/* Right Side Panel (Chat / Vitals / Notes) */}
        {activeSidePanel !== 'none' && (
          <div className="w-full md:w-80 lg:w-96 bg-[#0c101d] border border-white/10 rounded-2xl md:rounded-[28px] p-4 flex flex-col shadow-2xl backdrop-blur-xl">
            {/* Panel Tabs */}
            <div className="flex items-center justify-between border-b border-white/10 pb-2.5 mb-3">
              <div className="flex items-center gap-1 font-mono text-xs">
                <button
                  onClick={() => setActiveSidePanel('chat')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                    activeSidePanel === 'chat'
                      ? 'bg-purple-600 text-white'
                      : 'text-white/60 hover:text-white'
                  }`}
                >
                  Chat ({chatMessages.length})
                </button>
                <button
                  onClick={() => setActiveSidePanel('vitals')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                    activeSidePanel === 'vitals'
                      ? 'bg-purple-600 text-white'
                      : 'text-white/60 hover:text-white'
                  }`}
                >
                  Vitals
                </button>
                <button
                  onClick={() => setActiveSidePanel('notes')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                    activeSidePanel === 'notes'
                      ? 'bg-purple-600 text-white'
                      : 'text-white/60 hover:text-white'
                  }`}
                >
                  Notes & Rx
                </button>
              </div>

              <button
                onClick={() => setActiveSidePanel('none')}
                className="text-white/40 hover:text-white"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            {/* TAB 1: CHAT */}
            {activeSidePanel === 'chat' && (
              <div className="flex-1 flex flex-col justify-between overflow-hidden">
                <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                  {chatMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${
                        msg.sender === (isDoctorMode ? 'doctor' : 'patient')
                          ? 'items-end'
                          : 'items-start'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="text-[10px] font-mono text-white/40">
                          {msg.senderName}
                        </span>
                        <span className="text-[9px] font-mono text-white/30">{msg.time}</span>
                      </div>
                      <div
                        className={`p-3 rounded-2xl text-xs max-w-[85%] font-mono leading-relaxed ${
                          msg.sender === (isDoctorMode ? 'doctor' : 'patient')
                            ? 'bg-purple-600 text-white rounded-tr-none'
                            : 'bg-white/10 text-white/90 rounded-tl-none border border-white/10'
                        }`}
                      >
                        {msg.text}
                      </div>
                    </div>
                  ))}
                  <div ref={chatEndRef} />
                </div>

                <form onSubmit={handleSendMessage} className="pt-3 border-t border-white/10 flex gap-2">
                  <input
                    type="text"
                    placeholder="Type message to doctor..."
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    className="flex-1 bg-white/5 border border-white/15 focus:border-purple-400 rounded-xl px-3 py-2 text-xs text-white placeholder:text-white/30 focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="w-9 h-9 rounded-xl bg-purple-600 hover:bg-purple-500 text-white flex items-center justify-center shrink-0 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">send</span>
                  </button>
                </form>
              </div>
            )}

            {/* TAB 2: LIVE VITALS TELEMETRY */}
            {activeSidePanel === 'vitals' && (
              <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs font-mono">
                <div className="bg-white/5 border border-white/10 rounded-xl p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-white/60">Blood Pressure</span>
                    <span className="text-emerald-400 font-bold">{patient.vitals.bloodPressure.value} mmHg</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/60">Heart Rate</span>
                    <span className="text-red-400 font-bold">{patient.vitals.heartRate.value} bpm</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/60">SpO2 (Oxygen)</span>
                    <span className="text-cyan-400 font-bold">{patient.vitals.spO2.value}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/60">Body Weight</span>
                    <span className="text-orange-400 font-bold">{patient.vitals.weight.value} kg</span>
                  </div>
                </div>

                <div className="bg-purple-950/20 border border-purple-500/30 rounded-xl p-3 space-y-1">
                  <span className="text-[10px] text-purple-300 font-bold uppercase">Allergies & Alerts</span>
                  <p className="text-white/80">
                    {patient.allergies && patient.allergies.length > 0
                      ? patient.allergies.join(', ')
                      : 'No known drug allergies reported.'}
                  </p>
                </div>
              </div>
            )}

            {/* TAB 3: NOTES & RX */}
            {activeSidePanel === 'notes' && (
              <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs font-mono">
                <div>
                  <label className="text-white/70 block mb-1 font-bold">Clinical Telehealth Notes</label>
                  <textarea
                    rows={4}
                    value={doctorNotes}
                    onChange={(e) => setDoctorNotes(e.target.value)}
                    className="w-full bg-white/5 border border-white/15 focus:border-purple-400 rounded-xl p-2.5 text-white placeholder:text-white/30 focus:outline-none resize-none text-xs"
                  />
                </div>

                <div>
                  <label className="text-white/70 block mb-1 font-bold">Prescription & Advice Given</label>
                  <textarea
                    rows={3}
                    value={rxNotes}
                    onChange={(e) => setRxNotes(e.target.value)}
                    className="w-full bg-white/5 border border-white/15 focus:border-purple-400 rounded-xl p-2.5 text-white placeholder:text-white/30 focus:outline-none resize-none text-xs"
                  />
                </div>

                <button
                  onClick={() => showToast('Prescription signed and transmitted to patient')}
                  className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">prescription</span>
                  Transmit e-Prescription
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom Control Bar */}
      <div className="w-full bg-[#0a0d18]/95 border-t border-white/10 px-4 md:px-8 py-3.5 flex items-center justify-between z-10">
        <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-white/50">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          SwRakshak Tele-Care Gateway v3.4 • HD WebRTC
        </div>

        {/* Center Main Action Buttons */}
        <div className="flex items-center gap-2.5 md:gap-4 mx-auto sm:mx-0">
          {/* Mic Button */}
          <button
            onClick={toggleMic}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-lg ${
              isMicOn
                ? 'bg-white/15 hover:bg-white/25 text-white border border-white/20'
                : 'bg-red-600 hover:bg-red-500 text-white'
            }`}
            title={isMicOn ? 'Mute Mic' : 'Unmute Mic'}
          >
            <span className="material-symbols-outlined text-[20px]">
              {isMicOn ? 'mic' : 'mic_off'}
            </span>
          </button>

          {/* Cam Button */}
          <button
            onClick={toggleCam}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-lg ${
              isCamOn
                ? 'bg-white/15 hover:bg-white/25 text-white border border-white/20'
                : 'bg-red-600 hover:bg-red-500 text-white'
            }`}
            title={isCamOn ? 'Turn Off Camera' : 'Turn On Camera'}
          >
            <span className="material-symbols-outlined text-[20px]">
              {isCamOn ? 'videocam' : 'videocam_off'}
            </span>
          </button>

          {/* Screen Share / Co-View */}
          <button
            onClick={() => {
              setIsScreenSharing(!isScreenSharing);
              showToast(isScreenSharing ? 'Screen share closed' : 'Sharing clinical chart in video call 🖥️');
            }}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-lg ${
              isScreenSharing
                ? 'bg-cyan-600 text-white shadow-cyan-900/50'
                : 'bg-white/15 hover:bg-white/25 text-white border border-white/20'
            }`}
            title="Co-View Clinical Records / Screen"
          >
            <span className="material-symbols-outlined text-[20px]">screen_share</span>
          </button>

          {/* Side Panel Toggle */}
          <button
            onClick={() =>
              setActiveSidePanel((prev) => (prev === 'none' ? 'chat' : 'none'))
            }
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-lg ${
              activeSidePanel !== 'none'
                ? 'bg-purple-600 text-white'
                : 'bg-white/15 hover:bg-white/25 text-white border border-white/20'
            }`}
            title="Toggle In-Call Panel"
          >
            <span className="material-symbols-outlined text-[20px]">chat</span>
          </button>

          {/* End Call Button */}
          <button
            onClick={handleEndCall}
            className="px-5 h-12 rounded-full bg-red-600 hover:bg-red-500 text-white font-mono font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-xl shadow-red-900/50 hover:scale-105 active:scale-95 transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">call_end</span>
            <span className="hidden sm:inline">End Consultation</span>
          </button>
        </div>

        <div className="hidden lg:flex items-center gap-2">
          <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
            End-to-End Encrypted
          </span>
        </div>
      </div>
    </div>
  );
};
