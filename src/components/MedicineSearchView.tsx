import React, { useState, useMemo } from 'react';
import { INDIAN_MEDICINES_DATABASE, MedicineInfo } from '../data/medicineData';
import { Patient } from '../types';

interface MedicineSearchViewProps {
  patient?: Patient;
  onSetReminderForMed?: (medName: string, strength: string, bestTime: string) => void;
  showToast: (msg: string) => void;
}

export const MedicineSearchView: React.FC<MedicineSearchViewProps> = ({
  patient,
  onSetReminderForMed,
  showToast,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedMedDetail, setSelectedMedDetail] = useState<MedicineInfo | null>(null);

  const categories = [
    'ALL',
    'Pain & Fever',
    'Cardiovascular & BP',
    'Diabetes',
    'Gastrointestinal & Antacids',
    'Antibiotics',
    'Vitamins & Supplements',
    'Respiratory & Allergy',
    'Cholesterol',
  ];

  const filteredMedicines = useMemo(() => {
    return INDIAN_MEDICINES_DATABASE.filter((med) => {
      // Category match
      if (selectedCategory !== 'ALL' && med.category !== selectedCategory) {
        return false;
      }

      // Search match across brand, generic, uses, category
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();

      const inBrand = med.brandName.toLowerCase().includes(q);
      const inGeneric = med.genericName.toLowerCase().includes(q);
      const inCategory = med.category.toLowerCase().includes(q);
      const inUses = med.primaryUses.some((use) => use.toLowerCase().includes(q));
      const inSideEffects = med.commonSideEffects.some((se) => se.toLowerCase().includes(q));

      return inBrand || inGeneric || inCategory || inUses || inSideEffects;
    });
  }, [searchQuery, selectedCategory]);

  const handleQuickAddAlarm = (med: MedicineInfo) => {
    if (onSetReminderForMed) {
      onSetReminderForMed(med.brandName, med.commonStrength, med.bestTime);
    } else {
      showToast(`Added alarm reminder for ${med.brandName} (${med.bestTime}) ⏰`);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Search Header Banner */}
      <section className="bg-gradient-to-r from-blue-950/60 via-[#0d1627] to-purple-950/50 border border-blue-500/20 rounded-[28px] p-6 md:p-8 shadow-2xl backdrop-blur-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 max-w-3xl">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 rounded-full text-[11px] font-mono font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
              दवा ज्ञानकोष • MEDICINE INFORMATION DIRECTORY
            </span>
            <span className="text-xs font-mono text-white/50">Verified Clinical Data</span>
          </div>
          <h1 className="font-headline-lg text-2xl md:text-3xl font-bold text-white tracking-tight">
            Search & Understand Your Medicines
          </h1>
          <p className="text-sm text-white/70 mt-1">
            Search any Indian medicine by brand name, generic salt, or condition (e.g., <em>Dolo 650, Telma 40, acidity, fever, diabetes, knee pain</em>) to view verified usage, optimal timings, precautions, and food interactions.
          </p>

          {/* Prominent Search Bar */}
          <div className="relative mt-6">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-blue-400">
              <span className="material-symbols-outlined text-[24px]">search</span>
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search medicine by name (e.g. Pan 40, Dolo, Glycomet) or symptom (fever, acidity, BP)..."
              className="w-full pl-12 pr-12 py-4 rounded-2xl bg-white/10 hover:bg-white/15 focus:bg-black/80 border border-white/20 focus:border-blue-400 text-white text-base placeholder-white/40 focus:outline-none transition-all shadow-inner"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-white/40 hover:text-white transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">cancel</span>
              </button>
            )}
          </div>
        </div>

        {/* Quick Category Chips */}
        <div className="mt-6 pt-5 border-t border-white/10 flex items-center gap-2 overflow-x-auto pb-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap border ${
                selectedCategory === cat
                  ? 'bg-blue-500/30 text-blue-200 border-blue-400 shadow-[0_0_12px_rgba(59,130,246,0.4)]'
                  : 'bg-white/5 text-white/60 hover:text-white border-white/10'
              }`}
            >
              {cat === 'ALL' ? 'All Medicines' : cat}
            </button>
          ))}
        </div>
      </section>

      {/* Results Count & Patient Prescriptions Shortcut */}
      <div className="flex items-center justify-between text-xs font-mono text-white/50 px-1">
        <span>Found {filteredMedicines.length} verified medication guide{filteredMedicines.length !== 1 ? 's' : ''}</span>
        {patient && patient.medications && patient.medications.length > 0 && (
          <span>
            {patient.name} has {patient.medications.length} active prescriptions
          </span>
        )}
      </div>

      {/* Medicines Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredMedicines.map((med) => (
          <div
            key={med.id}
            className="bg-white/[0.04] hover:bg-white/[0.07] border border-white/10 hover:border-blue-400/40 rounded-2xl p-5 transition-all shadow-xl backdrop-blur-xl flex flex-col justify-between group"
          >
            <div>
              {/* Header */}
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className="px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  {med.category}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white/10 text-white/70">
                  {med.dosageForm} • {med.commonStrength}
                </span>
              </div>

              <h3 className="text-lg font-bold text-white group-hover:text-blue-300 transition-colors">
                {med.brandName}
              </h3>
              <p className="text-xs font-mono text-white/60 italic mb-3">
                {med.genericName}
              </p>

              {/* Primary Uses Badges */}
              <div className="space-y-1.5 mb-4">
                <span className="text-[10px] font-mono text-white/40 uppercase block">Common Uses:</span>
                <div className="flex flex-wrap gap-1.5">
                  {med.primaryUses.slice(0, 3).map((use, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded-md bg-white/5 border border-white/5 text-[11px] text-white/80"
                    >
                      {use}
                    </span>
                  ))}
                  {med.primaryUses.length > 3 && (
                    <span className="px-1.5 py-0.5 rounded-md bg-white/5 text-[10px] text-white/50">
                      +{med.primaryUses.length - 3} more
                    </span>
                  )}
                </div>
              </div>

              {/* Best Timing */}
              <div className="bg-black/30 rounded-xl p-2.5 border border-white/5 text-xs space-y-1 mb-4">
                <div className="flex items-center gap-1.5 text-emerald-300 font-semibold">
                  <span className="material-symbols-outlined text-[16px]">schedule</span>
                  <span>Optimal Timing: {med.bestTime}</span>
                </div>
                <p className="text-[11px] text-white/70 line-clamp-2">
                  {med.howToTake}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-2">
              <button
                onClick={() => setSelectedMedDetail(med)}
                className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 hover:text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[16px]">visibility</span>
                Full Details
              </button>

              <button
                onClick={() => handleQuickAddAlarm(med)}
                className="px-3.5 py-2 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 border border-purple-400/30 text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                title="Set medication alarm"
              >
                <span className="material-symbols-outlined text-[16px]">alarm_add</span>
                Set Alarm
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredMedicines.length === 0 && (
        <div className="text-center py-12 bg-white/[0.02] border border-white/10 rounded-2xl p-8">
          <span className="material-symbols-outlined text-4xl text-white/30 mb-2">medication_liquid</span>
          <h3 className="text-base font-bold text-white">No matching medications found</h3>
          <p className="text-xs text-white/50 mt-1 max-w-md mx-auto">
            Try searching for common terms like "Paracetamol", "Pan 40", "Metformin", "acidity", "fever", or "antibiotic".
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('ALL');
            }}
            className="mt-4 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer"
          >
            Clear Filters
          </button>
        </div>
      )}

      {/* Full Medicine Details Modal */}
      {selectedMedDetail && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0e1422] border border-blue-500/30 rounded-[28px] max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 md:p-8 shadow-2xl relative animate-scaleIn">
            <button
              onClick={() => setSelectedMedDetail(null)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white/60 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>

            {/* Header */}
            <div className="flex items-start gap-4 mb-6">
              <div className="w-14 h-14 rounded-2xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-300 shrink-0">
                <span className="material-symbols-outlined text-3xl">pill</span>
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                    {selectedMedDetail.category}
                  </span>
                  <span className="text-xs font-mono text-white/50">
                    {selectedMedDetail.dosageForm} • {selectedMedDetail.commonStrength}
                  </span>
                </div>
                <h2 className="text-2xl font-bold text-white">{selectedMedDetail.brandName}</h2>
                <p className="text-sm font-mono text-blue-300/80">{selectedMedDetail.genericName}</p>
              </div>
            </div>

            {/* Information Grid */}
            <div className="space-y-4 text-sm">
              {/* Uses */}
              <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-blue-300 mb-2 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px]">verified</span>
                  Primary Clinical Uses
                </h4>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-white/90">
                  {selectedMedDetail.primaryUses.map((use, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0"></span>
                      <span>{use}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* How to take & Timing */}
              <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-300 mb-2 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px]">schedule</span>
                  How to Take & Best Timing
                </h4>
                <p className="text-xs text-white/90 leading-relaxed">
                  {selectedMedDetail.howToTake}
                </p>
                <div className="mt-2 text-xs font-semibold text-emerald-300 flex items-center gap-1">
                  <span>Recommended Slot:</span>
                  <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 border border-emerald-500/30 font-mono">
                    {selectedMedDetail.bestTime}
                  </span>
                </div>
              </div>

              {/* Food & Drink Interactions */}
              <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-amber-300 mb-2 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px]">restaurant</span>
                  Food & Diet Guidelines
                </h4>
                <p className="text-xs text-white/80 leading-relaxed">
                  {selectedMedDetail.foodInteractions}
                </p>
              </div>

              {/* Side Effects & Precautions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-rose-950/20 p-4 rounded-2xl border border-rose-500/20">
                  <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-rose-300 mb-2 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px]">warning</span>
                    Common Side Effects
                  </h4>
                  <ul className="space-y-1 text-xs text-white/80">
                    {selectedMedDetail.commonSideEffects.map((se, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="material-symbols-outlined text-rose-400 text-[14px] shrink-0 mt-0.5">remove</span>
                        <span>{se}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-purple-950/20 p-4 rounded-2xl border border-purple-500/20">
                  <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-purple-300 mb-2 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px]">shield</span>
                    Important Precautions
                  </h4>
                  <ul className="space-y-1 text-xs text-white/80">
                    {selectedMedDetail.precautions.map((p, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="material-symbols-outlined text-purple-300 text-[14px] shrink-0 mt-0.5">check</span>
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between gap-3">
              <button
                onClick={() => setSelectedMedDetail(null)}
                className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer"
              >
                Close
              </button>

              <button
                onClick={() => {
                  handleQuickAddAlarm(selectedMedDetail);
                  setSelectedMedDetail(null);
                }}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-mono font-bold uppercase tracking-wider shadow-[0_0_15px_rgba(59,130,246,0.4)] transition-all cursor-pointer flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[18px]">alarm_add</span>
                Set Medicine Alarm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
