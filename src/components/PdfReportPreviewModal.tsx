import React, { useState } from 'react';
import { ClinicalRecord, Patient, UploadedLabTest, Medication, DoctorProfile } from '../types';
import {
  exportClinicalRecordPdf,
  exportLabResultsPdf,
  exportUploadedLabTestPdf,
  exportPrescriptionPdf,
  exportCompletePatientHistoryPdf,
  exportDietPlanPdf,
  PdfAction,
} from '../utils/pdfGenerator';

export type ReportPdfType =
  | { kind: 'clinical-record'; record: ClinicalRecord }
  | { kind: 'lab-result'; record: ClinicalRecord }
  | { kind: 'uploaded-lab'; test: UploadedLabTest }
  | { kind: 'prescription'; medications: Medication[]; advice?: string }
  | { kind: 'full-history' }
  | { kind: 'diet-plan' };

interface PdfReportPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient | null;
  reportData: ReportPdfType | null;
  currentDoctor?: DoctorProfile;
  showToast?: (msg: string) => void;
}

export const PdfReportPreviewModal: React.FC<PdfReportPreviewModalProps> = ({
  isOpen,
  onClose,
  patient,
  reportData,
  currentDoctor,
  showToast,
}) => {
  const [isGenerating, setIsGenerating] = useState(false);

  if (!isOpen || !patient || !reportData) return null;

  const doctorName = currentDoctor?.name || patient.assignedDoctorName || 'Dr. Rajesh Sharma, MD';

  // Helper title and subtitle
  let docTitle = 'Clinical Medical Report';
  let badgeLabel = 'PDF REPORT';

  if (reportData.kind === 'clinical-record') {
    docTitle = `${reportData.record.title} (${reportData.record.badgeLabel || reportData.record.type})`;
    badgeLabel = `${reportData.record.badgeLabel || reportData.record.type} REPORT`;
  } else if (reportData.kind === 'lab-result') {
    docTitle = `${reportData.record.title} - Laboratory Diagnostics`;
    badgeLabel = 'LAB DIAGNOSTIC PDF';
  } else if (reportData.kind === 'uploaded-lab') {
    docTitle = `${reportData.test.title} (Home Lab Review)`;
    badgeLabel = 'HOME LAB PDF';
  } else if (reportData.kind === 'prescription') {
    docTitle = 'Official Medical Prescription (Rx)';
    badgeLabel = 'PRESCRIPTION Rx PDF';
  } else if (reportData.kind === 'full-history') {
    docTitle = 'Comprehensive Health Portfolio & Medical Passport';
    badgeLabel = 'FULL HEALTH SUMMARY';
  } else if (reportData.kind === 'diet-plan') {
    docTitle = 'Clinical Nutrition & Diet Therapy Chart';
    badgeLabel = 'MEAL CHART PDF';
  }

  const handleExport = (action: PdfAction) => {
    setIsGenerating(true);
    try {
      if (reportData.kind === 'clinical-record') {
        exportClinicalRecordPdf(reportData.record, patient, doctorName, action);
      } else if (reportData.kind === 'lab-result') {
        exportLabResultsPdf(reportData.record, patient, doctorName, action);
      } else if (reportData.kind === 'uploaded-lab') {
        exportUploadedLabTestPdf(reportData.test, patient, doctorName, action);
      } else if (reportData.kind === 'prescription') {
        exportPrescriptionPdf(
          patient,
          reportData.medications || patient.medications || [],
          doctorName,
          reportData.advice,
          action
        );
      } else if (reportData.kind === 'full-history') {
        exportCompletePatientHistoryPdf(patient, doctorName, action);
      } else if (reportData.kind === 'diet-plan') {
        exportDietPlanPdf(patient, doctorName, action);
      }

      if (action === 'download') {
        if (showToast) {
          showToast(`✓ PDF report downloaded successfully for ${patient.name}`);
        }
      } else if (action === 'open') {
        if (showToast) {
          showToast(`Opening PDF report in new window...`);
        }
      }
    } catch (err) {
      console.error('Failed to generate PDF report:', err);
      if (showToast) {
        showToast('Error generating PDF report. Please try again.');
      }
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-[#0e0714]/95 rounded-[28px] max-w-2xl w-full border border-white/20 shadow-[0_30px_70px_rgba(0,0,0,0.9)] overflow-hidden my-8 backdrop-blur-2xl text-white">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-purple-900/60 via-indigo-900/40 to-cyan-950/50 border-b border-white/10 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300">
              <span className="material-symbols-outlined text-[24px]">picture_as_pdf</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-headline-md text-base md:text-lg font-bold text-white tracking-wide">
                  {docTitle}
                </h3>
              </div>
              <p className="text-xs font-mono text-purple-200/70">
                Official Formatted PDF • Patient: {patient.name} ({patient.id})
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

        {/* Modal Content - Document Preview Card */}
        <div className="p-6 space-y-5 max-h-[72vh] overflow-y-auto">
          {/* Top Document Header simulation */}
          <div className="bg-white text-gray-900 rounded-2xl p-5 shadow-2xl border border-gray-200 font-sans">
            {/* Header branding */}
            <div className="border-b-2 border-purple-900 pb-3 flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-purple-900 text-white font-bold flex items-center justify-center text-xs">
                    +
                  </div>
                  <h4 className="text-sm font-bold text-purple-950 uppercase tracking-tight">
                    ApexCare Multispeciality Hospital
                  </h4>
                </div>
                <p className="text-[10px] text-gray-500 mt-0.5">
                  NABH ACCREDITED • DIGITAL HEALTH & TELEMETRY NETWORK • ISO 9001:2015
                </p>
              </div>
              <div className="text-right">
                <span className="bg-purple-100 text-purple-900 text-[10px] font-mono font-bold px-2 py-0.5 rounded border border-purple-300">
                  {badgeLabel}
                </span>
                <p className="text-[10px] font-mono text-gray-500 mt-1">
                  DATE: {new Date().toLocaleDateString('en-GB')}
                </p>
              </div>
            </div>

            {/* Demographics row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 py-3 border-b border-gray-200 text-[11px] bg-gray-50 rounded-lg px-3 mt-3">
              <div>
                <span className="text-gray-400 block text-[9px] font-bold uppercase">Patient</span>
                <span className="font-bold text-gray-900">{patient.name}</span>
              </div>
              <div>
                <span className="text-gray-400 block text-[9px] font-bold uppercase">Patient ID</span>
                <span className="font-mono font-bold text-purple-800">{patient.id}</span>
              </div>
              <div>
                <span className="text-gray-400 block text-[9px] font-bold uppercase">Age / Gender</span>
                <span>{patient.age}y / {patient.gender}</span>
              </div>
              <div>
                <span className="text-gray-400 block text-[9px] font-bold uppercase">Blood Group</span>
                <span className="font-bold text-rose-600">{patient.bloodType || 'O+'}</span>
              </div>
            </div>

            {/* Document Specific Preview Snippets */}
            <div className="mt-4 space-y-3">
              {reportData.kind === 'clinical-record' && (
                <>
                  <div>
                    <span className="text-[10px] font-bold text-purple-900 uppercase tracking-wider block">
                      1. CLINICAL SUMMARY & INDICATION
                    </span>
                    <p className="text-xs text-gray-700 bg-purple-50/50 p-2.5 rounded border border-purple-100 mt-1">
                      {reportData.record.summary}
                    </p>
                  </div>

                  {reportData.record.detailedFindings && (
                    <div>
                      <span className="text-[10px] font-bold text-purple-900 uppercase tracking-wider block">
                        2. EXAMINATION & RADIOLOGICAL FINDINGS
                      </span>
                      <ul className="text-xs text-gray-700 list-disc list-inside space-y-1 bg-gray-50 p-2.5 rounded border border-gray-200 mt-1">
                        {reportData.record.detailedFindings.map((f, i) => (
                          <li key={i}>{f}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {reportData.record.impression && (
                    <div className="bg-amber-50 border-l-4 border-amber-500 p-2.5 rounded-r">
                      <span className="text-[10px] font-bold text-amber-900 uppercase tracking-wider block">
                        DIAGNOSTIC IMPRESSION
                      </span>
                      <p className="text-xs font-semibold text-gray-900">{reportData.record.impression}</p>
                    </div>
                  )}
                </>
              )}

              {reportData.kind === 'lab-result' && (
                <div>
                  <span className="text-[10px] font-bold text-purple-900 uppercase tracking-wider block mb-1">
                    LABORATORY DIAGNOSTIC PARAMETERS
                  </span>
                  <div className="border border-gray-200 rounded overflow-hidden text-xs">
                    <table className="w-full text-left">
                      <thead className="bg-purple-950 text-white text-[10px] uppercase">
                        <tr>
                          <th className="p-2">Test Investigation</th>
                          <th className="p-2">Observed Result</th>
                          <th className="p-2">Reference Interval</th>
                          <th className="p-2 text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {(reportData.record.labItems || []).map((item, idx) => (
                          <tr key={idx} className="hover:bg-gray-50">
                            <td className="p-2 font-medium">{item.testName}</td>
                            <td className="p-2 font-mono font-bold">
                              {item.value} {item.unit}
                            </td>
                            <td className="p-2 text-gray-500 font-mono text-[11px]">
                              {item.referenceRange} {item.unit}
                            </td>
                            <td className="p-2 text-center">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                                  item.flag === 'HIGH'
                                    ? 'bg-red-100 text-red-700'
                                    : item.flag === 'LOW'
                                    ? 'bg-amber-100 text-amber-700'
                                    : 'bg-emerald-100 text-emerald-700'
                                }`}
                              >
                                {item.flag || 'NORMAL'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {reportData.kind === 'uploaded-lab' && (
                <div className="space-y-2">
                  <div className="bg-purple-50 p-3 rounded border border-purple-200">
                    <span className="text-[10px] font-bold text-purple-900 uppercase block">Patient Inquiry:</span>
                    <p className="text-xs text-gray-800">{reportData.test.patientQuestion}</p>
                  </div>
                  {reportData.test.doctorResponse && (
                    <div className="bg-emerald-50 p-3 rounded border border-emerald-200">
                      <span className="text-[10px] font-bold text-emerald-900 uppercase block">
                        Doctor Assessment ({reportData.test.doctorResponse.doctorName}):
                      </span>
                      <p className="text-xs text-gray-800 mt-0.5">{reportData.test.doctorResponse.assessment}</p>
                      <p className="text-xs font-bold text-emerald-800 mt-1">
                        Action Plan: {reportData.test.doctorResponse.actionPlan}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {reportData.kind === 'prescription' && (
                <div>
                  <span className="text-[10px] font-bold text-purple-900 uppercase tracking-wider block mb-1">
                    Rx PRESCRIBED MEDICATIONS & INTAKE TIMING
                  </span>
                  <div className="border border-gray-200 rounded overflow-hidden text-xs">
                    <table className="w-full text-left">
                      <thead className="bg-purple-900 text-white text-[10px] uppercase">
                        <tr>
                          <th className="p-2">#</th>
                          <th className="p-2">Medicine Name</th>
                          <th className="p-2">Dose</th>
                          <th className="p-2">Frequency</th>
                          <th className="p-2">Schedule Instructions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {((reportData.medications || patient.medications) || []).map((m, idx) => (
                          <tr key={idx}>
                            <td className="p-2 font-mono text-gray-400">{idx + 1}</td>
                            <td className="p-2 font-bold text-gray-900">{m.name}</td>
                            <td className="p-2 font-mono">{m.dosage}</td>
                            <td className="p-2 text-purple-900 font-semibold">{m.frequency}</td>
                            <td className="p-2 text-gray-600">{m.instructions}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {reportData.kind === 'full-history' && (
                <div>
                  <span className="text-[10px] font-bold text-purple-900 uppercase tracking-wider block mb-1">
                    COMPLETE ENCOUNTER HISTORY & DIAGNOSTICS ({patient.clinicalHistory.length} Records)
                  </span>
                  <p className="text-xs text-gray-600">
                    Includes all historical consultations, diagnostic radiology, telemetry scans, and lab reports.
                  </p>
                </div>
              )}

              {reportData.kind === 'diet-plan' && (
                <div>
                  <span className="text-[10px] font-bold text-emerald-900 uppercase tracking-wider block mb-1">
                    PERSONALIZED INDIAN DIET & MEAL SCHEDULE
                  </span>
                  <p className="text-xs text-gray-600">
                    Includes 7-step meal schedule, hydration intake goals, and clinical nutrition do's & don'ts.
                  </p>
                </div>
              )}
            </div>

            {/* Bottom Signature Line */}
            <div className="border-t border-gray-200 mt-4 pt-3 flex items-center justify-between text-[10px] text-gray-500">
              <div className="flex items-center gap-1 text-emerald-700 font-bold">
                <span>✓ Digitally Verified Medical Document</span>
              </div>
              <div className="text-right">
                <span className="font-bold text-gray-800 block">{doctorName}</span>
                <span>Cardiovascular Center • ApexCare</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer with Actions */}
        <div className="bg-white/[0.03] px-6 py-4 border-t border-white/10 flex items-center justify-between flex-wrap gap-3">
          <div className="text-xs font-mono text-cyan-300 flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px]">verified</span>
            100% Client-Side PDF Generation
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => handleExport('open')}
              disabled={isGenerating}
              className="px-4 py-2.5 rounded-full border border-cyan-400/40 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer hover:scale-105 active:scale-95 shadow-md"
            >
              <span className="material-symbols-outlined text-[16px]">open_in_new</span>
              Open / Print PDF
            </button>

            <button
              onClick={() => handleExport('download')}
              disabled={isGenerating}
              className="px-5 py-2.5 rounded-full bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-purple-900/40 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[17px]">download</span>
              {isGenerating ? 'Generating...' : 'Download PDF Report'}
            </button>

            <button
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-semibold text-white/60 hover:text-white hover:bg-white/10 rounded-full transition-all cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
