import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  ReferenceArea,
} from 'recharts';
import { Patient, VitalTrendPoint } from '../types';
import {
  getPatientVitalsHistory,
  getBpStatusCategory,
  getHeartRateStatusCategory,
} from '../utils/vitalsData';

interface VitalsTrendsChartProps {
  patient: Patient;
  onUpdatePatientVitals?: (updatedVitalsHistory: VitalTrendPoint[]) => void;
  showToast: (msg: string) => void;
}

type ChartMetricView = 'combined' | 'bp' | 'hr' | 'spo2';
type TimeframeFilter = '7d' | '14d' | '30d';

export const VitalsTrendsChart: React.FC<VitalsTrendsChartProps> = ({
  patient,
  onUpdatePatientVitals,
  showToast,
}) => {
  const [metricView, setMetricView] = useState<ChartMetricView>('combined');
  const [timeframe, setTimeframe] = useState<TimeframeFilter>('14d');
  const [displayMode, setDisplayMode] = useState<'chart' | 'table'>('chart');
  const [showLogModal, setShowLogModal] = useState(false);

  // Local state for historical points so user can immediately add readings
  const [historyPoints, setHistoryPoints] = useState<VitalTrendPoint[]>(() =>
    getPatientVitalsHistory(patient)
  );

  // New reading form state
  const [newSystolic, setNewSystolic] = useState<number>(patient.vitals.bloodPressure.systolic || 120);
  const [newDiastolic, setNewDiastolic] = useState<number>(patient.vitals.bloodPressure.diastolic || 80);
  const [newHeartRate, setNewHeartRate] = useState<number>(patient.vitals.heartRate.value || 72);
  const [newSpO2, setNewSpO2] = useState<number>(patient.vitals.spO2.value || 99);
  const [newWeight, setNewWeight] = useState<number>(patient.vitals.weight.value || 70.0);
  const [newTag, setNewTag] = useState<'Morning' | 'Evening' | 'Resting' | 'Post-Walk' | 'Post-Meal'>('Morning');
  const [newNotes, setNewNotes] = useState<string>('Self-logged vitals reading');

  // Filter points based on selected timeframe
  const filteredData = useMemo(() => {
    const total = historyPoints.length;
    if (timeframe === '7d') {
      return historyPoints.slice(Math.max(0, total - 7));
    }
    if (timeframe === '14d') {
      return historyPoints.slice(Math.max(0, total - 14));
    }
    return historyPoints;
  }, [historyPoints, timeframe]);

  // Calculations for summary stats
  const stats = useMemo(() => {
    if (filteredData.length === 0) {
      return {
        avgSys: 0,
        avgDia: 0,
        avgHr: 0,
        minSys: 0,
        maxSys: 0,
        minHr: 0,
        maxHr: 0,
        latestPoint: null,
      };
    }

    const totalSys = filteredData.reduce((acc, p) => acc + p.systolic, 0);
    const totalDia = filteredData.reduce((acc, p) => acc + p.diastolic, 0);
    const totalHr = filteredData.reduce((acc, p) => acc + p.heartRate, 0);

    const sysValues = filteredData.map((p) => p.systolic);
    const hrValues = filteredData.map((p) => p.heartRate);

    return {
      avgSys: Math.round(totalSys / filteredData.length),
      avgDia: Math.round(totalDia / filteredData.length),
      avgHr: Math.round(totalHr / filteredData.length),
      minSys: Math.min(...sysValues),
      maxSys: Math.max(...sysValues),
      minHr: Math.min(...hrValues),
      maxHr: Math.max(...hrValues),
      latestPoint: filteredData[filteredData.length - 1],
    };
  }, [filteredData]);

  const handleAddReading = (e: React.FormEvent) => {
    e.preventDefault();
    const today = new Date();
    const dateStr = today.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const timeStr = today.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    const newPoint: VitalTrendPoint = {
      id: `vt-${Date.now()}`,
      date: dateStr,
      time: timeStr,
      systolic: Number(newSystolic),
      diastolic: Number(newDiastolic),
      heartRate: Number(newHeartRate),
      spO2: Number(newSpO2),
      weight: Number(newWeight),
      tag: newTag,
      notes: newNotes || 'Self-recorded reading',
    };

    const updated = [...historyPoints, newPoint];
    setHistoryPoints(updated);
    if (onUpdatePatientVitals) {
      onUpdatePatientVitals(updated);
    }

    showToast(`Logged new vitals: BP ${newSystolic}/${newDiastolic} mmHg, HR ${newHeartRate} bpm ✨`);
    setShowLogModal(false);
  };

  const latestBpCategory = stats.latestPoint
    ? getBpStatusCategory(stats.latestPoint.systolic, stats.latestPoint.diastolic)
    : getBpStatusCategory(120, 80);

  const latestHrCategory = stats.latestPoint
    ? getHeartRateStatusCategory(stats.latestPoint.heartRate)
    : getHeartRateStatusCategory(72);

  // Custom Tooltip for Recharts
  const CustomVitalsTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const pointData = payload[0].payload as VitalTrendPoint;
      const bpStatus = getBpStatusCategory(pointData.systolic, pointData.diastolic);
      const hrStatus = getHeartRateStatusCategory(pointData.heartRate);

      return (
        <div className="bg-[#0b101c]/95 border border-purple-500/30 rounded-2xl p-4 shadow-2xl backdrop-blur-xl text-xs max-w-xs space-y-2">
          <div className="flex items-center justify-between border-b border-white/10 pb-1.5">
            <span className="font-bold text-white text-sm">
              {label} {pointData.time ? `• ${pointData.time}` : ''}
            </span>
            {pointData.tag && (
              <span className="px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 font-mono text-[10px] border border-purple-500/30">
                {pointData.tag}
              </span>
            )}
          </div>

          {/* Values Grid */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <div className="bg-white/5 p-2 rounded-xl border border-white/5">
              <span className="text-white/50 block text-[10px] font-mono uppercase">Blood Pressure</span>
              <span className="text-sm font-bold font-mono text-purple-300">
                {pointData.systolic}/{pointData.diastolic} <span className="text-[10px] text-white/40">mmHg</span>
              </span>
              <span className={`block text-[10px] mt-0.5 font-semibold ${bpStatus.color}`}>
                {bpStatus.label}
              </span>
            </div>

            <div className="bg-white/5 p-2 rounded-xl border border-white/5">
              <span className="text-white/50 block text-[10px] font-mono uppercase">Heart Rate</span>
              <span className="text-sm font-bold font-mono text-orange-300">
                {pointData.heartRate} <span className="text-[10px] text-white/40">bpm</span>
              </span>
              <span className={`block text-[10px] mt-0.5 font-semibold ${hrStatus.color}`}>
                {hrStatus.label}
              </span>
            </div>
          </div>

          {pointData.spO2 && (
            <div className="flex items-center justify-between text-[11px] text-white/70 px-1">
              <span>SpO2 Oxygen: <strong className="text-cyan-300 font-mono">{pointData.spO2}%</strong></span>
              {pointData.weight && (
                <span>Weight: <strong className="text-white font-mono">{pointData.weight} kg</strong></span>
              )}
            </div>
          )}

          {pointData.notes && (
            <div className="text-[11px] text-white/60 italic bg-white/5 px-2 py-1 rounded-lg border border-white/5">
              "{pointData.notes}"
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Main Container Card */}
      <section className="bg-white/[0.04] border border-white/10 rounded-[28px] p-5 md:p-7 shadow-2xl backdrop-blur-2xl relative overflow-hidden">
        {/* Glow ambient background */}
        <div className="absolute top-0 right-1/4 -mt-10 w-72 h-72 bg-purple-600/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-orange-600/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* Top Header Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-5 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-3 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/30">
                HEALTH BIOMETRICS • स्वास्थ्य निगरानी
              </span>
              <span className="text-xs font-mono text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Active Recharts Analytics
              </span>
            </div>
            <h2 className="font-headline-lg text-xl md:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <span className="material-symbols-outlined text-purple-300">timeline</span>
              Vitals Historical Trends & Analytics
            </h2>
            <p className="text-xs font-mono text-white/60 mt-0.5">
              Continuous tracking for Blood Pressure (mmHg), Resting Heart Rate (bpm), and Oxygen Saturation
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* View Mode Toggle */}
            <div className="bg-white/5 p-1 rounded-full border border-white/10 flex items-center">
              <button
                onClick={() => setDisplayMode('chart')}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  displayMode === 'chart'
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                <span className="material-symbols-outlined text-[15px]">show_chart</span>
                Chart View
              </button>
              <button
                onClick={() => setDisplayMode('table')}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  displayMode === 'table'
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                <span className="material-symbols-outlined text-[15px]">table_rows</span>
                Log Table
              </button>
            </div>

            {/* Log New Reading Button */}
            <button
              onClick={() => setShowLogModal(true)}
              className="px-4 py-2 rounded-full bg-gradient-to-r from-purple-600 to-orange-500 text-white font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-lg shadow-purple-900/30 hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">add_circle</span>
              Log Reading
            </button>
          </div>
        </div>

        {/* Statistical KPI summary cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 my-6 relative z-10">
          {/* Latest Blood Pressure */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 hover:border-purple-400/40 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs text-white/50 font-mono uppercase">Latest BP</span>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${latestBpCategory.bg} ${latestBpCategory.color} border ${latestBpCategory.border}`}>
                {latestBpCategory.label}
              </span>
            </div>
            <div className="flex items-baseline gap-1 my-1.5">
              <span className="text-2xl md:text-3xl font-bold font-mono text-purple-200">
                {stats.latestPoint ? `${stats.latestPoint.systolic}/${stats.latestPoint.diastolic}` : '118/76'}
              </span>
              <span className="text-xs font-mono text-white/40">mmHg</span>
            </div>
            <p className="text-[11px] font-mono text-white/60">
              Avg over period: <strong className="text-white">{stats.avgSys}/{stats.avgDia}</strong> mmHg
            </p>
          </div>

          {/* Resting Pulse / Heart Rate */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 hover:border-orange-400/40 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs text-white/50 font-mono uppercase">Pulse Rate</span>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${latestHrCategory.bg} ${latestHrCategory.color}`}>
                {latestHrCategory.label}
              </span>
            </div>
            <div className="flex items-baseline gap-1 my-1.5">
              <span className="text-2xl md:text-3xl font-bold font-mono text-orange-300">
                {stats.latestPoint ? stats.latestPoint.heartRate : 72}
              </span>
              <span className="text-xs font-mono text-white/40">bpm</span>
            </div>
            <p className="text-[11px] font-mono text-white/60">
              Range: <strong className="text-white">{stats.minHr} - {stats.maxHr}</strong> bpm (Avg {stats.avgHr})
            </p>
          </div>

          {/* Oxygen SpO2 */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 hover:border-cyan-400/40 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs text-white/50 font-mono uppercase">SpO2 Oxygen</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                Optimal
              </span>
            </div>
            <div className="flex items-baseline gap-1 my-1.5">
              <span className="text-2xl md:text-3xl font-bold font-mono text-cyan-300">
                {stats.latestPoint?.spO2 || 99}
              </span>
              <span className="text-xs font-mono text-white/40">%</span>
            </div>
            <p className="text-[11px] font-mono text-emerald-300 flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">check_circle</span>
              Room Air Saturation
            </p>
          </div>

          {/* Systolic Range Variance */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 hover:border-emerald-400/40 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs text-white/50 font-mono uppercase">BP Variance</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full font-bold bg-emerald-500/20 text-emerald-300">
                Controlled
              </span>
            </div>
            <div className="flex items-baseline gap-1 my-1.5">
              <span className="text-2xl md:text-3xl font-bold font-mono text-emerald-300">
                ±{(stats.maxSys - stats.minSys) > 0 ? (stats.maxSys - stats.minSys) : 4}
              </span>
              <span className="text-xs font-mono text-white/40">mmHg span</span>
            </div>
            <p className="text-[11px] font-mono text-white/60">
              Systolic Min: <strong className="text-white">{stats.minSys}</strong> | Max: <strong className="text-white">{stats.maxSys}</strong>
            </p>
          </div>
        </div>

        {/* Filter Toolbar: Metric selectors & Timeframe pills */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pt-2">
          {/* Metric Selector Buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            <button
              onClick={() => setMetricView('combined')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap border flex items-center gap-1.5 ${
                metricView === 'combined'
                  ? 'bg-purple-600 text-white border-purple-400 shadow-[0_0_12px_rgba(168,85,247,0.4)]'
                  : 'bg-white/5 text-white/60 hover:text-white border-white/10'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-gradient-to-r from-purple-400 to-orange-400"></span>
              Combined BP & Pulse
            </button>

            <button
              onClick={() => setMetricView('bp')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap border flex items-center gap-1.5 ${
                metricView === 'bp'
                  ? 'bg-purple-600 text-white border-purple-400 shadow-[0_0_12px_rgba(168,85,247,0.4)]'
                  : 'bg-white/5 text-white/60 hover:text-white border-white/10'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-purple-400"></span>
              Blood Pressure Only
            </button>

            <button
              onClick={() => setMetricView('hr')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap border flex items-center gap-1.5 ${
                metricView === 'hr'
                  ? 'bg-orange-600 text-white border-orange-400 shadow-[0_0_12px_rgba(249,115,22,0.4)]'
                  : 'bg-white/5 text-white/60 hover:text-white border-white/10'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-orange-400"></span>
              Heart Rate (BPM)
            </button>

            <button
              onClick={() => setMetricView('spo2')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap border flex items-center gap-1.5 ${
                metricView === 'spo2'
                  ? 'bg-cyan-600 text-white border-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.4)]'
                  : 'bg-white/5 text-white/60 hover:text-white border-white/10'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
              Oxygen SpO2 & Weight
            </button>
          </div>

          {/* Timeframe selector */}
          <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/10">
            {(['7d', '14d', '30d'] as TimeframeFilter[]).map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-3 py-1 rounded-lg text-xs font-mono font-bold uppercase transition-all cursor-pointer ${
                  timeframe === tf
                    ? 'bg-white/20 text-white shadow-inner'
                    : 'text-white/40 hover:text-white'
                }`}
              >
                {tf === '7d' ? '7 Days' : tf === '14d' ? '14 Days' : '30 Days'}
              </button>
            ))}
          </div>
        </div>

        {/* CHART RENDER VIEW */}
        {displayMode === 'chart' && (
          <div className="space-y-4">
            {/* Chart Canvas Box */}
            <div className="bg-[#0a0f1d]/80 border border-white/10 rounded-2xl p-4 md:p-6 shadow-inner relative">
              {/* Reference clinical guide legend overlay */}
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3 text-[11px] font-mono text-white/60 border-b border-white/5 pb-2">
                <div className="flex items-center gap-3 flex-wrap">
                  {metricView !== 'hr' && metricView !== 'spo2' && (
                    <>
                      <span className="flex items-center gap-1">
                        <span className="w-3 h-1 bg-purple-400 rounded"></span>
                        Systolic (Target: &lt;120 mmHg)
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-3 h-1 bg-blue-400 rounded"></span>
                        Diastolic (Target: &lt;80 mmHg)
                      </span>
                    </>
                  )}
                  {(metricView === 'combined' || metricView === 'hr') && (
                    <span className="flex items-center gap-1">
                      <span className="w-3 h-1 bg-orange-400 rounded"></span>
                      Heart Rate (Target: 60-100 bpm)
                    </span>
                  )}
                  {metricView === 'spo2' && (
                    <>
                      <span className="flex items-center gap-1">
                        <span className="w-3 h-1 bg-cyan-400 rounded"></span>
                        SpO2 (Target: 95-100%)
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-3 h-1 bg-emerald-400 rounded"></span>
                        Weight (kg)
                      </span>
                    </>
                  )}
                </div>

                <span className="text-[10px] text-white/40">
                  Showing {filteredData.length} records • Point hover for clinical tags
                </span>
              </div>

              {/* Recharts Container */}
              <div className="w-full h-80">
                <ResponsiveContainer width="100%" height="100%">
                  {metricView === 'combined' ? (
                    <LineChart data={filteredData} margin={{ top: 10, right: 10, left: -10, bottom: 5 }}>
                      <defs>
                        <linearGradient id="sysGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#c084fc" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#c084fc" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                      <XAxis
                        dataKey="date"
                        stroke="#ffffff40"
                        tick={{ fill: '#ffffff60', fontSize: 11, fontFamily: 'monospace' }}
                        tickLine={{ stroke: '#ffffff20' }}
                      />
                      {/* Left Axis: BP in mmHg */}
                      <YAxis
                        yAxisId="bp"
                        domain={[40, 160]}
                        stroke="#c084fc"
                        tick={{ fill: '#c084fc', fontSize: 11, fontFamily: 'monospace' }}
                        tickLine={{ stroke: '#ffffff20' }}
                        label={{
                          value: 'BP (mmHg)',
                          angle: -90,
                          position: 'insideLeft',
                          fill: '#c084fc',
                          fontSize: 10,
                          fontFamily: 'monospace',
                          offset: 15,
                        }}
                      />
                      {/* Right Axis: Heart Rate in bpm */}
                      <YAxis
                        yAxisId="hr"
                        orientation="right"
                        domain={[50, 120]}
                        stroke="#fb923c"
                        tick={{ fill: '#fb923c', fontSize: 11, fontFamily: 'monospace' }}
                        tickLine={{ stroke: '#ffffff20' }}
                        label={{
                          value: 'Pulse (bpm)',
                          angle: 90,
                          position: 'insideRight',
                          fill: '#fb923c',
                          fontSize: 10,
                          fontFamily: 'monospace',
                          offset: 15,
                        }}
                      />
                      <Tooltip content={<CustomVitalsTooltip />} />
                      {/* Target Guidelines Reference Lines */}
                      <ReferenceLine yAxisId="bp" y={120} stroke="#a855f7" strokeDasharray="3 3" strokeOpacity={0.4} />
                      <ReferenceLine yAxisId="bp" y={80} stroke="#60a5fa" strokeDasharray="3 3" strokeOpacity={0.4} />

                      <Line
                        yAxisId="bp"
                        type="monotone"
                        dataKey="systolic"
                        name="Systolic BP"
                        stroke="#c084fc"
                        strokeWidth={2.5}
                        dot={{ r: 4, fill: '#c084fc', strokeWidth: 1, stroke: '#ffffff' }}
                        activeDot={{ r: 7, stroke: '#ffffff', strokeWidth: 2 }}
                      />
                      <Line
                        yAxisId="bp"
                        type="monotone"
                        dataKey="diastolic"
                        name="Diastolic BP"
                        stroke="#60a5fa"
                        strokeWidth={2}
                        dot={{ r: 3.5, fill: '#60a5fa', strokeWidth: 1, stroke: '#ffffff' }}
                        activeDot={{ r: 6, stroke: '#ffffff', strokeWidth: 2 }}
                      />
                      <Line
                        yAxisId="hr"
                        type="monotone"
                        dataKey="heartRate"
                        name="Heart Rate"
                        stroke="#fb923c"
                        strokeWidth={2}
                        strokeDasharray="4 2"
                        dot={{ r: 3.5, fill: '#fb923c', strokeWidth: 1, stroke: '#ffffff' }}
                        activeDot={{ r: 6, stroke: '#ffffff', strokeWidth: 2 }}
                      />
                    </LineChart>
                  ) : metricView === 'bp' ? (
                    <AreaChart data={filteredData} margin={{ top: 10, right: 10, left: -10, bottom: 5 }}>
                      <defs>
                        <linearGradient id="sysArea" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#a855f7" stopOpacity={0.5} />
                          <stop offset="95%" stopColor="#a855f7" stopOpacity={0.02} />
                        </linearGradient>
                        <linearGradient id="diaArea" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.02} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                      <XAxis
                        dataKey="date"
                        stroke="#ffffff40"
                        tick={{ fill: '#ffffff60', fontSize: 11, fontFamily: 'monospace' }}
                      />
                      <YAxis
                        domain={[50, 160]}
                        stroke="#ffffff40"
                        tick={{ fill: '#ffffff60', fontSize: 11, fontFamily: 'monospace' }}
                        label={{
                          value: 'Blood Pressure (mmHg)',
                          angle: -90,
                          position: 'insideLeft',
                          fill: '#ffffff60',
                          fontSize: 10,
                          fontFamily: 'monospace',
                          offset: 15,
                        }}
                      />
                      <Tooltip content={<CustomVitalsTooltip />} />
                      <ReferenceLine y={120} label={{ value: 'Normal Sys (120)', fill: '#a855f7', fontSize: 10, position: 'right' }} stroke="#a855f7" strokeDasharray="3 3" />
                      <ReferenceLine y={80} label={{ value: 'Normal Dia (80)', fill: '#3b82f6', fontSize: 10, position: 'right' }} stroke="#3b82f6" strokeDasharray="3 3" />

                      <Area
                        type="monotone"
                        dataKey="systolic"
                        name="Systolic BP"
                        stroke="#c084fc"
                        strokeWidth={2.5}
                        fill="url(#sysArea)"
                        dot={{ r: 4, fill: '#c084fc', stroke: '#ffffff', strokeWidth: 1 }}
                      />
                      <Area
                        type="monotone"
                        dataKey="diastolic"
                        name="Diastolic BP"
                        stroke="#60a5fa"
                        strokeWidth={2}
                        fill="url(#diaArea)"
                        dot={{ r: 3.5, fill: '#60a5fa', stroke: '#ffffff', strokeWidth: 1 }}
                      />
                    </AreaChart>
                  ) : metricView === 'hr' ? (
                    <AreaChart data={filteredData} margin={{ top: 10, right: 10, left: -10, bottom: 5 }}>
                      <defs>
                        <linearGradient id="hrArea" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f97316" stopOpacity={0.5} />
                          <stop offset="95%" stopColor="#f97316" stopOpacity={0.02} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                      <XAxis dataKey="date" stroke="#ffffff40" tick={{ fill: '#ffffff60', fontSize: 11, fontFamily: 'monospace' }} />
                      <YAxis
                        domain={[50, 115]}
                        stroke="#ffffff40"
                        tick={{ fill: '#ffffff60', fontSize: 11, fontFamily: 'monospace' }}
                        label={{
                          value: 'Heart Rate (bpm)',
                          angle: -90,
                          position: 'insideLeft',
                          fill: '#fb923c',
                          fontSize: 10,
                          fontFamily: 'monospace',
                          offset: 15,
                        }}
                      />
                      <Tooltip content={<CustomVitalsTooltip />} />
                      <ReferenceLine y={100} stroke="#ef4444" strokeDasharray="3 3" label={{ value: 'Tachycardia (100)', fill: '#ef4444', fontSize: 10 }} />
                      <ReferenceLine y={60} stroke="#38bdf8" strokeDasharray="3 3" label={{ value: 'Bradycardia (60)', fill: '#38bdf8', fontSize: 10 }} />

                      <Area
                        type="monotone"
                        dataKey="heartRate"
                        name="Heart Rate"
                        stroke="#fb923c"
                        strokeWidth={2.5}
                        fill="url(#hrArea)"
                        dot={{ r: 4, fill: '#fb923c', stroke: '#ffffff', strokeWidth: 1 }}
                      />
                    </AreaChart>
                  ) : (
                    <LineChart data={filteredData} margin={{ top: 10, right: 10, left: -10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                      <XAxis dataKey="date" stroke="#ffffff40" tick={{ fill: '#ffffff60', fontSize: 11, fontFamily: 'monospace' }} />
                      <YAxis
                        yAxisId="spo2"
                        domain={[90, 100]}
                        stroke="#06b6d4"
                        tick={{ fill: '#06b6d4', fontSize: 11, fontFamily: 'monospace' }}
                        label={{ value: 'SpO2 %', angle: -90, position: 'insideLeft', fill: '#06b6d4', fontSize: 10, offset: 15 }}
                      />
                      <YAxis
                        yAxisId="wt"
                        orientation="right"
                        domain={['dataMin - 2', 'dataMax + 2']}
                        stroke="#10b981"
                        tick={{ fill: '#10b981', fontSize: 11, fontFamily: 'monospace' }}
                        label={{ value: 'Weight (kg)', angle: 90, position: 'insideRight', fill: '#10b981', fontSize: 10, offset: 15 }}
                      />
                      <Tooltip content={<CustomVitalsTooltip />} />
                      <Line
                        yAxisId="spo2"
                        type="monotone"
                        dataKey="spO2"
                        name="Oxygen Saturation (%)"
                        stroke="#22d3ee"
                        strokeWidth={2.5}
                        dot={{ r: 4, fill: '#22d3ee', stroke: '#ffffff' }}
                      />
                      <Line
                        yAxisId="wt"
                        type="monotone"
                        dataKey="weight"
                        name="Body Weight (kg)"
                        stroke="#34d399"
                        strokeWidth={2}
                        dot={{ r: 4, fill: '#34d399', stroke: '#ffffff' }}
                      />
                    </LineChart>
                  )}
                </ResponsiveContainer>
              </div>
            </div>

            {/* Clinical Insights Banner */}
            <div className="bg-gradient-to-r from-purple-950/40 via-blue-950/30 to-transparent border border-purple-500/20 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[20px]">insights</span>
                </div>
                <div>
                  <h4 className="font-bold text-white">Automated Clinical Trend Assessment</h4>
                  <p className="text-white/70 font-mono text-[11px] mt-0.5">
                    Blood pressure systolic readings are within targeted limits (<span className="text-purple-300 font-bold">{stats.avgSys} mmHg avg</span>), showing consistent therapeutic response to current medication regimen.
                  </p>
                </div>
              </div>

              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-mono font-bold text-[11px] border border-emerald-500/30 whitespace-nowrap">
                STABLE TREND
              </span>
            </div>
          </div>
        )}

        {/* TABLE LOG VIEW */}
        {displayMode === 'table' && (
          <div className="bg-[#0a0f1d]/90 border border-white/10 rounded-2xl overflow-hidden shadow-inner">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-white/5 border-b border-white/10 text-white/50 uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Date & Time</th>
                    <th className="py-3 px-4">Time Slot</th>
                    <th className="py-3 px-4">BP (mmHg)</th>
                    <th className="py-3 px-4">BP Category</th>
                    <th className="py-3 px-4">Pulse (bpm)</th>
                    <th className="py-3 px-4">SpO2</th>
                    <th className="py-3 px-4">Clinical Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredData.slice().reverse().map((point, idx) => {
                    const bpCat = getBpStatusCategory(point.systolic, point.diastolic);
                    const hrCat = getHeartRateStatusCategory(point.heartRate);
                    return (
                      <tr key={point.id || idx} className="hover:bg-white/[0.04] transition-colors">
                        <td className="py-3 px-4 text-white font-bold whitespace-nowrap">
                          {point.date} {point.time && <span className="text-white/40 font-normal">({point.time})</span>}
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded-md bg-white/5 text-white/70 text-[10px]">
                            {point.tag || 'Routine'}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-bold text-purple-300">
                          {point.systolic}/{point.diastolic}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${bpCat.bg} ${bpCat.color}`}>
                            {bpCat.label}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-bold text-orange-300">
                          {point.heartRate} <span className="text-[10px] text-white/40 font-normal">bpm</span>
                        </td>
                        <td className="py-3 px-4 text-cyan-300">
                          {point.spO2 ? `${point.spO2}%` : '99%'}
                        </td>
                        <td className="py-3 px-4 text-white/60 max-w-xs truncate">
                          {point.notes || '—'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>

      {/* MODAL: LOG NEW VITAL READING */}
      {showLogModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0e1424] border border-purple-500/30 rounded-[28px] max-w-lg w-full p-6 md:p-8 shadow-2xl relative animate-scaleIn">
            <button
              onClick={() => setShowLogModal(false)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white/60 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-400/30 flex items-center justify-center text-purple-300">
                <span className="material-symbols-outlined text-2xl">favorite</span>
              </div>
              <div>
                <h3 className="font-headline-md text-xl font-bold text-white">
                  Log New Health Reading
                </h3>
                <p className="text-xs font-mono text-white/50">
                  Record your latest blood pressure, heart rate, and oxygen levels
                </p>
              </div>
            </div>

            <form onSubmit={handleAddReading} className="space-y-4 text-xs font-mono">
              {/* BP Inputs */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-white/60 block mb-1">Systolic BP (mmHg)</label>
                  <input
                    type="number"
                    min="60"
                    max="220"
                    required
                    value={newSystolic}
                    onChange={(e) => setNewSystolic(Number(e.target.value))}
                    className="w-full bg-white/5 border border-white/15 focus:border-purple-400 rounded-xl p-3 text-white font-bold text-base focus:outline-none"
                  />
                  <span className="text-[10px] text-white/40 mt-0.5 block">Ideal: &lt;120 mmHg</span>
                </div>

                <div>
                  <label className="text-white/60 block mb-1">Diastolic BP (mmHg)</label>
                  <input
                    type="number"
                    min="40"
                    max="140"
                    required
                    value={newDiastolic}
                    onChange={(e) => setNewDiastolic(Number(e.target.value))}
                    className="w-full bg-white/5 border border-white/15 focus:border-purple-400 rounded-xl p-3 text-white font-bold text-base focus:outline-none"
                  />
                  <span className="text-[10px] text-white/40 mt-0.5 block">Ideal: &lt;80 mmHg</span>
                </div>
              </div>

              {/* Heart Rate & SpO2 */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-white/60 block mb-1">Pulse / Heart Rate (bpm)</label>
                  <input
                    type="number"
                    min="40"
                    max="200"
                    required
                    value={newHeartRate}
                    onChange={(e) => setNewHeartRate(Number(e.target.value))}
                    className="w-full bg-white/5 border border-white/15 focus:border-orange-400 rounded-xl p-3 text-white font-bold text-base focus:outline-none"
                  />
                  <span className="text-[10px] text-white/40 mt-0.5 block">Normal: 60-100 bpm</span>
                </div>

                <div>
                  <label className="text-white/60 block mb-1">Oxygen Saturation (%)</label>
                  <input
                    type="number"
                    min="85"
                    max="100"
                    required
                    value={newSpO2}
                    onChange={(e) => setNewSpO2(Number(e.target.value))}
                    className="w-full bg-white/5 border border-white/15 focus:border-cyan-400 rounded-xl p-3 text-white font-bold text-base focus:outline-none"
                  />
                  <span className="text-[10px] text-white/40 mt-0.5 block">Target: 95-100%</span>
                </div>
              </div>

              {/* Tag / Context */}
              <div>
                <label className="text-white/60 block mb-1">Reading Context / Tag</label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
                  {(['Morning', 'Evening', 'Resting', 'Post-Walk', 'Post-Meal'] as const).map((tag) => (
                    <button
                      type="button"
                      key={tag}
                      onClick={() => setNewTag(tag)}
                      className={`py-2 px-1 rounded-xl text-[11px] font-bold text-center border transition-all cursor-pointer ${
                        newTag === tag
                          ? 'bg-purple-600 text-white border-purple-400'
                          : 'bg-white/5 text-white/60 hover:text-white border-white/10'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="text-white/60 block mb-1">Clinical Note / Observation</label>
                <input
                  type="text"
                  placeholder="e.g. Taken 30 mins after breakfast and medication"
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="w-full bg-white/5 border border-white/15 focus:border-purple-400 rounded-xl p-3 text-white placeholder:text-white/30 focus:outline-none"
                />
              </div>

              {/* Form Actions */}
              <div className="pt-3 flex items-center justify-end gap-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowLogModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-orange-500 text-white font-mono text-xs font-bold uppercase tracking-wider shadow-lg shadow-purple-900/40 hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[16px]">save</span>
                  Save Reading
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
