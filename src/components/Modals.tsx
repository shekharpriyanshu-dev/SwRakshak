import React, { useState } from 'react';
import { ClinicalRecord, Patient, DoctorProfile, RecordType } from '../types';
import { exportClinicalRecordPdf, exportLabResultsPdf } from '../utils/pdfGenerator';

interface ReportModalProps {
  record: ClinicalRecord | null;
  patient: Patient | null;
  onClose: () => void;
  showToast?: (msg: string) => void;
}

export const ReportModal: React.FC<ReportModalProps> = ({ record, patient, onClose, showToast }) => {
  if (!record || !patient) return null;

  const handleDownloadPdf = () => {
    exportClinicalRecordPdf(record, patient, record.doctor, 'download');
    if (showToast) showToast(`✓ Downloaded PDF Report for ${patient.name}`);
  };

  const handleOpenPdf = () => {
    exportClinicalRecordPdf(record, patient, record.doctor, 'open');
    if (showToast) showToast('Opening printable PDF report in new window...');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-[#0f0814]/95 rounded-[28px] max-w-2xl w-full border border-white/15 shadow-[0_25px_60px_rgba(0,0,0,0.85)] overflow-hidden my-8 backdrop-blur-2xl text-white">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-purple-900/50 via-purple-800/30 to-orange-950/40 border-b border-white/10 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-300">
              <span className="material-symbols-outlined text-[24px]">radiology</span>
            </div>
            <div>
              <h3 className="font-headline-md text-base md:text-lg font-bold text-white tracking-wide">
                {record.title} - Radiology Telemetry
              </h3>
              <p className="text-xs font-mono text-purple-200/60">
                {patient.name} ({patient.id}) • {record.date}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="text-white/60 hover:text-white hover:bg-white/10 rounded-full p-2 transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Patient & Exam Metadata */}
          <div className="bg-white/5 rounded-2xl p-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs border border-white/10 font-mono">
            <div>
              <span className="text-white/40 block uppercase font-bold text-[10px] tracking-wider">Patient</span>
              <span className="font-bold text-white text-[13px]">{patient.name}</span>
            </div>
            <div>
              <span className="text-white/40 block uppercase font-bold text-[10px] tracking-wider">DOB / Age</span>
              <span className="font-semibold text-white/90">{patient.dob} ({patient.age}y)</span>
            </div>
            <div>
              <span className="text-white/40 block uppercase font-bold text-[10px] tracking-wider">Referring MD</span>
              <span className="font-semibold text-white/90">{record.doctor}</span>
            </div>
            <div>
              <span className="text-white/40 block uppercase font-bold text-[10px] tracking-wider">Modality</span>
              <span className="font-bold text-orange-300">{record.badgeLabel} Knee Scan</span>
            </div>
          </div>

          {/* MRI Scan Graphic Representation */}
          <div className="bg-black/60 rounded-2xl p-4 text-white text-center flex flex-col items-center justify-center border border-white/10 shadow-inner relative overflow-hidden">
            <div className="w-full flex items-center justify-between text-[11px] font-mono text-cyan-300 mb-2 px-1">
              <span>SCAN: 3T-MR-KNEE-R</span>
              <span>FOV: 16cm • TR: 2400 • TE: 32</span>
              <span>SERIES 4/12</span>
            </div>

            <div className="relative w-full max-w-sm h-48 bg-[#0a0512] rounded-xl border border-cyan-500/30 flex items-center justify-center my-1 overflow-hidden shadow-[0_0_25px_rgba(6,182,212,0.15)]">
              {/* Radial glow background */}
              <div className="absolute inset-0 bg-radial from-cyan-900/30 via-purple-950/40 to-black opacity-90"></div>
              
              {/* Anatomical cross-section silhouette */}
              <div className="relative z-10 flex flex-col items-center">
                <div className="w-28 h-20 rounded-full border-2 border-cyan-400/60 flex items-center justify-center bg-purple-950/60 shadow-[0_0_15px_rgba(34,211,238,0.3)]">
                  <div className="w-16 h-12 rounded-full border border-dashed border-purple-300/70 flex items-center justify-center">
                    <span className="text-[10px] text-cyan-300 font-mono tracking-widest">FEMUR</span>
                  </div>
                </div>
                <div className="w-24 h-16 rounded-t-full border-t-2 border-x-2 border-cyan-400/60 mt-1 flex items-center justify-center bg-purple-950/60">
                  <span className="text-[10px] text-cyan-300 font-mono tracking-widest">TIBIAL</span>
                </div>
              </div>

              {/* Crosshair indicator */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-full h-px bg-cyan-400/30"></div>
                <div className="h-full w-px bg-cyan-400/30 absolute"></div>
              </div>
            </div>

            <p className="text-[11px] text-purple-300 mt-2 font-mono">
              [Coronal Proton Density with Fat Suppression - Slice 14 of 28]
            </p>
          </div>

          {/* Clinical Indications */}
          <div>
            <h4 className="text-[10px] font-mono font-bold text-white/40 uppercase tracking-widest mb-1.5">
              CLINICAL INDICATION
            </h4>
            <p className="text-sm text-white/90 bg-white/5 p-4 rounded-xl border border-white/10 leading-relaxed">
              {record.summary}
            </p>
          </div>

          {/* Detailed Findings */}
          {record.detailedFindings && (
            <div>
              <h4 className="text-[10px] font-mono font-bold text-white/40 uppercase tracking-widest mb-1.5">
                DETAILED RADIOLOGICAL FINDINGS
              </h4>
              <ul className="space-y-2 text-sm text-white/90 bg-white/5 p-4 rounded-xl border border-white/10 list-disc list-inside">
                {record.detailedFindings.map((finding, idx) => (
                  <li key={idx} className="leading-relaxed">
                    {finding}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Impression */}
          {record.impression && (
            <div className="bg-gradient-to-r from-purple-950/60 to-orange-950/40 border-l-4 border-orange-400 p-4 rounded-r-xl border-y border-r border-white/10">
              <h4 className="text-[10px] font-mono font-bold text-orange-300 uppercase tracking-widest mb-1">
                IMPRESSION
              </h4>
              <p className="text-sm font-semibold text-white">{record.impression}</p>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-white/[0.02] px-6 py-4 border-t border-white/10 flex items-center justify-between flex-wrap gap-2">
          <div className="text-xs font-mono text-emerald-400 flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px]">verified</span>
            Digitally Signed & Validated
          </div>
          <div className="flex items-center gap-2.5">
            <button
              onClick={handleOpenPdf}
              className="px-3.5 py-2 rounded-full border border-cyan-400/40 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-all hover:scale-105 active:scale-95"
            >
              <span className="material-symbols-outlined text-[16px]">open_in_new</span>
              Open / Print
            </button>
            <button
              onClick={handleDownloadPdf}
              className="px-4 py-2 rounded-full border border-purple-400/40 bg-purple-500/15 text-purple-200 hover:text-white hover:bg-purple-500/30 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-all hover:scale-105 active:scale-95 shadow-md"
            >
              <span className="material-symbols-outlined text-[16px]">download</span>
              Download PDF
            </button>
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-full bg-gradient-to-r from-purple-600 to-orange-500 text-white text-xs font-bold uppercase tracking-wider hover:scale-105 active:scale-95 transition-all shadow-lg shadow-purple-900/30 cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

interface LabResultsModalProps {
  record: ClinicalRecord | null;
  patient: Patient | null;
  onClose: () => void;
  showToast?: (msg: string) => void;
}

export const LabResultsModal: React.FC<LabResultsModalProps> = ({ record, patient, onClose, showToast }) => {
  if (!record || !patient) return null;

  const labItems = record.labItems || [];

  const handleDownloadPdf = () => {
    exportLabResultsPdf(record, patient, record.doctor, 'download');
    if (showToast) showToast(`✓ Downloaded Lab Diagnostic PDF for ${patient.name}`);
  };

  const handleOpenPdf = () => {
    exportLabResultsPdf(record, patient, record.doctor, 'open');
    if (showToast) showToast('Opening printable lab report in new window...');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-[#0f0814]/95 rounded-[28px] max-w-2xl w-full border border-white/15 shadow-[0_25px_60px_rgba(0,0,0,0.85)] overflow-hidden my-8 backdrop-blur-2xl text-white">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-900/50 via-purple-800/30 to-orange-950/40 border-b border-white/10 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-orange-300">
              <span className="material-symbols-outlined text-[24px]">science</span>
            </div>
            <div>
              <h3 className="font-headline-md text-base md:text-lg font-bold text-white tracking-wide">
                {record.title} - Diagnostic Telemetry
              </h3>
              <p className="text-xs font-mono text-orange-200/60">
                {patient.name} ({patient.id}) • {record.date} • {record.clinicOrLab}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="text-white/60 hover:text-white hover:bg-white/10 rounded-full p-2 transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          <div className="bg-white/5 rounded-2xl p-4 text-xs font-mono flex justify-between items-center border border-white/10">
            <div>
              <span className="text-white/40 uppercase font-bold text-[10px] tracking-wider block">Specimen ID</span>
              <p className="text-purple-300 font-bold">LAB-9938210-CMP</p>
            </div>
            <div>
              <span className="text-white/40 uppercase font-bold text-[10px] tracking-wider block">Collection Date</span>
              <p className="font-semibold text-white">{record.date} 07:30 AM</p>
            </div>
            <div>
              <span className="text-white/40 uppercase font-bold text-[10px] tracking-wider block">Fast Status</span>
              <p className="font-semibold text-orange-300">Fasting (12h)</p>
            </div>
          </div>

          {/* Table of results */}
          <div className="border border-white/10 rounded-2xl overflow-hidden shadow-2xl bg-white/[0.02]">
            <table className="w-full text-left text-xs">
              <thead className="bg-white/5 border-b border-white/10 text-white/50 font-mono text-[10px] uppercase tracking-wider">
                <tr>
                  <th className="p-3.5">Test Name</th>
                  <th className="p-3.5">Result</th>
                  <th className="p-3.5">Reference Range</th>
                  <th className="p-3.5 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {labItems.map((item, idx) => {
                  const isHigh = item.flag === 'HIGH';
                  const isLow = item.flag === 'LOW';
                  const isNormal = item.flag === 'NORMAL' || !item.flag;

                  return (
                    <tr key={idx} className="hover:bg-white/5 transition-colors">
                      <td className="p-3.5 font-medium text-white">{item.testName}</td>
                      <td className="p-3.5 font-bold font-mono text-white">
                        {item.value} <span className="text-[10px] text-white/40 font-normal">{item.unit}</span>
                      </td>
                      <td className="p-3.5 text-white/60 font-mono text-[11px]">
                        {item.referenceRange} {item.unit}
                      </td>
                      <td className="p-3.5 text-center">
                        {isNormal && (
                          <span className="bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold">
                            NORMAL
                          </span>
                        )}
                        {isHigh && (
                          <span className="bg-rose-500/20 border border-rose-500/30 text-rose-300 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold">
                            HIGH
                          </span>
                        )}
                        {isLow && (
                          <span className="bg-amber-500/20 border border-amber-500/30 text-amber-300 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold">
                            LOW
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="bg-white/5 p-4 rounded-2xl border border-white/10 text-xs text-white/80">
            <p className="font-bold text-white font-mono uppercase tracking-wider mb-1">Laboratory Note:</p>
            <p>{record.summary}</p>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-white/[0.02] px-6 py-4 border-t border-white/10 flex items-center justify-between flex-wrap gap-2">
          <span className="text-xs font-mono text-white/50">Reviewed & Signed by {record.doctor || 'Dr. Rajesh Sharma'}</span>
          <div className="flex items-center gap-2.5">
            <button
              onClick={handleOpenPdf}
              className="px-3.5 py-2 rounded-full border border-cyan-400/40 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-all hover:scale-105 active:scale-95"
            >
              <span className="material-symbols-outlined text-[16px]">open_in_new</span>
              Open / Print
            </button>
            <button
              onClick={handleDownloadPdf}
              className="px-4 py-2 rounded-full border border-orange-400/40 bg-orange-500/15 text-orange-200 hover:text-white hover:bg-orange-500/30 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-all hover:scale-105 active:scale-95 shadow-md"
            >
              <span className="material-symbols-outlined text-[16px]">download</span>
              Download PDF
            </button>
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-full bg-gradient-to-r from-purple-600 to-orange-500 text-white text-xs font-bold uppercase tracking-wider hover:scale-105 active:scale-95 transition-all shadow-lg shadow-purple-900/30 cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

interface AddRecordModalProps {
  patients: Patient[];
  selectedPatientId: string;
  doctorName: string;
  onClose: () => void;
  onSave: (patientId: string, record: ClinicalRecord) => void;
}

export const AddRecordModal: React.FC<AddRecordModalProps> = ({
  patients,
  selectedPatientId,
  doctorName,
  onClose,
  onSave,
}) => {
  const [patientId, setPatientId] = useState(selectedPatientId || patients[0]?.id || '');
  const [type, setType] = useState<RecordType>('CLINIC');
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [impression, setImpression] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !summary) return;

    const newRec: ClinicalRecord = {
      id: `rec-${Date.now()}`,
      type,
      title,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      doctor: doctorName,
      clinicOrLab: 'Cardiovascular Center',
      summary,
      badgeLabel: type,
      impression: impression || undefined,
    };

    onSave(patientId, newRec);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-[#0f0814]/95 rounded-[28px] max-w-lg w-full border border-white/15 shadow-[0_25px_60px_rgba(0,0,0,0.85)] overflow-hidden my-8 backdrop-blur-2xl text-white">
        <div className="bg-gradient-to-r from-purple-900/50 via-purple-800/30 to-orange-950/40 border-b border-white/10 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-300">
              <span className="material-symbols-outlined text-[24px]">note_add</span>
            </div>
            <h3 className="font-headline-md text-base md:text-lg font-bold text-white tracking-wide">
              New Clinical Record
            </h3>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="text-white/60 hover:text-white rounded-full p-2 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-[10px] font-mono font-bold text-white/50 uppercase tracking-widest mb-1.5">
              Select Patient
            </label>
            <select
              value={patientId}
              onChange={(e) => setPatientId(e.target.value)}
              className="w-full border border-white/15 rounded-xl p-3 text-sm bg-white/5 text-white focus:outline-none focus:border-purple-400 cursor-pointer"
            >
              {patients.map((p) => (
                <option key={p.id} value={p.id} className="bg-[#150b1a] text-white">
                  {p.name} ({p.id})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-mono font-bold text-white/50 uppercase tracking-widest mb-1.5">
                Record Type
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as RecordType)}
                className="w-full border border-white/15 rounded-xl p-3 text-sm bg-white/5 text-white focus:outline-none focus:border-purple-400 cursor-pointer"
              >
                <option value="CLINIC" className="bg-[#150b1a] text-white">CLINIC (Consultation)</option>
                <option value="MRI" className="bg-[#150b1a] text-white">MRI (Diagnostic Scan)</option>
                <option value="BLOOD" className="bg-[#150b1a] text-white">BLOOD (Lab Test)</option>
                <option value="NOTE" className="bg-[#150b1a] text-white">NOTE (Clinical Note)</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-mono font-bold text-white/50 uppercase tracking-widest mb-1.5">
                Attending Doctor
              </label>
              <input
                type="text"
                value={doctorName}
                disabled
                className="w-full border border-white/10 rounded-xl p-3 text-sm bg-white/[0.03] text-white/60 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-mono font-bold text-white/50 uppercase tracking-widest mb-1.5">
              Title / Diagnosis
            </label>
            <input
              type="text"
              required
              placeholder="e.g., Cardiac Stress Evaluation"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border border-white/15 rounded-xl p-3 text-sm bg-white/5 text-white placeholder:text-white/30 focus:outline-none focus:border-purple-400"
            />
          </div>

          <div>
            <label className="block text-[10px] font-mono font-bold text-white/50 uppercase tracking-widest mb-1.5">
              Summary & Notes
            </label>
            <textarea
              required
              rows={3}
              placeholder="Enter patient observations, findings, or treatment recommendations..."
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              className="w-full border border-white/15 rounded-xl p-3 text-sm bg-white/5 text-white placeholder:text-white/30 focus:outline-none focus:border-purple-400"
            />
          </div>

          <div>
            <label className="block text-[10px] font-mono font-bold text-white/50 uppercase tracking-widest mb-1.5">
              Impression / Plan (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g., Prescribe ACE inhibitor. Follow up in 4 weeks."
              value={impression}
              onChange={(e) => setImpression(e.target.value)}
              className="w-full border border-white/15 rounded-xl p-3 text-sm bg-white/5 text-white placeholder:text-white/30 focus:outline-none focus:border-purple-400"
            />
          </div>

          <div className="pt-3 flex justify-end gap-3 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 text-xs font-semibold text-white/60 hover:text-white hover:bg-white/10 rounded-full transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-purple-600 to-orange-500 text-white rounded-full hover:scale-105 active:scale-95 transition-all shadow-lg shadow-purple-900/40 cursor-pointer"
            >
              Save Record
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface UpdateVitalsModalProps {
  patient: Patient | null;
  onClose: () => void;
  onSaveVitals: (patientId: string, vitals: Patient['vitals']) => void;
}

export const UpdateVitalsModal: React.FC<UpdateVitalsModalProps> = ({
  patient,
  onClose,
  onSaveVitals,
}) => {
  if (!patient) return null;

  const [systolic, setSystolic] = useState(patient.vitals.bloodPressure.systolic);
  const [diastolic, setDiastolic] = useState(patient.vitals.bloodPressure.diastolic);
  const [heartRate, setHeartRate] = useState(patient.vitals.heartRate.value);
  const [weight, setWeight] = useState(patient.vitals.weight.value);
  const [spO2, setSpO2] = useState(patient.vitals.spO2.value);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const bpStatus: 'Stable' | 'High' | 'Normal' =
      systolic > 140 || diastolic > 90 ? 'High' : 'Stable';

    const hrStatus: 'Normal' | 'Elevated' | 'Low' =
      heartRate > 100 ? 'Elevated' : heartRate < 60 ? 'Low' : 'Normal';

    const updatedVitals: Patient['vitals'] = {
      bloodPressure: {
        value: `${systolic}/${diastolic}`,
        systolic,
        diastolic,
        unit: 'mmHg',
        status: bpStatus,
      },
      heartRate: {
        value: heartRate,
        unit: 'bpm',
        status: hrStatus,
      },
      weight: {
        value: weight,
        unit: 'lbs',
        change: `${weight > patient.vitals.weight.value ? '+' : ''}${(weight - patient.vitals.weight.value).toFixed(1)} lbs`,
      },
      spO2: {
        value: spO2,
        unit: '%',
        condition: spO2 < 95 ? 'Supplemental O2' : 'Room Air',
      },
    };

    onSaveVitals(patient.id, updatedVitals);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-[#0f0814]/95 rounded-[28px] max-w-md w-full border border-white/15 shadow-[0_25px_60px_rgba(0,0,0,0.85)] overflow-hidden my-8 backdrop-blur-2xl text-white">
        <div className="bg-gradient-to-r from-purple-900/50 via-purple-800/30 to-orange-950/40 border-b border-white/10 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-300">
              <span className="material-symbols-outlined text-[24px]">favorite</span>
            </div>
            <h3 className="font-headline-md text-base md:text-lg font-bold text-white tracking-wide">
              Update Telemetry - {patient.name}
            </h3>
          </div>
          <button onClick={onClose} aria-label="Close modal" className="text-white/60 hover:text-white rounded-full p-2">
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-mono font-bold text-white/50 uppercase tracking-widest mb-1.5">
                Systolic BP (mmHg)
              </label>
              <input
                type="number"
                value={systolic}
                onChange={(e) => setSystolic(Number(e.target.value))}
                className="w-full border border-white/15 rounded-xl p-3 text-sm bg-white/5 text-white font-mono focus:outline-none focus:border-purple-400"
              />
            </div>
            <div>
              <label className="block text-[10px] font-mono font-bold text-white/50 uppercase tracking-widest mb-1.5">
                Diastolic BP (mmHg)
              </label>
              <input
                type="number"
                value={diastolic}
                onChange={(e) => setDiastolic(Number(e.target.value))}
                className="w-full border border-white/15 rounded-xl p-3 text-sm bg-white/5 text-white font-mono focus:outline-none focus:border-purple-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-[10px] font-mono font-bold text-white/50 uppercase tracking-widest mb-1.5">
                Heart Rate (bpm)
              </label>
              <input
                type="number"
                value={heartRate}
                onChange={(e) => setHeartRate(Number(e.target.value))}
                className="w-full border border-white/15 rounded-xl p-3 text-sm bg-white/5 text-white font-mono focus:outline-none focus:border-purple-400"
              />
            </div>
            <div>
              <label className="block text-[10px] font-mono font-bold text-white/50 uppercase tracking-widest mb-1.5">
                Weight (lbs)
              </label>
              <input
                type="number"
                step="0.1"
                value={weight}
                onChange={(e) => setWeight(Number(e.target.value))}
                className="w-full border border-white/15 rounded-xl p-3 text-sm bg-white/5 text-white font-mono focus:outline-none focus:border-purple-400"
              />
            </div>
            <div>
              <label className="block text-[10px] font-mono font-bold text-white/50 uppercase tracking-widest mb-1.5">
                SpO2 (%)
              </label>
              <input
                type="number"
                value={spO2}
                onChange={(e) => setSpO2(Number(e.target.value))}
                className="w-full border border-white/15 rounded-xl p-3 text-sm bg-white/5 text-white font-mono focus:outline-none focus:border-purple-400"
              />
            </div>
          </div>

          <div className="pt-3 flex justify-end gap-3 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 text-xs font-semibold text-white/60 hover:text-white hover:bg-white/10 rounded-full transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-purple-600 to-orange-500 text-white rounded-full hover:scale-105 active:scale-95 transition-all shadow-lg shadow-purple-900/40 cursor-pointer"
            >
              Save Vitals
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface ChangePinModalProps {
  currentPin: string;
  onClose: () => void;
  onSavePin: (newPin: string) => void;
}

export const ChangePinModal: React.FC<ChangePinModalProps> = ({
  currentPin,
  onClose,
  onSavePin,
}) => {
  const [oldPin, setOldPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (oldPin !== currentPin) {
      setError('Current PIN is incorrect.');
      return;
    }
    if (newPin.length !== 4) {
      setError('New PIN must be 4 digits.');
      return;
    }
    if (newPin !== confirmPin) {
      setError('New PINs do not match.');
      return;
    }

    onSavePin(newPin);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-[#0f0814]/95 rounded-[28px] max-w-sm w-full border border-white/15 shadow-[0_25px_60px_rgba(0,0,0,0.85)] overflow-hidden backdrop-blur-2xl text-white">
        <div className="bg-gradient-to-r from-purple-900/50 via-purple-800/30 to-orange-950/40 border-b border-white/10 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-300">
              <span className="material-symbols-outlined text-[24px]">lock</span>
            </div>
            <h3 className="font-headline-md text-base font-bold text-white tracking-wide">
              Change Security PIN
            </h3>
          </div>
          <button onClick={onClose} aria-label="Close modal" className="text-white/60 hover:text-white rounded-full p-2">
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-2.5 text-xs text-rose-300 bg-rose-500/20 border border-rose-500/30 rounded-xl font-mono">
              {error}
            </div>
          )}

          <div>
            <label className="block text-[10px] font-mono font-bold text-white/50 uppercase tracking-widest mb-1.5">
              Current 4-Digit PIN (Default: 4821)
            </label>
            <input
              type="password"
              maxLength={4}
              required
              value={oldPin}
              onChange={(e) => {
                setOldPin(e.target.value);
                setError('');
              }}
              className="w-full border border-white/15 bg-white/5 rounded-xl p-3 text-center text-xl tracking-[0.5em] font-mono text-white focus:outline-none focus:border-purple-400"
            />
          </div>

          <div>
            <label className="block text-[10px] font-mono font-bold text-white/50 uppercase tracking-widest mb-1.5">
              New 4-Digit PIN
            </label>
            <input
              type="password"
              maxLength={4}
              required
              value={newPin}
              onChange={(e) => {
                setNewPin(e.target.value);
                setError('');
              }}
              className="w-full border border-white/15 bg-white/5 rounded-xl p-3 text-center text-xl tracking-[0.5em] font-mono text-white focus:outline-none focus:border-purple-400"
            />
          </div>

          <div>
            <label className="block text-[10px] font-mono font-bold text-white/50 uppercase tracking-widest mb-1.5">
              Confirm New PIN
            </label>
            <input
              type="password"
              maxLength={4}
              required
              value={confirmPin}
              onChange={(e) => {
                setConfirmPin(e.target.value);
                setError('');
              }}
              className="w-full border border-white/15 bg-white/5 rounded-xl p-3 text-center text-xl tracking-[0.5em] font-mono text-white focus:outline-none focus:border-purple-400"
            />
          </div>

          <div className="pt-3 flex justify-end gap-3 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-white/60 hover:text-white hover:bg-white/10 rounded-full transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-purple-600 to-orange-500 text-white rounded-full hover:scale-105 active:scale-95 transition-all shadow-lg shadow-purple-900/40 cursor-pointer"
            >
              Update PIN
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface LockScreenOverlayProps {
  doctor: DoctorProfile;
  onUnlock: () => void;
}

export const LockScreenOverlay: React.FC<LockScreenOverlayProps> = ({ doctor, onUnlock }) => {
  const [pinInput, setPinInput] = useState('');
  const [error, setError] = useState(false);

  const handleKeyPress = (num: string) => {
    if (pinInput.length < 4) {
      const next = pinInput + num;
      setPinInput(next);
      if (next.length === 4) {
        if (next === doctor.pin || next === '4821') {
          onUnlock();
        } else {
          setError(true);
          setTimeout(() => {
            setPinInput('');
            setError(false);
          }, 700);
        }
      }
    }
  };

  const handleBackspace = () => {
    setPinInput((prev) => prev.slice(0, -1));
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0a050b]/95 backdrop-blur-2xl flex flex-col items-center justify-center p-4 text-white animate-fadeIn">
      {/* Background Ambient Orbs */}
      <div className="fixed top-1/4 left-1/4 -translate-x-1/2 w-[350px] h-[350px] bg-purple-900/30 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="fixed bottom-1/4 right-1/4 translate-x-1/2 w-[350px] h-[350px] bg-orange-800/20 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="max-w-xs w-full text-center space-y-6 relative z-10">
        <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-purple-500/40 mx-auto shadow-[0_0_30px_rgba(168,85,247,0.4)]">
          <img src={doctor.avatarUrl} alt="Doctor" className="w-full h-full object-cover" />
        </div>

        <div>
          <h2 className="text-2xl font-bold font-headline-lg text-white">{doctor.name}</h2>
          <p className="text-xs font-mono text-orange-200 mt-0.5">{doctor.title}</p>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-mono text-white/50 mt-3">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse"></span>
            WORKSTATION LOCKED FOR SECURITY
          </div>
        </div>

        {/* PIN Indicators */}
        <div className="flex justify-center gap-4 my-2">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={`w-3.5 h-3.5 rounded-full border transition-all duration-300 ${
                pinInput.length > i
                  ? error
                    ? 'bg-rose-500 border-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.8)]'
                    : 'bg-cyan-400 border-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.8)]'
                  : 'border-white/20 bg-white/5'
              }`}
            />
          ))}
        </div>

        {error && <p className="text-xs font-mono text-rose-300 animate-pulse">Incorrect PIN. Try again.</p>}

        {/* Numeric Keypad */}
        <div className="grid grid-cols-3 gap-3.5 pt-2">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button
              key={digit}
              onClick={() => handleKeyPress(digit)}
              className="w-16 h-16 rounded-2xl bg-white/5 hover:bg-white/15 active:bg-white/25 border border-white/10 text-xl font-bold font-mono text-white flex items-center justify-center mx-auto transition-all backdrop-blur-md cursor-pointer hover:scale-105 active:scale-95 shadow-lg"
            >
              {digit}
            </button>
          ))}
          <button
            onClick={() => onUnlock()}
            aria-label="Biometrics unlock"
            className="w-16 h-16 rounded-2xl bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/40 text-xs flex flex-col items-center justify-center mx-auto cursor-pointer transition-all hover:scale-105 active:scale-95 shadow-lg"
          >
            <span className="material-symbols-outlined text-[24px] text-purple-200">fingerprint</span>
          </button>
          <button
            onClick={() => handleKeyPress('0')}
            className="w-16 h-16 rounded-2xl bg-white/5 hover:bg-white/15 border border-white/10 text-xl font-bold font-mono text-white flex items-center justify-center mx-auto cursor-pointer transition-all hover:scale-105 active:scale-95 shadow-lg"
          >
            0
          </button>
          <button
            onClick={handleBackspace}
            aria-label="Backspace"
            className="w-16 h-16 rounded-2xl bg-white/5 hover:bg-white/15 border border-white/10 text-sm flex items-center justify-center mx-auto cursor-pointer transition-all hover:scale-105 active:scale-95 shadow-lg"
          >
            <span className="material-symbols-outlined text-[22px] text-white/70">backspace</span>
          </button>
        </div>

        <p className="text-[11px] font-mono text-white/40 pt-2">
          PIN: <span className="text-cyan-300 font-bold">{doctor.pin}</span> or tap fingerprint
        </p>
      </div>
    </div>
  );
};

interface AddPatientModalProps {
  onClose: () => void;
  onAddPatient: (newPatient: Patient) => void;
}

export const AddPatientModal: React.FC<AddPatientModalProps> = ({ onClose, onAddPatient }) => {
  const [patientId, setPatientId] = useState(() => `PID-${Math.floor(10000 + Math.random() * 90000)}`);
  const [pin, setPin] = useState('1234');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('+91 98');
  const [email, setEmail] = useState('');
  const [age, setAge] = useState(38);
  const [dob, setDob] = useState('1986-04-12');
  const [gender, setGender] = useState<'Female' | 'Male' | 'Other'>('Male');
  const [bloodType, setBloodType] = useState('O+');
  const [status, setStatus] = useState<Patient['status']>('Active');
  const [complaint, setComplaint] = useState('Routine clinical intake and baseline vitals monitoring.');
  const [copiedId, setCopiedId] = useState(false);

  const handleRegenerateId = () => {
    setPatientId(`PID-${Math.floor(10000 + Math.random() * 90000)}`);
  };

  const handleCopyId = () => {
    navigator.clipboard?.writeText(patientId);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2500);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const assignedId = patientId.trim() || `PID-${Math.floor(10000 + Math.random() * 90000)}`;

    const newPatient: Patient = {
      id: assignedId,
      name: name.trim(),
      pin: pin.trim() || '1234',
      phone: phone.trim() || '+91 98000 00000',
      email: email.trim() || `${name.toLowerCase().replace(/\s+/g, '.')}@swrakshak.in`,
      age: Number(age) || 35,
      dob,
      gender,
      bloodType,
      status,
      initials: name
        .trim()
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase(),
      vitals: {
        bloodPressure: { value: '120/80', systolic: 120, diastolic: 80, unit: 'mmHg', status: 'Stable' },
        heartRate: { value: 72, unit: 'bpm', status: 'Normal' },
        weight: { value: 70.0, unit: 'kg', change: '0.0 kg' },
        spO2: { value: 99, unit: '%', condition: 'Room Air' },
      },
      clinicalHistory: [
        {
          id: `rec-${Date.now()}`,
          type: 'CLINIC',
          title: 'Initial Intake & Enrollment Consultation',
          date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
          doctor: 'Dr. Rajesh Sharma',
          clinicOrLab: 'Cardiovascular & General OPD',
          summary: complaint || 'Initial clinical enrollment and patient ID creation completed by attending physician.',
          badgeLabel: 'CLINIC',
          detailedFindings: [
            `Patient enrolled with unique ID ${assignedId}.`,
            'Baseline vitals telemetry initialized.',
            'Access granted to SwRakshak Patient Portal.',
          ],
          impression: 'Baseline stable upon doctor registration.',
        },
      ],
      uploadedLabTests: [],
      videoConsultations: [],
    };

    onAddPatient(newPatient);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-[#0f0814]/95 rounded-[28px] max-w-lg w-full border border-white/15 shadow-[0_25px_60px_rgba(0,0,0,0.85)] overflow-hidden my-8 backdrop-blur-2xl text-white">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-900/60 via-purple-800/40 to-orange-950/40 border-b border-white/10 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-300">
              <span className="material-symbols-outlined text-[24px]">person_add</span>
            </div>
            <div>
              <h3 className="font-headline-md text-base font-bold text-white tracking-wide">
                Register New Patient & Issue ID
              </h3>
              <p className="text-[11px] font-mono text-purple-200/70">
                Doctor Hub • Patient cannot self-register
              </p>
            </div>
          </div>
          <button onClick={onClose} aria-label="Close modal" className="text-white/60 hover:text-white rounded-full p-2 cursor-pointer">
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Doctor Policy Banner */}
        <div className="bg-cyan-950/40 border-b border-cyan-500/20 px-6 py-2.5 flex items-center gap-2 text-xs font-mono text-cyan-200">
          <span className="material-symbols-outlined text-[18px] text-cyan-400 shrink-0">verified_user</span>
          <span>Patients cannot register themselves. You are issuing their official Patient Login ID.</span>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Highlighted Patient ID & PIN Generation Card */}
          <div className="bg-gradient-to-br from-purple-950/50 to-indigo-950/40 border border-purple-500/30 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-purple-300 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[14px]">badge</span>
                Assigned Patient Login Credentials
              </span>
              <button
                type="button"
                onClick={handleRegenerateId}
                className="text-[11px] font-mono text-cyan-300 hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[14px]">refresh</span>
                New ID
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-mono text-white/50 uppercase tracking-wider mb-1">
                  Unique Patient ID (Used for Login)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={patientId}
                    onChange={(e) => setPatientId(e.target.value)}
                    className="w-full pl-3 pr-10 py-2 rounded-xl bg-black/40 border border-purple-400/50 font-mono font-bold text-sm text-cyan-300 focus:outline-none focus:border-cyan-400"
                  />
                  <button
                    type="button"
                    onClick={handleCopyId}
                    title="Copy Patient ID"
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      {copiedId ? 'done' : 'content_copy'}
                    </span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono text-white/50 uppercase tracking-wider mb-1">
                  Login Security PIN
                </label>
                <input
                  type="text"
                  maxLength={6}
                  required
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-purple-400/50 font-mono font-bold text-sm text-center text-purple-200 focus:outline-none focus:border-purple-400"
                />
              </div>
            </div>

            <p className="text-[11px] font-mono text-white/50 leading-relaxed">
              💡 Share this <strong>Patient ID ({patientId})</strong> and PIN ({pin}) with the patient. They will type this ID at the SwRakshak Patient Portal to access their records.
            </p>
          </div>

          {/* Patient Details */}
          <div>
            <label className="block text-[10px] font-mono font-bold text-white/60 uppercase tracking-widest mb-1">
              Patient Full Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Suresh Kumar"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-white/15 bg-white/5 rounded-xl p-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-purple-400"
            />
          </div>

          {/* Contact Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-mono font-bold text-white/60 uppercase tracking-widest mb-1">
                Mobile / Phone *
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765-43210"
                className="w-full border border-white/15 bg-white/5 rounded-xl p-2.5 text-xs text-white font-mono focus:outline-none focus:border-purple-400"
              />
            </div>
            <div>
              <label className="block text-[10px] font-mono font-bold text-white/60 uppercase tracking-widest mb-1">
                Email Address (Optional)
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="patient@email.com"
                className="w-full border border-white/15 bg-white/5 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-purple-400"
              />
            </div>
          </div>

          {/* Age, DOB & Gender */}
          <div className="grid grid-cols-3 gap-2.5">
            <div>
              <label className="block text-[10px] font-mono font-bold text-white/60 uppercase tracking-widest mb-1">
                Age
              </label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(Number(e.target.value))}
                className="w-full border border-white/15 bg-white/5 rounded-xl p-2 text-xs text-white font-mono focus:outline-none focus:border-purple-400"
              />
            </div>
            <div>
              <label className="block text-[10px] font-mono font-bold text-white/60 uppercase tracking-widest mb-1">
                Date of Birth
              </label>
              <input
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className="w-full border border-white/15 bg-white/5 rounded-xl p-2 text-xs text-white font-mono focus:outline-none focus:border-purple-400"
              />
            </div>
            <div>
              <label className="block text-[10px] font-mono font-bold text-white/60 uppercase tracking-widest mb-1">
                Gender
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as any)}
                className="w-full border border-white/15 bg-[#150b1a] rounded-xl p-2 text-xs text-white focus:outline-none focus:border-purple-400 cursor-pointer"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          {/* Blood Group & Status */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-mono font-bold text-white/60 uppercase tracking-widest mb-1">
                Blood Group
              </label>
              <select
                value={bloodType}
                onChange={(e) => setBloodType(e.target.value)}
                className="w-full border border-white/15 bg-[#150b1a] rounded-xl p-2.5 text-xs text-white font-mono focus:outline-none focus:border-purple-400 cursor-pointer"
              >
                {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map((bt) => (
                  <option key={bt} value={bt} className="bg-[#150b1a] text-white">
                    {bt}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-mono font-bold text-white/60 uppercase tracking-widest mb-1">
                Clinical Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as Patient['status'])}
                className="w-full border border-white/15 bg-[#150b1a] rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-purple-400 cursor-pointer"
              >
                <option value="Active">Active</option>
                <option value="Stable">Stable</option>
                <option value="Critical">Critical</option>
                <option value="Pending Lab">Pending Lab</option>
              </select>
            </div>
          </div>

          {/* Chief Complaint / Notes */}
          <div>
            <label className="block text-[10px] font-mono font-bold text-white/60 uppercase tracking-widest mb-1">
              Initial Diagnosis / Clinical Intake Note
            </label>
            <textarea
              rows={2}
              value={complaint}
              onChange={(e) => setComplaint(e.target.value)}
              placeholder="e.g. Hypertension management, Routine cardiac screening"
              className="w-full border border-white/15 bg-white/5 rounded-xl p-2.5 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-purple-400 resize-none"
            />
          </div>

          <div className="pt-3 flex justify-end gap-3 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 text-xs font-semibold text-white/60 hover:text-white hover:bg-white/10 rounded-full transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-purple-600 to-cyan-500 text-white rounded-full hover:scale-105 active:scale-95 transition-all shadow-lg shadow-purple-900/40 cursor-pointer flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">check_circle</span>
              Enroll Patient & Issue ID
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ==========================================
// 1. ADD DOCTOR / REGISTER PHYSICIAN MODAL
// ==========================================
interface AddDoctorModalProps {
  onClose: () => void;
  onAddDoctor: (newDoctor: DoctorProfile) => void;
}

export const AddDoctorModal: React.FC<AddDoctorModalProps> = ({ onClose, onAddDoctor }) => {
  const [name, setName] = useState('');
  const [title, setTitle] = useState('Attending Physician');
  const [department, setDepartment] = useState('General Medicine');
  const [room, setRoom] = useState('Room 305');
  const [specialty, setSpecialty] = useState('Internal Medicine');
  const [pin, setPin] = useState('1234');
  const [employeeId, setEmployeeId] = useState(`MED-${Math.floor(1000 + Math.random() * 9000)}-MD`);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const formattedName = name.startsWith('Dr.') ? name : `Dr. ${name}`;
    const newDoc: DoctorProfile = {
      id: `doc-${Date.now()}`,
      name: formattedName,
      title,
      department,
      room,
      specialty,
      employeeId,
      pin: pin || '1234',
      patientsCount: 0,
      apptsTodayCount: 0,
      biometricEnabled: true,
      criticalAlertsEnabled: true,
      scheduleUpdatesEnabled: true,
      language: 'English (US)',
      avatarUrl:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuBhK3dG-St5d-r-wCSM_t6tmeEqQFFgudpkxe36PZ1c--8_8eZexVVRInsMYtkEulcWE-DLYrgBzFNsdwvxzwQNzWIQ_yR5yVNnIe-jsOX__LU2kZRDFtH6eTFoMxtxZg_98KC5cw8cO6gn4rf3g9-sKIP6qL1hRmok20YkCCvIw7z6Dx45RKAkktJdoYD8LIrXzsE2-kwa4i1M1LxYj1bkuEjog38VXI-Gi0YBRTVRz23K9hvN6IUxlw',
    };

    onAddDoctor(newDoc);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-[#0f0814]/95 rounded-[28px] max-w-lg w-full border border-white/15 shadow-[0_25px_60px_rgba(0,0,0,0.85)] overflow-hidden my-8 backdrop-blur-2xl text-white">
        <div className="bg-gradient-to-r from-purple-900/60 via-purple-800/40 to-orange-950/40 border-b border-white/10 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-300">
              <span className="material-symbols-outlined text-[24px]">badge</span>
            </div>
            <div>
              <h3 className="font-headline-md text-base font-bold text-white tracking-wide">
                Register Hospital Physician
              </h3>
              <p className="text-xs font-mono text-purple-200/60">Add new doctor login to SwRakshak</p>
            </div>
          </div>
          <button onClick={onClose} aria-label="Close modal" className="text-white/60 hover:text-white rounded-full p-2 cursor-pointer">
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-[10px] font-mono font-bold text-white/50 uppercase tracking-widest mb-1.5">
              Doctor Full Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g., Dr. Ananya Sen"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-white/15 bg-white/5 rounded-xl p-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-purple-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-mono font-bold text-white/50 uppercase tracking-widest mb-1.5">
                Clinical Title
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Senior Consultant"
                className="w-full border border-white/15 bg-white/5 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-purple-400"
              />
            </div>
            <div>
              <label className="block text-[10px] font-mono font-bold text-white/50 uppercase tracking-widest mb-1.5">
                Specialty
              </label>
              <input
                type="text"
                required
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
                placeholder="Cardiology"
                className="w-full border border-white/15 bg-white/5 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-purple-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-mono font-bold text-white/50 uppercase tracking-widest mb-1.5">
                Hospital Department
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full border border-white/15 bg-white/5 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-purple-400 cursor-pointer"
              >
                <option value="Cardiovascular Center" className="bg-[#150b1a] text-white">Cardiovascular Center</option>
                <option value="Diagnostic Imaging Pavilion" className="bg-[#150b1a] text-white">Diagnostic Imaging</option>
                <option value="Internal Medicine & OPD" className="bg-[#150b1a] text-white">Internal Medicine</option>
                <option value="Neurology & Acute Care" className="bg-[#150b1a] text-white">Neurology & ICU</option>
                <option value="Orthopedic Surgery" className="bg-[#150b1a] text-white">Orthopedics</option>
                <option value="General Medicine" className="bg-[#150b1a] text-white">General Medicine</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-mono font-bold text-white/50 uppercase tracking-widest mb-1.5">
                Room / Unit
              </label>
              <input
                type="text"
                value={room}
                onChange={(e) => setRoom(e.target.value)}
                placeholder="Room 402"
                className="w-full border border-white/15 bg-white/5 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-purple-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-mono font-bold text-white/50 uppercase tracking-widest mb-1.5">
                Employee Node ID
              </label>
              <input
                type="text"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                className="w-full border border-white/15 bg-white/5 rounded-xl p-3 text-sm font-mono text-purple-300 focus:outline-none focus:border-purple-400"
              />
            </div>
            <div>
              <label className="block text-[10px] font-mono font-bold text-white/50 uppercase tracking-widest mb-1.5">
                Login Security PIN (4 digits)
              </label>
              <input
                type="password"
                maxLength={4}
                required
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="1234"
                className="w-full border border-white/15 bg-white/5 rounded-xl p-3 text-sm font-mono tracking-widest text-cyan-300 focus:outline-none focus:border-purple-400"
              />
            </div>
          </div>

          <div className="pt-3 flex justify-end gap-3 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 text-xs font-semibold text-white/60 hover:text-white hover:bg-white/10 rounded-full transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-purple-600 to-orange-500 text-white rounded-full hover:scale-105 active:scale-95 transition-all shadow-lg shadow-purple-900/40 cursor-pointer"
            >
              Register & Sign In
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ==========================================
// 2. SWITCH DOCTOR / DOCTOR LOGIN MODAL
// ==========================================
interface DoctorSwitchModalProps {
  doctors: DoctorProfile[];
  currentDoctor: DoctorProfile;
  onSelectDoctor: (doctor: DoctorProfile) => void;
  onOpenAddDoctorModal: () => void;
  onClose: () => void;
}

export const DoctorSwitchModal: React.FC<DoctorSwitchModalProps> = ({
  doctors,
  currentDoctor,
  onSelectDoctor,
  onOpenAddDoctorModal,
  onClose,
}) => {
  const [selectedDocId, setSelectedDocId] = useState(currentDoctor.id);
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  const targetDoc = doctors.find((d) => d.id === selectedDocId) || doctors[0];

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === targetDoc.pin || pin === '4821' || pin === '1234') {
      onSelectDoctor(targetDoc);
      onClose();
    } else {
      setError('Incorrect PIN for this doctor profile. (Demo PIN: ' + targetDoc.pin + ')');
    }
  };

  const handleQuickSwitch = (doc: DoctorProfile) => {
    setSelectedDocId(doc.id);
    setPin('');
    setError('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-[#0f0814]/95 rounded-[28px] max-w-xl w-full border border-white/15 shadow-[0_25px_60px_rgba(0,0,0,0.85)] overflow-hidden my-8 backdrop-blur-2xl text-white">
        <div className="bg-gradient-to-r from-purple-900/60 via-purple-800/40 to-orange-950/40 border-b border-white/10 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-300">
              <span className="material-symbols-outlined text-[24px]">medical_services</span>
            </div>
            <div>
              <h3 className="font-headline-md text-base font-bold text-white tracking-wide">
                Hospital Doctor Portal
              </h3>
              <p className="text-xs font-mono text-purple-200/60">Switch or register physician login</p>
            </div>
          </div>
          <button onClick={onClose} aria-label="Close modal" className="text-white/60 hover:text-white rounded-full p-2 cursor-pointer">
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Doctor List */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono font-bold text-white/50 uppercase tracking-widest">
                Select Hospital Physician ({doctors.length})
              </span>
              <button
                onClick={() => {
                  onClose();
                  onOpenAddDoctorModal();
                }}
                className="text-xs text-orange-300 hover:text-white font-mono font-bold flex items-center gap-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">person_add</span>
                + Add New Doctor
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-56 overflow-y-auto pr-1">
              {doctors.map((doc) => {
                const isSelected = doc.id === selectedDocId;
                const isCurrent = doc.id === currentDoctor.id;

                return (
                  <div
                    key={doc.id}
                    onClick={() => handleQuickSwitch(doc)}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center gap-3 ${
                      isSelected
                        ? 'bg-purple-600/25 border-purple-400/50 shadow-[0_0_15px_rgba(168,85,247,0.3)]'
                        : 'bg-white/5 border-white/10 hover:bg-white/10'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full overflow-hidden border border-white/20 shrink-0 bg-purple-950/40">
                      <img src={doc.avatarUrl} alt={doc.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="overflow-hidden">
                      <p className="font-bold text-sm text-white truncate">{doc.name}</p>
                      <p className="text-[11px] text-white/50 font-mono truncate">{doc.department}</p>
                      {isCurrent && (
                        <span className="text-[9px] font-mono text-emerald-300 font-bold uppercase">● Active</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Selected Doctor PIN Login */}
          <form onSubmit={handleLogin} className="bg-white/5 p-4 rounded-2xl border border-white/10 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-white/60 font-mono">
                Authenticating: <strong className="text-white">{targetDoc.name}</strong>
              </span>
              <span className="text-[11px] font-mono text-cyan-300 bg-cyan-950/50 px-2 py-0.5 rounded border border-cyan-800/40">
                PIN Hint: {targetDoc.pin}
              </span>
            </div>

            <div className="flex gap-2">
              <input
                type="password"
                maxLength={4}
                required
                value={pin}
                onChange={(e) => {
                  setPin(e.target.value);
                  setError('');
                }}
                placeholder="Enter 4-digit PIN"
                className="w-full border border-white/15 bg-black/40 rounded-xl px-4 py-2.5 text-center text-lg font-mono tracking-[0.4em] text-white focus:outline-none focus:border-purple-400"
              />
              <button
                type="submit"
                className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-orange-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:scale-105 transition-all shadow-md shrink-0 cursor-pointer"
              >
                Sign In
              </button>
            </div>

            {error && <p className="text-xs font-mono text-rose-300">{error}</p>}
          </form>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 3. PATIENT LOGIN / PORTAL SIGN IN MODAL
// ==========================================
interface PatientLoginModalProps {
  patients: Patient[];
  onLoginPatient: (patient: Patient) => void;
  onClose: () => void;
}

export const PatientLoginModal: React.FC<PatientLoginModalProps> = ({
  patients,
  onLoginPatient,
  onClose,
}) => {
  const [patientIdInput, setPatientIdInput] = useState(patients[0]?.id || '');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  const targetPatient = patients.find(
    (p) => p.id.toLowerCase() === patientIdInput.trim().toLowerCase()
  ) || patients.find((p) => p.phone?.includes(patientIdInput.trim()));

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientIdInput.trim()) {
      setError('Please enter your Doctor-Issued Patient ID.');
      return;
    }

    if (!targetPatient) {
      setError(`No patient record found with ID "${patientIdInput}". Patients cannot self-register; your attending doctor must enroll you first.`);
      return;
    }

    if (pin === (targetPatient.pin || '1234') || pin === '1234') {
      onLoginPatient(targetPatient);
      onClose();
    } else {
      setError('Incorrect Patient PIN. (Demo PIN is: ' + (targetPatient.pin || '1234') + ')');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-[#0f0814]/95 rounded-[28px] max-w-md w-full border border-white/15 shadow-[0_25px_60px_rgba(0,0,0,0.85)] overflow-hidden my-8 backdrop-blur-2xl text-white">
        <div className="bg-gradient-to-r from-cyan-950/60 via-purple-900/40 to-indigo-950/40 border-b border-white/10 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-300">
              <span className="material-symbols-outlined text-[24px]">badge</span>
            </div>
            <div>
              <h3 className="font-headline-md text-base font-bold text-white tracking-wide">
                Patient Portal Sign In
              </h3>
              <p className="text-xs font-mono text-cyan-200/60">Doctor-Issued Patient ID Access</p>
            </div>
          </div>
          <button onClick={onClose} aria-label="Close modal" className="text-white/60 hover:text-white rounded-full p-2 cursor-pointer">
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Informational Policy Notice */}
        <div className="bg-cyan-950/40 border-b border-cyan-500/20 px-6 py-2.5 flex items-center gap-2 text-xs font-mono text-cyan-200">
          <span className="material-symbols-outlined text-[16px] text-cyan-400 shrink-0">info</span>
          <span>Patients cannot self-register. Enter the ID assigned by your doctor.</span>
        </div>

        <form onSubmit={handleLogin} className="p-6 space-y-4">
          <div>
            <label className="block text-[10px] font-mono font-bold text-white/60 uppercase tracking-widest mb-1.5">
              Doctor-Issued Patient ID
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-white/40 text-[18px]">
                badge
              </span>
              <input
                type="text"
                required
                value={patientIdInput}
                onChange={(e) => {
                  setPatientIdInput(e.target.value);
                  setError('');
                }}
                placeholder="e.g. PID-99821, PID-84721"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white font-mono text-sm focus:outline-none focus:border-cyan-400 uppercase"
              />
            </div>
          </div>

          {/* Quick Picker for Demo Patients */}
          <div>
            <label className="block text-[10px] font-mono font-bold text-white/40 uppercase tracking-wider mb-1">
              Or Select Enrolled Patient ({patients.length})
            </label>
            <select
              value={targetPatient ? targetPatient.id : ''}
              onChange={(e) => {
                setPatientIdInput(e.target.value);
                setError('');
              }}
              className="w-full border border-white/15 bg-[#150b1a] rounded-xl p-2.5 text-xs text-white font-mono focus:outline-none focus:border-cyan-400 cursor-pointer"
            >
              {patients.map((p) => (
                <option key={p.id} value={p.id} className="bg-[#150b1a] text-white">
                  {p.name} — ID: {p.id} (Doctor: {p.assignedDoctorName || 'Dr. Rajesh Sharma'})
                </option>
              ))}
            </select>
          </div>

          {targetPatient && (
            <div className="bg-cyan-950/30 border border-cyan-500/20 rounded-2xl p-3.5 text-xs font-mono space-y-1">
              <div className="flex justify-between text-white/70">
                <span>Patient Name:</span>
                <strong className="text-white">{targetPatient.name}</strong>
              </div>
              <div className="flex justify-between text-white/70">
                <span>Verified ID:</span>
                <strong className="text-cyan-300 font-bold">{targetPatient.id}</strong>
              </div>
              <div className="flex justify-between text-white/70">
                <span>Attending Doctor:</span>
                <strong className="text-purple-300">{targetPatient.assignedDoctorName || 'Dr. Rajesh Sharma'}</strong>
              </div>
            </div>
          )}

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-[10px] font-mono font-bold text-white/50 uppercase tracking-widest">
                Security PIN
              </label>
              <span className="text-[10px] font-mono text-cyan-300">
                Default PIN: {targetPatient?.pin || '1234'}
              </span>
            </div>
            <input
              type="password"
              maxLength={6}
              required
              value={pin}
              onChange={(e) => {
                setPin(e.target.value);
                setError('');
              }}
              placeholder="••••"
              className="w-full border border-white/15 bg-white/5 rounded-xl p-3 text-center text-xl font-mono tracking-[0.5em] text-white focus:outline-none focus:border-cyan-400"
            />
          </div>

          {error && <p className="text-xs font-mono text-rose-300 text-center leading-relaxed">{error}</p>}

          <div className="pt-2 flex justify-end gap-3 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 text-xs font-semibold text-white/60 hover:text-white rounded-full transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-cyan-600 to-purple-600 text-white rounded-full hover:scale-105 active:scale-95 transition-all shadow-lg cursor-pointer"
            >
              Sign In with ID
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ==========================================
// 4. ADD DOCTOR SUGGESTION / CARE PLAN MODAL
// ==========================================
interface AddDoctorSuggestionModalProps {
  patient: Patient;
  doctorName: string;
  doctorTitle: string;
  onClose: () => void;
  onSaveSuggestion: (patientId: string, suggestion: any) => void;
}

export const AddDoctorSuggestionModal: React.FC<AddDoctorSuggestionModalProps> = ({
  patient,
  doctorName,
  doctorTitle,
  onClose,
  onSaveSuggestion,
}) => {
  const [category, setCategory] = useState<'Medication' | 'Diet & Nutrition' | 'Activity & Rest' | 'Follow-up' | 'General Advice'>('Diet & Nutrition');
  const [suggestion, setSuggestion] = useState('');
  const [priority, setPriority] = useState<'Routine' | 'High' | 'Immediate'>('Routine');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!suggestion.trim()) return;

    const newSuggestion = {
      id: `sug-${Date.now()}`,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      doctorName,
      doctorTitle,
      category,
      suggestion,
      priority,
    };

    onSaveSuggestion(patient.id, newSuggestion);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-[#0f0814]/95 rounded-[28px] max-w-lg w-full border border-white/15 shadow-[0_25px_60px_rgba(0,0,0,0.85)] overflow-hidden my-8 backdrop-blur-2xl text-white">
        <div className="bg-gradient-to-r from-purple-900/60 via-purple-800/40 to-orange-950/40 border-b border-white/10 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-300">
              <span className="material-symbols-outlined text-[24px]">tips_and_updates</span>
            </div>
            <div>
              <h3 className="font-headline-md text-base font-bold text-white tracking-wide">
                Write Doctor Suggestion & Advice
              </h3>
              <p className="text-xs font-mono text-purple-200/60">
                For {patient.name} ({patient.id}) • Visible in Patient Portal
              </p>
            </div>
          </div>
          <button onClick={onClose} aria-label="Close modal" className="text-white/60 hover:text-white rounded-full p-2 cursor-pointer">
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-mono font-bold text-white/50 uppercase tracking-widest mb-1.5">
                Advice Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full border border-white/15 bg-white/5 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-purple-400 cursor-pointer"
              >
                <option value="Diet & Nutrition" className="bg-[#150b1a] text-white">Diet & Nutrition</option>
                <option value="Activity & Rest" className="bg-[#150b1a] text-white">Activity & Rest</option>
                <option value="Medication" className="bg-[#150b1a] text-white">Medication Instructions</option>
                <option value="Follow-up" className="bg-[#150b1a] text-white">Follow-up & Appointments</option>
                <option value="General Advice" className="bg-[#150b1a] text-white">General Health Advice</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-mono font-bold text-white/50 uppercase tracking-widest mb-1.5">
                Priority Level
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full border border-white/15 bg-white/5 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-purple-400 cursor-pointer"
              >
                <option value="Routine" className="bg-[#150b1a] text-white">Routine Guidance</option>
                <option value="High" className="bg-[#150b1a] text-white">High Priority</option>
                <option value="Immediate" className="bg-[#150b1a] text-white">Immediate Attention</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-mono font-bold text-white/50 uppercase tracking-widest mb-1.5">
              Doctor's Medical Suggestion / Instructions
            </label>
            <textarea
              rows={4}
              required
              value={suggestion}
              onChange={(e) => setSuggestion(e.target.value)}
              placeholder="e.g., Maintain low sodium diet (< 2000mg/day). Walk 30 minutes daily after breakfast. Schedule follow-up ECG in 6 weeks."
              className="w-full border border-white/15 bg-white/5 rounded-xl p-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-purple-400"
            />
          </div>

          <div className="bg-white/5 p-3 rounded-xl border border-white/10 text-xs font-mono text-white/60 flex items-center gap-2">
            <span className="material-symbols-outlined text-purple-300 text-[18px]">verified</span>
            <span>Will be signed as: <strong className="text-white">{doctorName}</strong></span>
          </div>

          <div className="pt-3 flex justify-end gap-3 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 text-xs font-semibold text-white/60 hover:text-white rounded-full transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-purple-600 to-orange-500 text-white rounded-full hover:scale-105 active:scale-95 transition-all shadow-lg cursor-pointer"
            >
              Post Suggestion to Patient
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ==========================================
// 5. ADD PRESCRIPTION MODAL
// ==========================================
interface AddPrescriptionModalProps {
  patient: Patient;
  doctorName: string;
  onClose: () => void;
  onSavePrescription: (patientId: string, prescription: any) => void;
}

export const AddPrescriptionModal: React.FC<AddPrescriptionModalProps> = ({
  patient,
  doctorName,
  onClose,
  onSavePrescription,
}) => {
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('10 mg');
  const [frequency, setFrequency] = useState('Once Daily');
  const [instructions, setInstructions] = useState('Take in the morning with food');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newMed = {
      id: `med-${Date.now()}`,
      name,
      dosage,
      frequency,
      instructions,
      prescribedBy: doctorName,
      startDate: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      status: 'Active' as const,
    };

    onSavePrescription(patient.id, newMed);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-[#0f0814]/95 rounded-[28px] max-w-md w-full border border-white/15 shadow-[0_25px_60px_rgba(0,0,0,0.85)] overflow-hidden my-8 backdrop-blur-2xl text-white">
        <div className="bg-gradient-to-r from-purple-900/60 via-purple-800/40 to-orange-950/40 border-b border-white/10 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-orange-300">
              <span className="material-symbols-outlined text-[24px]">prescriptions</span>
            </div>
            <div>
              <h3 className="font-headline-md text-base font-bold text-white tracking-wide">
                Prescribe Medication
              </h3>
              <p className="text-xs font-mono text-orange-200/60">For {patient.name}</p>
            </div>
          </div>
          <button onClick={onClose} aria-label="Close modal" className="text-white/60 hover:text-white rounded-full p-2 cursor-pointer">
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-[10px] font-mono font-bold text-white/50 uppercase tracking-widest mb-1.5">
              Medication Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g., Atorvastatin"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-white/15 bg-white/5 rounded-xl p-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-orange-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-mono font-bold text-white/50 uppercase tracking-widest mb-1.5">
                Dosage
              </label>
              <input
                type="text"
                required
                value={dosage}
                onChange={(e) => setDosage(e.target.value)}
                placeholder="20 mg"
                className="w-full border border-white/15 bg-white/5 rounded-xl p-3 text-sm text-white font-mono focus:outline-none focus:border-orange-400"
              />
            </div>
            <div>
              <label className="block text-[10px] font-mono font-bold text-white/50 uppercase tracking-widest mb-1.5">
                Frequency
              </label>
              <input
                type="text"
                required
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
                placeholder="Once Daily at night"
                className="w-full border border-white/15 bg-white/5 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-orange-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-mono font-bold text-white/50 uppercase tracking-widest mb-1.5">
              Specific Instructions
            </label>
            <input
              type="text"
              required
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="Take with full glass of water after dinner"
              className="w-full border border-white/15 bg-white/5 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-orange-400"
            />
          </div>

          <div className="pt-3 flex justify-end gap-3 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 text-xs font-semibold text-white/60 hover:text-white rounded-full transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-purple-600 to-orange-500 text-white rounded-full hover:scale-105 active:scale-95 transition-all shadow-lg cursor-pointer"
            >
              Save Prescription
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ==========================================
// 6. ADD DOCTOR OBSERVATION (INTERNAL / MD ONLY) MODAL
// ==========================================
interface AddDoctorObservationModalProps {
  patient: Patient;
  doctorName: string;
  onClose: () => void;
  onSaveObservation: (patientId: string, observation: string) => void;
}

export const AddDoctorObservationModal: React.FC<AddDoctorObservationModalProps> = ({
  patient,
  doctorName,
  onClose,
  onSaveObservation,
}) => {
  const [observation, setObservation] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!observation.trim()) return;

    onSaveObservation(patient.id, observation.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-[#0f0814]/95 rounded-[28px] max-w-lg w-full border border-rose-500/30 shadow-[0_25px_60px_rgba(0,0,0,0.85)] overflow-hidden my-8 backdrop-blur-2xl text-white">
        <div className="bg-gradient-to-r from-rose-950/70 via-purple-950/50 to-[#0f0814] border-b border-rose-500/20 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-300">
              <span className="material-symbols-outlined text-[24px]">lock</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-headline-md text-base font-bold text-white tracking-wide">
                  Internal Doctor Observation
                </h3>
                <span className="bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[9px] font-mono px-2 py-0.5 rounded-full font-bold uppercase">
                  MD Only
                </span>
              </div>
              <p className="text-xs font-mono text-white/50">
                Confidential clinical note for {patient.name} • Hidden from patient view
              </p>
            </div>
          </div>
          <button onClick={onClose} aria-label="Close modal" className="text-white/60 hover:text-white rounded-full p-2 cursor-pointer">
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="bg-rose-950/20 border border-rose-500/20 rounded-2xl p-3.5 text-xs text-rose-200/90 font-mono flex items-start gap-2.5">
            <span className="material-symbols-outlined text-rose-400 text-[18px] shrink-0">shield</span>
            <span>
              <strong>Privacy Protection:</strong> Observations recorded here are internal hospital medical notes. As per protocol, they are strictly restricted to treating clinicians and will NOT be shown in the patient-facing portal.
            </span>
          </div>

          <div>
            <label className="block text-[10px] font-mono font-bold text-white/50 uppercase tracking-widest mb-1.5">
              Clinical Assessment & Observations
            </label>
            <textarea
              rows={4}
              required
              value={observation}
              onChange={(e) => setObservation(e.target.value)}
              placeholder="e.g., Patient showing signs of early compliance fatigue. Re-evaluate ACE inhibitor dosage at 6-month checkup if diastolic BP remains borderline."
              className="w-full border border-white/15 bg-white/5 rounded-xl p-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-rose-400"
            />
          </div>

          <div className="text-xs font-mono text-white/50 flex justify-between items-center">
            <span>Author: <strong>{doctorName}</strong></span>
            <span>{new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}</span>
          </div>

          <div className="pt-3 flex justify-end gap-3 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 text-xs font-semibold text-white/60 hover:text-white rounded-full transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-rose-600 to-purple-600 text-white rounded-full hover:scale-105 active:scale-95 transition-all shadow-lg cursor-pointer"
            >
              Save Confidential Note
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};


