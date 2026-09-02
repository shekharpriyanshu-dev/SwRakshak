import React, { useState } from 'react';
import { INDIAN_MEAL_PLANS, DietPlan } from '../data/mealData';
import { Patient } from '../types';

interface MealPlannerViewProps {
  patient: Patient;
  showToast: (msg: string) => void;
}

export const MealPlannerView: React.FC<MealPlannerViewProps> = ({ patient, showToast }) => {
  const [selectedPlanId, setSelectedPlanId] = useState<string>(INDIAN_MEAL_PLANS[0].id);
  const [waterGlasses, setWaterGlasses] = useState<number>(4);
  const maxGlasses = 10;

  const currentPlan: DietPlan =
    INDIAN_MEAL_PLANS.find((p) => p.id === selectedPlanId) || INDIAN_MEAL_PLANS[0];

  const handleDrinkWater = () => {
    if (waterGlasses < maxGlasses) {
      const next = waterGlasses + 1;
      setWaterGlasses(next);
      showToast(`Logged 1 glass of water (${(next * 0.25).toFixed(1)} L total today) 💧`);
    } else {
      showToast('Daily hydration target reached! Great job! 🎉');
    }
  };

  const handleResetWater = () => {
    setWaterGlasses(0);
    showToast('Daily water tracker reset.');
  };

  const handlePrintPlan = () => {
    showToast(`Preparing printable Indian Meal Chart (${currentPlan.title})...`);
    setTimeout(() => {
      window.print();
    }, 400);
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header Banner */}
      <section className="bg-gradient-to-r from-emerald-950/60 via-[#0d1f18] to-purple-950/50 border border-emerald-500/20 rounded-[28px] p-6 md:p-8 shadow-2xl backdrop-blur-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full text-[11px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                आहार तालिका • CLINICAL DIET CHART
              </span>
              <span className="text-xs font-mono text-white/50">Personalized for {patient.name}</span>
            </div>
            <h1 className="font-headline-lg text-2xl md:text-3xl font-bold text-white tracking-tight">
              Indian Meal Suggestion & Nutrition Chart
            </h1>
            <p className="text-sm text-white/70 mt-1 max-w-2xl">
              Scientifically curated traditional Indian dietary plans tailored to optimize recovery, balance metabolic vitals, and complement your prescribed medicines.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={handlePrintPlan}
              className="px-4 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white font-mono text-xs font-bold uppercase tracking-wider border border-white/20 flex items-center gap-2 transition-all cursor-pointer shadow-md hover:scale-105"
            >
              <span className="material-symbols-outlined text-[16px]">print</span>
              Print Meal Plan
            </button>
          </div>
        </div>

        {/* Diet Plan Selector Pills */}
        <div className="mt-6 pt-5 border-t border-white/10 flex items-center gap-2 overflow-x-auto pb-1">
          {INDIAN_MEAL_PLANS.map((plan) => (
            <button
              key={plan.id}
              onClick={() => setSelectedPlanId(plan.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap border flex items-center gap-2 ${
                selectedPlanId === plan.id
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                  : 'bg-white/5 text-white/60 hover:text-white border-white/10'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">restaurant_menu</span>
              <span>{plan.title}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Hydration Tracker & Plan Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Hydration Widget */}
        <div className="bg-gradient-to-br from-cyan-950/40 via-white/[0.03] to-transparent border border-cyan-500/20 rounded-[24px] p-6 shadow-xl backdrop-blur-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-cyan-300 text-[22px]">water_drop</span>
              <h3 className="text-base font-bold text-white">Daily Hydration Log</h3>
            </div>
            <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              Target: {currentPlan.dailyWaterTargetLiters} L
            </span>
          </div>

          <div className="text-center py-3">
            <div className="text-3xl font-bold font-mono text-cyan-300">
              {waterGlasses} <span className="text-sm font-normal text-white/50">/ {maxGlasses} glasses</span>
            </div>
            <p className="text-xs text-white/60 mt-1">
              ~{(waterGlasses * 0.25).toFixed(2)} Liters consumed today ({Math.round((waterGlasses / maxGlasses) * 100)}% of goal)
            </p>

            {/* Visual glasses bar */}
            <div className="grid grid-cols-5 gap-2 my-4 px-2">
              {Array.from({ length: maxGlasses }).map((_, i) => (
                <div
                  key={i}
                  className={`h-8 rounded-lg flex items-center justify-center transition-all ${
                    i < waterGlasses
                      ? 'bg-gradient-to-t from-cyan-600 to-cyan-400 text-white shadow-[0_0_10px_rgba(6,182,212,0.4)]'
                      : 'bg-white/5 border border-white/10 text-white/20'
                  }`}
                >
                  <span className="material-symbols-outlined text-[14px]">
                    {i < waterGlasses ? 'water_full' : 'local_drink'}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-center gap-3 mt-4">
              <button
                onClick={handleDrinkWater}
                className="px-4 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-200 border border-cyan-400/40 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer shadow-md hover:scale-105"
              >
                <span className="material-symbols-outlined text-[16px]">add</span>
                + 1 Glass (250ml)
              </button>
              {waterGlasses > 0 && (
                <button
                  onClick={handleResetWater}
                  className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/50 hover:text-white border border-white/10 text-xs font-mono transition-all cursor-pointer"
                  title="Reset counter"
                >
                  <span className="material-symbols-outlined text-[16px]">restart_alt</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Plan Overview & Target Condition */}
        <div className="lg:col-span-2 bg-white/[0.04] border border-white/10 rounded-[24px] p-6 shadow-xl backdrop-blur-xl flex flex-col justify-between">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <h2 className="text-xl font-bold text-white">{currentPlan.title}</h2>
              </div>
              <span className="text-xs font-mono text-emerald-300 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                {currentPlan.hindiTitle}
              </span>
            </div>

            <p className="text-sm text-white/80 leading-relaxed mb-4">
              {currentPlan.description}
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                <span className="text-[10px] font-mono text-white/50 uppercase block">Daily Energy</span>
                <span className="text-sm font-bold font-mono text-orange-300">{currentPlan.totalCalories}</span>
              </div>
              <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                <span className="text-[10px] font-mono text-white/50 uppercase block">Complex Carbs</span>
                <span className="text-sm font-bold font-mono text-cyan-300">{currentPlan.macroRatio.carbs}</span>
              </div>
              <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                <span className="text-[10px] font-mono text-white/50 uppercase block">Proteins</span>
                <span className="text-sm font-bold font-mono text-purple-300">{currentPlan.macroRatio.protein}</span>
              </div>
              <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                <span className="text-[10px] font-mono text-white/50 uppercase block">Healthy Lipids</span>
                <span className="text-sm font-bold font-mono text-emerald-300">{currentPlan.macroRatio.healthyFats}</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-white/10 flex items-center gap-2 text-xs text-white/60">
            <span className="material-symbols-outlined text-emerald-300 text-[18px]">verified</span>
            <span>Recommended for: <strong className="text-white">{currentPlan.targetCondition}</strong></span>
          </div>
        </div>
      </div>

      {/* Structured Indian Meals Timeline */}
      <section className="bg-white/[0.03] border border-white/10 rounded-[28px] p-6 md:p-8 shadow-2xl backdrop-blur-xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300">
              <span className="material-symbols-outlined">schedule</span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Daily Meal Schedule & Timings</h3>
              <p className="text-xs text-white/50 font-mono">Structured round-the-clock nutrition intervals</p>
            </div>
          </div>
          <span className="text-xs font-mono text-white/40">7 Scheduled Slots</span>
        </div>

        <div className="space-y-4">
          {currentPlan.meals.map((meal, idx) => (
            <div
              key={idx}
              className="bg-white/5 hover:bg-white/[0.08] border border-white/10 hover:border-emerald-500/30 rounded-2xl p-5 transition-all shadow-md group"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 rounded-lg bg-white/10 border border-white/15 text-xs font-mono font-bold text-emerald-300">
                    {meal.timeRange}
                  </span>
                  <h4 className="text-base font-bold text-white group-hover:text-emerald-300 transition-colors">
                    {meal.name}
                  </h4>
                </div>

                <div className="flex items-center gap-2 self-start md:self-auto">
                  <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-orange-500/10 text-orange-300 border border-orange-500/20">
                    ~{meal.calorieApprox} kcal
                  </span>
                  <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-white/10 text-white/70">
                    Portion: {meal.portion}
                  </span>
                </div>
              </div>

              {/* Dish Description in Hindi & English */}
              <div className="bg-black/30 rounded-xl p-3.5 border border-white/5 space-y-1.5">
                <div className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-[16px] text-emerald-400 mt-0.5 shrink-0">
                    soup_kitchen
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-emerald-200">
                      {meal.dishHindi}
                    </p>
                    <p className="text-xs text-white/80 mt-0.5">
                      {meal.dishEnglish}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3 text-xs">
                <div className="flex items-center gap-1.5 text-white/70">
                  <span className="material-symbols-outlined text-purple-300 text-[16px]">vital_signs</span>
                  <span><strong>Nutrition:</strong> {meal.nutritionHighlights}</span>
                </div>
                <div className="flex items-center gap-1.5 text-white/60">
                  <span className="material-symbols-outlined text-cyan-300 text-[16px]">info</span>
                  <span><strong>Tip:</strong> {meal.recommendationNote}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Do's, Don'ts & Ayurvedic Herbal Remedies */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Do's */}
        <div className="bg-gradient-to-br from-emerald-950/40 via-white/[0.03] to-transparent border border-emerald-500/20 rounded-[24px] p-6 shadow-xl backdrop-blur-xl">
          <div className="flex items-center gap-2 mb-4">
            <span className="material-symbols-outlined text-emerald-400">check_circle</span>
            <h3 className="text-base font-bold text-emerald-300">Essential Diet Guidelines (क्या करें)</h3>
          </div>
          <ul className="space-y-2.5 text-xs text-white/80">
            {currentPlan.dos.map((item, i) => (
              <li key={i} className="flex items-start gap-2 bg-white/5 p-2.5 rounded-xl border border-white/5">
                <span className="material-symbols-outlined text-emerald-400 text-[16px] shrink-0 mt-0.5">done</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Don'ts */}
        <div className="bg-gradient-to-br from-rose-950/40 via-white/[0.03] to-transparent border border-rose-500/20 rounded-[24px] p-6 shadow-xl backdrop-blur-xl">
          <div className="flex items-center gap-2 mb-4">
            <span className="material-symbols-outlined text-rose-400">cancel</span>
            <h3 className="text-base font-bold text-rose-300">Foods & Habits to Avoid (क्या न करें)</h3>
          </div>
          <ul className="space-y-2.5 text-xs text-white/80">
            {currentPlan.donts.map((item, i) => (
              <li key={i} className="flex items-start gap-2 bg-white/5 p-2.5 rounded-xl border border-white/5">
                <span className="material-symbols-outlined text-rose-400 text-[16px] shrink-0 mt-0.5">close</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Herbal & Home Remedies Notice */}
      {currentPlan.specialHerbalRemedies && currentPlan.specialHerbalRemedies.length > 0 && (
        <section className="bg-gradient-to-r from-amber-950/40 via-[#1a1409] to-orange-950/40 border border-amber-500/30 rounded-2xl p-5 shadow-lg flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-300 shrink-0">
            <span className="material-symbols-outlined text-[20px]">spa</span>
          </div>
          <div>
            <h4 className="text-sm font-bold text-amber-200 uppercase tracking-wider mb-1">
              Traditional Indian Supportive Remedies (पारंपरिक घरेलू देखभाल)
            </h4>
            <div className="space-y-1 text-xs text-white/80">
              {currentPlan.specialHerbalRemedies.map((remedy, idx) => (
                <p key={idx} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0"></span>
                  <span>{remedy}</span>
                </p>
              ))}
            </div>
            <p className="text-[11px] text-white/50 italic mt-2">
              * Note: Supportive home remedies should complement and not replace your clinical medications prescribed by {patient.assignedDoctorName || 'Dr. Rajesh Sharma'}.
            </p>
          </div>
        </section>
      )}
    </div>
  );
};
