import { VitalTrendPoint, Patient } from '../types';

/**
 * Returns the historical vital records for a patient or generates realistic clinical history
 * matching the patient's current baseline vitals.
 */
export function getPatientVitalsHistory(patient: Patient): VitalTrendPoint[] {
  if (patient.vitalsHistory && patient.vitalsHistory.length > 0) {
    return patient.vitalsHistory;
  }

  // Generate realistic 14-day history based on baseline vitals
  const baseSys = patient.vitals.bloodPressure.systolic || 120;
  const baseDia = patient.vitals.bloodPressure.diastolic || 80;
  const baseHr = patient.vitals.heartRate.value || 72;
  const baseSpo2 = patient.vitals.spO2.value || 98;
  const baseWeight = patient.vitals.weight.value || 70;

  const samplePoints: VitalTrendPoint[] = [];
  const today = new Date();

  const tags: Array<'Morning' | 'Evening' | 'Resting' | 'Post-Walk' | 'Post-Meal'> = [
    'Morning',
    'Evening',
    'Morning',
    'Resting',
    'Morning',
    'Evening',
    'Resting',
    'Morning',
    'Evening',
    'Morning',
    'Post-Walk',
    'Morning',
    'Evening',
    'Morning',
  ];

  const notesList = [
    'Normal fasting morning vitals',
    'Post evening tea & stroll',
    'Recorded before breakfast',
    'Resting vitals check',
    'Post routine medication',
    'Evening reading after dinner',
    'Relaxed resting state',
    'Morning reading - optimal',
    'Slight exertion from stairs',
    'Routine fasting log',
    'After 20-min brisk walk',
    'Woke up refreshed',
    'Evening reading before dinner',
    'Current morning hospital reading',
  ];

  for (let i = 13; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const timeStr = i % 2 === 0 ? '08:30 AM' : '07:15 PM';

    // Natural clinical variance (+- 2-6 mmHg, +- 2-4 bpm)
    const seed = (i * 17 + baseSys * 7) % 11;
    const sysDelta = Math.sin(i * 0.8) * 5 + (seed - 5) * 0.8;
    const diaDelta = Math.cos(i * 0.8) * 3 + (seed - 5) * 0.5;
    const hrDelta = Math.sin(i * 1.2) * 4 + (seed - 5) * 0.6;
    const spo2Delta = i === 10 ? -1 : 0;

    const systolic = Math.round(baseSys + sysDelta);
    const diastolic = Math.round(baseDia + diaDelta);
    const heartRate = Math.round(baseHr + hrDelta);
    const spO2 = Math.min(100, Math.max(94, Math.round(baseSpo2 + spo2Delta)));
    const weight = Number((baseWeight + (i * 0.05 - 0.3)).toFixed(1));

    samplePoints.push({
      id: `vt-${patient.id}-${i}`,
      date: dateStr,
      time: timeStr,
      systolic,
      diastolic,
      heartRate,
      spO2,
      weight,
      tag: tags[13 - i] || 'Morning',
      notes: notesList[13 - i] || 'Routine check',
    });
  }

  return samplePoints;
}

export function getBpStatusCategory(systolic: number, diastolic: number): {
  label: string;
  color: string;
  bg: string;
  border: string;
} {
  if (systolic >= 140 || diastolic >= 90) {
    return {
      label: 'Stage 2 Hypertension',
      color: 'text-rose-400',
      bg: 'bg-rose-500/20',
      border: 'border-rose-500/30',
    };
  }
  if ((systolic >= 130 && systolic <= 139) || (diastolic >= 80 && diastolic <= 89)) {
    return {
      label: 'Stage 1 Hypertension',
      color: 'text-amber-400',
      bg: 'bg-amber-500/20',
      border: 'border-amber-500/30',
    };
  }
  if (systolic >= 120 && systolic <= 129 && diastolic < 80) {
    return {
      label: 'Elevated BP',
      color: 'text-yellow-300',
      bg: 'bg-yellow-500/20',
      border: 'border-yellow-500/30',
    };
  }
  if (systolic < 90 || diastolic < 60) {
    return {
      label: 'Low BP (Hypotension)',
      color: 'text-cyan-300',
      bg: 'bg-cyan-500/20',
      border: 'border-cyan-500/30',
    };
  }
  return {
    label: 'Optimal & Normal',
    color: 'text-emerald-300',
    bg: 'bg-emerald-500/20',
    border: 'border-emerald-500/30',
  };
}

export function getHeartRateStatusCategory(bpm: number): {
  label: string;
  color: string;
  bg: string;
} {
  if (bpm < 60) {
    return { label: 'Bradycardia (Low)', color: 'text-cyan-300', bg: 'bg-cyan-500/20' };
  }
  if (bpm > 100) {
    return { label: 'Tachycardia (Elevated)', color: 'text-rose-400', bg: 'bg-rose-500/20' };
  }
  return { label: 'Normal Resting Rate', color: 'text-emerald-300', bg: 'bg-emerald-500/20' };
}
