import React, { useState, useEffect } from 'react';
import { Patient, MedicineAlarm, Medication } from '../types';
import { medicalAudioAlert } from '../utils/audioAlert';

interface MedicineAlarmViewProps {
  patient: Patient;
  showToast: (msg: string) => void;
}

export const MedicineAlarmView: React.FC<MedicineAlarmViewProps> = ({ patient, showToast }) => {
  // Generate initial alarms based on patient's medications or defaults
  const [alarms, setAlarms] = useState<MedicineAlarm[]>(() => {
    const saved = localStorage.getItem(`swrakshak_alarms_${patient.id}`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }

    if (patient.medications && patient.medications.length > 0) {
      return patient.medications.map((med, index) => {
        let slot: 'Morning' | 'Afternoon' | 'Evening' | 'Night' = 'Morning';
        let time = '08:00 AM';

        const inst = (med.instructions + ' ' + med.frequency).toLowerCase();
        if (inst.includes('night') || inst.includes('bedtime') || inst.includes('dinner')) {
          slot = 'Night';
          time = '09:30 PM';
        } else if (inst.includes('afternoon') || inst.includes('lunch')) {
          slot = 'Afternoon';
          time = '01:30 PM';
        } else if (inst.includes('evening') || inst.includes('tea')) {
          slot = 'Evening';
          time = '06:00 PM';
        } else {
          slot = 'Morning';
          time = index % 2 === 0 ? '08:00 AM' : '08:30 AM';
        }

        return {
          id: `alarm-${med.id || index}-${Date.now()}`,
          medicineId: med.id,
          medicineName: med.name,
          dosage: med.dosage,
          slot,
          time,
          instructions: med.instructions || 'Take with water after meal',
          isEnabled: true,
          isTakenToday: index === 0, // mock first taken
          takenAt: index === 0 ? '08:15 AM' : undefined,
        };
      });
    }

    // Default sample Indian medicine alarms
    return [
      {
        id: 'alarm-def-1',
        medicineName: 'Pan 40 (Pantoprazole)',
        dosage: '40 mg',
        slot: 'Morning',
        time: '07:30 AM',
        instructions: 'Take 30 minutes before breakfast with plain water',
        isEnabled: true,
        isTakenToday: true,
        takenAt: '07:32 AM',
      },
      {
        id: 'alarm-def-2',
        medicineName: 'Vitamin D3 (Cholecalciferol)',
        dosage: '60,000 IU',
        slot: 'Morning',
        time: '09:00 AM',
        instructions: 'Take after breakfast with milk or healthy fat meal',
        isEnabled: true,
        isTakenToday: false,
      },
      {
        id: 'alarm-def-3',
        medicineName: 'Combiflam / Pain Relief',
        dosage: '400mg / 325mg',
        slot: 'Afternoon',
        time: '01:30 PM',
        instructions: 'Take strictly after lunch if discomfort persists',
        isEnabled: true,
        isTakenToday: false,
      },
    ];
  });

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem(`swrakshak_alarms_${patient.id}`, JSON.stringify(alarms));
  }, [alarms, patient.id]);

  // Modal for adding new alarm
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newMedName, setNewMedName] = useState('');
  const [newDosage, setNewDosage] = useState('');
  const [newSlot, setNewSlot] = useState<'Morning' | 'Afternoon' | 'Evening' | 'Night'>('Morning');
  const [newTime, setNewTime] = useState('08:00 AM');
  const [newInstructions, setNewInstructions] = useState('');

  // Active filter
  const [selectedSlotFilter, setSelectedSlotFilter] = useState<string>('ALL');

  const takenCount = alarms.filter((a) => a.isTakenToday).length;
  const adherencePercent = alarms.length > 0 ? Math.round((takenCount / alarms.length) * 100) : 0;

  const handleToggleAlarm = (id: string) => {
    setAlarms((prev) =>
      prev.map((a) => {
        if (a.id === id) {
          const nextState = !a.isEnabled;
          showToast(`Alarm for ${a.medicineName} ${nextState ? 'Activated ⏰' : 'Muted 🔕'}`);
          return { ...a, isEnabled: nextState };
        }
        return a;
      })
    );
  };

  const handleMarkTaken = (id: string) => {
    medicalAudioAlert.playCheckPing();
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setAlarms((prev) =>
      prev.map((a) => {
        if (a.id === id) {
          const nextTaken = !a.isTakenToday;
          showToast(
            nextTaken
              ? `Logged: ${a.medicineName} (${a.dosage}) taken at ${now} ✅`
              : `Unmarked ${a.medicineName}`
          );
          return {
            ...a,
            isTakenToday: nextTaken,
            takenAt: nextTaken ? now : undefined,
          };
        }
        return a;
      })
    );
  };

  const handleTestAlarmSound = () => {
    medicalAudioAlert.playMedicineChime();
    showToast('Playing gentle medical reminder chime 🔔');
  };

  const handleSnooze = (medicineName: string) => {
    showToast(`Snoozed alarm for ${medicineName} by 15 minutes ⏳`);
  };

  const handleDeleteAlarm = (id: string) => {
    setAlarms((prev) => prev.filter((a) => a.id !== id));
    showToast('Alarm removed from schedule.');
  };

  const handleCreateAlarm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMedName.trim()) {
      showToast('Please enter medicine name');
      return;
    }

    const created: MedicineAlarm = {
      id: `alarm-${Date.now()}`,
      medicineName: newMedName.trim(),
      dosage: newDosage.trim() || '1 Tablet',
      slot: newSlot,
      time: newTime,
      instructions: newInstructions.trim() || 'Take with water as directed',
      isEnabled: true,
      isTakenToday: false,
    };

    setAlarms((prev) => [...prev, created]);
    medicalAudioAlert.playCheckPing();
    showToast(`Alarm set for ${created.medicineName} at ${created.time} ⏰`);
    setIsAddModalOpen(false);
    setNewMedName('');
    setNewDosage('');
    setNewInstructions('');
  };

  const filteredAlarms = alarms.filter((a) => {
    if (selectedSlotFilter === 'ALL') return true;
    return a.slot === selectedSlotFilter;
  });

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header Banner */}
      <section className="bg-gradient-to-r from-purple-950/60 via-[#190d24] to-cyan-950/50 border border-purple-500/20 rounded-[28px] p-6 md:p-8 shadow-2xl backdrop-blur-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full text-[11px] font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                दवा अनुस्मारक • MEDICINE TIME ALARM
              </span>
              <span className="text-xs font-mono text-white/50">Active Tracker for {patient.name}</span>
            </div>
            <h1 className="font-headline-lg text-2xl md:text-3xl font-bold text-white tracking-tight">
              Medicine Schedule & Adherence Alarms
            </h1>
            <p className="text-sm text-white/70 mt-1 max-w-2xl">
              Never miss a dose. Real-time audio alerts and daily tracking ensure you adhere strictly to your clinical treatment protocol.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0 flex-wrap">
            <button
              onClick={handleTestAlarmSound}
              className="px-4 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white font-mono text-xs font-bold uppercase tracking-wider border border-white/20 flex items-center gap-2 transition-all cursor-pointer shadow-md hover:scale-105"
            >
              <span className="material-symbols-outlined text-[18px] text-amber-300">notifications_active</span>
              Test Alarm Sound
            </button>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2.5 rounded-full bg-purple-600 hover:bg-purple-500 text-white font-mono text-xs font-bold uppercase tracking-wider shadow-[0_0_20px_rgba(168,85,247,0.4)] flex items-center gap-2 transition-all cursor-pointer hover:scale-105"
            >
              <span className="material-symbols-outlined text-[18px]">add_alarm</span>
              Add Custom Alarm
            </button>
          </div>
        </div>

        {/* Adherence Progress Bar */}
        <div className="mt-6 pt-5 border-t border-white/10">
          <div className="flex items-center justify-between text-xs font-mono mb-2">
            <span className="text-white/70 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-emerald-400">task_alt</span>
              Today's Medication Adherence: <strong className="text-white">{takenCount} of {alarms.length} Taken</strong>
            </span>
            <span className="text-emerald-300 font-bold">{adherencePercent}% Completed</span>
          </div>
          <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden p-0.5 border border-white/10">
            <div
              className="h-full bg-gradient-to-r from-purple-500 via-emerald-400 to-cyan-400 rounded-full transition-all duration-500 shadow-[0_0_12px_rgba(52,211,153,0.5)]"
              style={{ width: `${adherencePercent}%` }}
            ></div>
          </div>
        </div>
      </section>

      {/* Time Slot Filter Pills */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {['ALL', 'Morning', 'Afternoon', 'Evening', 'Night'].map((slot) => (
            <button
              key={slot}
              onClick={() => setSelectedSlotFilter(slot)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap border ${
                selectedSlotFilter === slot
                  ? 'bg-purple-500/30 text-purple-200 border-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.3)]'
                  : 'bg-white/5 text-white/60 hover:text-white border-white/10'
              }`}
            >
              {slot === 'ALL' ? 'All Daily Alarms' : `${slot} Doses`}
            </button>
          ))}
        </div>

        <span className="text-xs font-mono text-white/50">
          Showing {filteredAlarms.length} Scheduled Dose{filteredAlarms.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Alarms Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredAlarms.map((alarm) => (
          <div
            key={alarm.id}
            className={`border rounded-2xl p-5 transition-all shadow-xl backdrop-blur-xl relative overflow-hidden ${
              alarm.isTakenToday
                ? 'bg-emerald-950/20 border-emerald-500/30'
                : alarm.isEnabled
                ? 'bg-white/[0.04] border-white/15 hover:border-purple-500/40'
                : 'bg-white/[0.02] border-white/5 opacity-60'
            }`}
          >
            {/* Slot indicator banner */}
            <div className="flex items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-2">
                <span
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold flex items-center gap-1 ${
                    alarm.slot === 'Morning'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : alarm.slot === 'Afternoon'
                      ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30'
                      : alarm.slot === 'Evening'
                      ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                      : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                  }`}
                >
                  <span className="material-symbols-outlined text-[14px]">
                    {alarm.slot === 'Morning'
                      ? 'wb_sunny'
                      : alarm.slot === 'Afternoon'
                      ? 'wb_twilight'
                      : alarm.slot === 'Evening'
                      ? 'filter_drama'
                      : 'bedtime'}
                  </span>
                  {alarm.slot}
                </span>

                <div className="flex items-center gap-1.5 text-base font-bold font-mono text-white">
                  <span className="material-symbols-outlined text-[18px] text-purple-400">alarm</span>
                  {alarm.time}
                </div>
              </div>

              {/* Alarm ON/OFF Switch */}
              <button
                onClick={() => handleToggleAlarm(alarm.id)}
                className={`flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-mono font-bold transition-all cursor-pointer border ${
                  alarm.isEnabled
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : 'bg-white/5 text-white/40 border-white/10'
                }`}
                title={alarm.isEnabled ? 'Alarm is Active' : 'Alarm is Muted'}
              >
                <span className="material-symbols-outlined text-[14px]">
                  {alarm.isEnabled ? 'notifications_active' : 'notifications_off'}
                </span>
                {alarm.isEnabled ? 'ON' : 'MUTED'}
              </button>
            </div>

            {/* Medicine Name and Dosage */}
            <div className="mb-3">
              <h3 className="text-lg font-bold text-white flex items-center justify-between">
                <span>{alarm.medicineName}</span>
                <span className="text-xs font-mono font-normal px-2 py-0.5 rounded-md bg-white/10 text-purple-200">
                  {alarm.dosage}
                </span>
              </h3>
              <p className="text-xs text-white/70 mt-1 flex items-start gap-1">
                <span className="material-symbols-outlined text-[14px] text-cyan-300 mt-0.5 shrink-0">info</span>
                <span>{alarm.instructions}</span>
              </p>
            </div>

            {/* Actions: Mark Taken / Snooze */}
            <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleMarkTaken(alarm.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer ${
                    alarm.isTakenToday
                      ? 'bg-emerald-500 text-black shadow-[0_0_15px_rgba(16,185,129,0.4)]'
                      : 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-400/40'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">
                    {alarm.isTakenToday ? 'check_circle' : 'radio_button_unchecked'}
                  </span>
                  {alarm.isTakenToday ? `Taken at ${alarm.takenAt || 'Today'}` : 'Mark as Taken'}
                </button>

                {!alarm.isTakenToday && alarm.isEnabled && (
                  <button
                    onClick={() => handleSnooze(alarm.medicineName)}
                    className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white border border-white/10 text-xs font-mono transition-all cursor-pointer flex items-center gap-1"
                    title="Snooze for 15 minutes"
                  >
                    <span className="material-symbols-outlined text-[14px]">snooze</span>
                    +15m
                  </button>
                )}
              </div>

              <button
                onClick={() => handleDeleteAlarm(alarm.id)}
                className="p-2 text-white/30 hover:text-rose-400 rounded-lg hover:bg-rose-500/10 transition-colors cursor-pointer"
                title="Remove Alarm"
              >
                <span className="material-symbols-outlined text-[16px]">delete</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Custom Alarm Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#120817] border border-purple-500/30 rounded-[28px] max-w-md w-full p-6 md:p-8 shadow-2xl relative animate-scaleIn">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white/60 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-400/30 flex items-center justify-center text-purple-300">
                <span className="material-symbols-outlined">alarm_add</span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Set Medication Reminder</h3>
                <p className="text-xs text-white/50 font-mono">Custom dose time alarm</p>
              </div>
            </div>

            <form onSubmit={handleCreateAlarm} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-white/70 uppercase tracking-wider mb-1">
                  Medicine Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Telma 40 or Dolo 650"
                  value={newMedName}
                  onChange={(e) => setNewMedName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-purple-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono text-white/70 uppercase tracking-wider mb-1">
                    Dosage / Strength
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 1 Tablet / 500mg"
                    value={newDosage}
                    onChange={(e) => setNewDosage(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-purple-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-white/70 uppercase tracking-wider mb-1">
                    Daily Time Slot
                  </label>
                  <select
                    value={newSlot}
                    onChange={(e) => {
                      const s = e.target.value as 'Morning' | 'Afternoon' | 'Evening' | 'Night';
                      setNewSlot(s);
                      if (s === 'Morning') setNewTime('08:00 AM');
                      if (s === 'Afternoon') setNewTime('01:30 PM');
                      if (s === 'Evening') setNewTime('06:00 PM');
                      if (s === 'Night') setNewTime('09:30 PM');
                    }}
                    className="w-full px-3 py-2.5 rounded-xl bg-[#1c0e24] border border-white/10 text-white text-sm focus:outline-none focus:border-purple-400"
                  >
                    <option value="Morning">Morning (सुबह)</option>
                    <option value="Afternoon">Afternoon (दोपहर)</option>
                    <option value="Evening">Evening (शाम)</option>
                    <option value="Night">Night (रात)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-white/70 uppercase tracking-wider mb-1">
                  Alarm Time
                </label>
                <input
                  type="text"
                  placeholder="e.g. 08:30 AM"
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm font-mono focus:outline-none focus:border-purple-400"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-white/70 uppercase tracking-wider mb-1">
                  Food / Dosage Instructions
                </label>
                <input
                  type="text"
                  placeholder="e.g. Take 30 mins after breakfast with warm water"
                  value={newInstructions}
                  onChange={(e) => setNewInstructions(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-purple-400"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-mono font-bold uppercase tracking-wider shadow-[0_0_15px_rgba(168,85,247,0.4)] transition-all cursor-pointer"
                >
                  Save Alarm
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
