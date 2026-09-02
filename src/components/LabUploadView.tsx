import React, { useState } from 'react';
import { Patient, UploadedLabTest, DoctorProfile } from '../types';

interface LabUploadViewProps {
  patient: Patient;
  currentDoctor?: DoctorProfile;
  isDoctorMode?: boolean;
  onUpdatePatientTests?: (updatedTests: UploadedLabTest[]) => void;
  onStartVideoConsult?: () => void;
  showToast: (msg: string) => void;
}

const COMMON_TEST_TYPES: UploadedLabTest['testType'][] = [
  'Blood Work',
  'Lipid & Sugar',
  'ECG / Cardiology',
  'Radiology / X-Ray',
  'Pathology / Urine',
  'Other',
];

const POPULAR_LABS = [
  'Dr Lal PathLabs',
  'SRL Diagnostics',
  'Metropolis Healthcare',
  'Thyrocare',
  'Apollo Diagnostics',
  'Max Lab Diagnostics',
  'Home Phlebotomy Collection',
];

export const LabUploadView: React.FC<LabUploadViewProps> = ({
  patient,
  currentDoctor,
  isDoctorMode = false,
  onUpdatePatientTests,
  onStartVideoConsult,
  showToast,
}) => {
  const [tests, setTests] = useState<UploadedLabTest[]>(() => {
    if (patient.uploadedLabTests && patient.uploadedLabTests.length > 0) {
      return patient.uploadedLabTests;
    }
    // Default mock uploaded test for demo
    return [
      {
        id: `lab-up-1`,
        patientId: patient.id,
        patientName: patient.name,
        title: 'Comprehensive Metabolic Panel & Fasting Blood Sugar',
        testType: 'Lipid & Sugar',
        dateUploaded: 'Sep 01, 2026',
        labName: 'Dr Lal PathLabs (Home Collection)',
        patientQuestion:
          'Doctor, my morning fasting glucose showed 138 mg/dL and HbA1c is 6.8%. Do I need to modify my morning medication dosage?',
        fileName: 'Metabolic_Panel_Sep2026.pdf',
        fileSize: '1.8 MB',
        fileType: 'pdf',
        status: 'Reviewed',
        assignedDoctorName: patient.assignedDoctorName || 'Dr. Rajesh Sharma',
        doctorResponse: {
          doctorName: patient.assignedDoctorName || 'Dr. Rajesh Sharma',
          respondedAt: 'Sep 01, 2026 • 04:30 PM',
          assessment:
            'Fasting glucose has improved from prior 152 mg/dL. Kidney function (Creatinine 0.9 mg/dL) and liver enzymes remain well within normal limits.',
          actionPlan:
            'Maintain Metformin 500mg once daily after breakfast. Continue low glycemic index diet with 30 mins brisk walking.',
          prescriptionUpdated: false,
          urgentFollowUpNeeded: false,
        },
      },
      {
        id: `lab-up-2`,
        patientId: patient.id,
        patientName: patient.name,
        title: 'Complete Blood Count (CBC) & Lipid Profile',
        testType: 'Blood Work',
        dateUploaded: 'Aug 24, 2026',
        labName: 'SRL Diagnostics',
        patientQuestion:
          'Sharing my latest lipid profile before our upcoming consultation. Total cholesterol is 195 mg/dL.',
        fileName: 'Lipid_Profile_Report_Aug24.pdf',
        fileSize: '2.4 MB',
        fileType: 'pdf',
        status: 'Reviewed',
        assignedDoctorName: patient.assignedDoctorName || 'Dr. Rajesh Sharma',
        doctorResponse: {
          doctorName: patient.assignedDoctorName || 'Dr. Rajesh Sharma',
          respondedAt: 'Aug 25, 2026 • 11:15 AM',
          assessment: 'Lipid parameters are well controlled with current lifestyle modifications.',
          actionPlan: 'Repeat lipid profile in 3 months. Continue cardio exercises.',
          prescriptionUpdated: false,
          urgentFollowUpNeeded: false,
        },
      },
    ];
  });

  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedTestForReview, setSelectedTestForReview] = useState<UploadedLabTest | null>(null);

  // Form State
  const [testTitle, setTestTitle] = useState('');
  const [testType, setTestType] = useState<UploadedLabTest['testType']>('Blood Work');
  const [labName, setLabName] = useState(POPULAR_LABS[0]);
  const [patientQuestion, setPatientQuestion] = useState('');
  const [selectedFile, setSelectedFile] = useState<{ name: string; size: string; type: 'pdf' | 'image' } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Doctor Review Form State
  const [doctorAssessment, setDoctorAssessment] = useState('');
  const [doctorActionPlan, setDoctorActionPlan] = useState('');
  const [prescriptionUpdated, setPrescriptionUpdated] = useState(false);

  // Handle Drag & Drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const isImg = file.type.startsWith('image/');
      setSelectedFile({
        name: file.name,
        size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        type: isImg ? 'image' : 'pdf',
      });
      if (!testTitle) {
        setTestTitle(file.name.replace(/\.[^/.]+$/, ''));
      }
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const isImg = file.type.startsWith('image/');
      setSelectedFile({
        name: file.name,
        size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        type: isImg ? 'image' : 'pdf',
      });
      if (!testTitle) {
        setTestTitle(file.name.replace(/\.[^/.]+$/, ''));
      }
    }
  };

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!testTitle.trim()) {
      showToast('Please provide a descriptive title for this test.');
      return;
    }
    if (!selectedFile) {
      showToast('Please select or drop a lab report file (PDF or Image).');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const today = new Date();
      const dateStr = today.toLocaleDateString('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric',
      });

      const newTest: UploadedLabTest = {
        id: `lab-up-${Date.now()}`,
        patientId: patient.id,
        patientName: patient.name,
        title: testTitle.trim(),
        testType,
        dateUploaded: dateStr,
        labName: labName.trim() || 'Home Diagnostic Sample',
        patientQuestion:
          patientQuestion.trim() ||
          'Please review my home lab test results and advise if any treatment adjustment is needed.',
        fileName: selectedFile.name,
        fileSize: selectedFile.size,
        fileType: selectedFile.type,
        status: 'Pending Review',
        assignedDoctorName: patient.assignedDoctorName || 'Dr. Rajesh Sharma',
      };

      const updated = [newTest, ...tests];
      setTests(updated);
      if (onUpdatePatientTests) {
        onUpdatePatientTests(updated);
      }

      setIsSubmitting(false);
      setShowUploadModal(false);
      setTestTitle('');
      setPatientQuestion('');
      setSelectedFile(null);

      showToast(`Lab report "${newTest.title}" sent to ${newTest.assignedDoctorName} for review! 🚀`);
    }, 600);
  };

  const handleDoctorSubmitReview = (testId: string) => {
    if (!doctorAssessment.trim()) {
      showToast('Please enter your clinical assessment.');
      return;
    }

    const today = new Date();
    const timeStr = today.toLocaleDateString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
    }) + ' • ' + today.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    const updated = tests.map((t) => {
      if (t.id === testId) {
        return {
          ...t,
          status: 'Reviewed' as const,
          doctorResponse: {
            doctorName: currentDoctor?.name || 'Dr. Rajesh Sharma',
            doctorId: currentDoctor?.id || 'doc-1',
            respondedAt: timeStr,
            assessment: doctorAssessment.trim(),
            actionPlan: doctorActionPlan.trim() || 'Continue current regimen and monitor weekly.',
            prescriptionUpdated,
          },
        };
      }
      return t;
    });

    setTests(updated);
    if (onUpdatePatientTests) {
      onUpdatePatientTests(updated);
    }
    setSelectedTestForReview(null);
    setDoctorAssessment('');
    setDoctorActionPlan('');
    showToast(`Clinical review submitted for patient ${patient.name} ✅`);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Card */}
      <section className="bg-gradient-to-r from-purple-900/30 via-indigo-900/20 to-orange-900/20 border border-purple-500/20 rounded-[28px] p-6 md:p-8 shadow-2xl backdrop-blur-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-3 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/30">
                TELE-DIAGNOSTICS & LAB REVIEW • दूरस्थ लैब समीक्षा
              </span>
              <span className="text-xs font-mono text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Connected to {patient.assignedDoctorName || 'Dr. Rajesh Sharma'}
              </span>
            </div>
            <h2 className="font-headline-lg text-2xl md:text-3xl font-bold text-white tracking-tight">
              Home Lab Test Upload & Doctor Consult
            </h2>
            <p className="text-xs md:text-sm font-mono text-white/70 mt-1 max-w-2xl leading-relaxed">
              Upload diagnostic reports (blood, lipid, radiology, ECG) collected at home or nearby labs. Ask your treating doctor questions and receive clinical feedback without visiting the clinic.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setShowUploadModal(true)}
              className="px-5 py-3 rounded-full bg-gradient-to-r from-purple-600 via-indigo-600 to-orange-500 text-white font-mono text-xs font-bold uppercase tracking-wider shadow-lg shadow-purple-900/40 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">upload_file</span>
              Upload Lab Test
            </button>

            {onStartVideoConsult && (
              <button
                onClick={onStartVideoConsult}
                className="px-4 py-3 rounded-full bg-cyan-600/30 hover:bg-cyan-600/50 text-cyan-200 border border-cyan-400/40 font-mono text-xs font-bold uppercase tracking-wider shadow-md hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">videocam</span>
                Video Call Doctor
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Uploaded Tests List */}
      <section className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h3 className="font-headline-md text-lg font-bold text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-purple-400">biotech</span>
            Diagnostic Reports & Review Requests ({tests.length})
          </h3>
          <span className="text-xs font-mono text-white/50">
            {tests.filter((t) => t.status === 'Pending Review').length} Pending •{' '}
            {tests.filter((t) => t.status === 'Reviewed').length} Reviewed
          </span>
        </div>

        {tests.length === 0 ? (
          <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-purple-500/10 text-purple-300 flex items-center justify-center mx-auto mb-3">
              <span className="material-symbols-outlined text-3xl">upload_file</span>
            </div>
            <h4 className="font-bold text-white text-base">No Lab Reports Uploaded Yet</h4>
            <p className="text-xs font-mono text-white/60 mt-1 max-w-md mx-auto">
              Got a lab test done at home or an external pathology center? Upload the PDF or photo to have your doctor review it.
            </p>
            <button
              onClick={() => setShowUploadModal(true)}
              className="mt-4 px-6 py-2.5 rounded-full bg-purple-600 text-white font-mono text-xs font-bold uppercase tracking-wider hover:scale-105 transition-all cursor-pointer"
            >
              Upload First Report
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {tests.map((test) => (
              <div
                key={test.id}
                className="bg-white/[0.04] border border-white/10 hover:border-purple-500/30 rounded-2xl p-5 md:p-6 shadow-xl backdrop-blur-xl transition-all space-y-4"
              >
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-purple-500/20 border border-purple-400/30 flex items-center justify-center text-purple-300 shrink-0">
                      <span className="material-symbols-outlined text-2xl">
                        {test.fileType === 'pdf' ? 'picture_as_pdf' : 'image'}
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-white text-base">{test.title}</h4>
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-white/10 text-white/80 border border-white/10">
                          {test.testType}
                        </span>
                      </div>
                      <p className="text-xs font-mono text-white/50 mt-0.5">
                        Uploaded on {test.dateUploaded} • Lab: <strong className="text-white/70">{test.labName}</strong>
                      </p>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-mono font-bold border flex items-center gap-1.5 ${
                        test.status === 'Reviewed'
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                          : 'bg-amber-500/20 text-amber-300 border-amber-500/30 animate-pulse'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[14px]">
                        {test.status === 'Reviewed' ? 'check_circle' : 'hourglass_top'}
                      </span>
                      {test.status === 'Reviewed' ? 'Reviewed by Doctor' : 'Pending Doctor Review'}
                    </span>
                  </div>
                </div>

                {/* Patient Query & Attached File */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
                  <div className="md:col-span-2 bg-white/5 border border-white/5 rounded-xl p-3.5 space-y-1">
                    <span className="text-[10px] font-mono text-white/40 uppercase tracking-wider flex items-center gap-1">
                      <span className="material-symbols-outlined text-[13px]">help_outline</span>
                      Patient Query / Note for Doctor
                    </span>
                    <p className="text-xs text-white/90 italic leading-relaxed">
                      "{test.patientQuestion}"
                    </p>
                  </div>

                  <div className="bg-black/30 border border-white/10 rounded-xl p-3.5 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-mono text-white/40 uppercase tracking-wider block">
                        Attached Document
                      </span>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="material-symbols-outlined text-purple-300 text-lg">description</span>
                        <span className="text-xs font-mono text-white font-bold truncate">
                          {test.fileName}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-white/40 block mt-0.5">
                        {test.fileSize}
                      </span>
                    </div>

                    <button
                      onClick={() => showToast(`Previewing "${test.fileName}" with AI report parser`)}
                      className="mt-2 text-[11px] font-mono text-purple-300 hover:text-purple-200 font-bold flex items-center gap-1 hover:underline cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[14px]">visibility</span>
                      View Report Scan
                    </button>
                  </div>
                </div>

                {/* Doctor Response Section */}
                {test.doctorResponse ? (
                  <div className="bg-gradient-to-r from-emerald-950/40 via-purple-950/30 to-transparent border border-emerald-500/30 rounded-xl p-4 space-y-2.5">
                    <div className="flex items-center justify-between border-b border-white/10 pb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center">
                          <span className="material-symbols-outlined text-[14px]">verified</span>
                        </div>
                        <span className="text-xs font-bold text-white">
                          Clinical Feedback from {test.doctorResponse.doctorName}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-white/50">
                        {test.doctorResponse.respondedAt}
                      </span>
                    </div>

                    <div className="space-y-1.5 text-xs font-mono">
                      <div>
                        <span className="text-emerald-300 font-bold block">Medical Assessment:</span>
                        <p className="text-white/80 leading-relaxed pl-2 border-l-2 border-emerald-500/40 mt-0.5">
                          {test.doctorResponse.assessment}
                        </p>
                      </div>

                      <div>
                        <span className="text-purple-300 font-bold block mt-2">Action Plan & Guidance:</span>
                        <p className="text-white/80 leading-relaxed pl-2 border-l-2 border-purple-500/40 mt-0.5">
                          {test.doctorResponse.actionPlan}
                        </p>
                      </div>
                    </div>

                    {onStartVideoConsult && (
                      <div className="pt-2 flex items-center justify-between">
                        <span className="text-[11px] font-mono text-white/50">
                          Need further discussion regarding these findings?
                        </span>
                        <button
                          onClick={onStartVideoConsult}
                          className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-mono text-xs font-bold flex items-center gap-1 transition-all cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[14px] text-cyan-300">videocam</span>
                          Schedule Video Follow-up
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-amber-950/20 border border-amber-500/20 rounded-xl p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2 text-amber-200">
                      <span className="material-symbols-outlined text-[18px]">schedule</span>
                      <span>
                        Under active review by <strong>{test.assignedDoctorName || 'Dr. Rajesh Sharma'}</strong>. You will receive an alert once evaluated.
                      </span>
                    </div>

                    {/* If in doctor mode, show review button */}
                    <button
                      onClick={() => setSelectedTestForReview(test)}
                      className="px-4 py-1.5 rounded-full bg-purple-600 text-white font-mono text-xs font-bold hover:scale-105 active:scale-95 transition-all cursor-pointer whitespace-nowrap"
                    >
                      Write Clinical Review
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* MODAL: UPLOAD LAB TEST */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0e1424] border border-purple-500/30 rounded-[28px] max-w-xl w-full p-6 md:p-8 shadow-2xl relative animate-scaleIn max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowUploadModal(false)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white/60 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-400/30 flex items-center justify-center text-purple-300">
                <span className="material-symbols-outlined text-2xl">upload_file</span>
              </div>
              <div>
                <h3 className="font-headline-md text-xl font-bold text-white">
                  Upload Home Lab Report
                </h3>
                <p className="text-xs font-mono text-white/50">
                  Send diagnostic tests directly to your doctor for clinical advice
                </p>
              </div>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-4 text-xs font-mono">
              {/* Drag & Drop Area */}
              <div>
                <label className="text-white/70 block mb-1.5 font-bold">Report Scan / PDF File</label>
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all ${
                    isDragging
                      ? 'border-purple-400 bg-purple-500/20'
                      : 'border-white/20 bg-white/[0.02] hover:border-purple-400/50'
                  }`}
                >
                  <input
                    type="file"
                    id="lab-file-input"
                    accept=".pdf,image/*"
                    onChange={handleFileInputChange}
                    className="hidden"
                  />
                  <label htmlFor="lab-file-input" className="cursor-pointer block">
                    <div className="w-12 h-12 rounded-full bg-purple-500/20 text-purple-300 flex items-center justify-center mx-auto mb-2">
                      <span className="material-symbols-outlined text-2xl">cloud_upload</span>
                    </div>
                    {selectedFile ? (
                      <div className="space-y-1">
                        <span className="text-sm font-bold text-white block truncate max-w-xs mx-auto">
                          {selectedFile.name}
                        </span>
                        <span className="text-[11px] text-emerald-400 font-bold">
                          Ready for upload ({selectedFile.size})
                        </span>
                      </div>
                    ) : (
                      <>
                        <p className="text-white font-bold text-sm">
                          Drag & drop report here, or <span className="text-purple-400 underline">browse file</span>
                        </p>
                        <p className="text-white/40 text-[11px] mt-1">
                          Supports PDF, JPG, PNG up to 15MB
                        </p>
                      </>
                    )}
                  </label>
                </div>
              </div>

              {/* Title & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-white/70 block mb-1 font-bold">Report Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Fasting Glucose & Lipid Profile"
                    value={testTitle}
                    onChange={(e) => setTestTitle(e.target.value)}
                    className="w-full bg-white/5 border border-white/15 focus:border-purple-400 rounded-xl p-3 text-white placeholder:text-white/30 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-white/70 block mb-1 font-bold">Test Category</label>
                  <select
                    value={testType}
                    onChange={(e) => setTestType(e.target.value as UploadedLabTest['testType'])}
                    className="w-full bg-[#0d1322] border border-white/15 focus:border-purple-400 rounded-xl p-3 text-white focus:outline-none"
                  >
                    {COMMON_TEST_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Lab / Diagnostic Center */}
              <div>
                <label className="text-white/70 block mb-1 font-bold">Diagnostic Center / Lab Name</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    placeholder="e.g., Dr Lal PathLabs, SRL, Metropolis"
                    value={labName}
                    onChange={(e) => setLabName(e.target.value)}
                    className="w-full bg-white/5 border border-white/15 focus:border-purple-400 rounded-xl p-3 text-white placeholder:text-white/30 focus:outline-none"
                  />
                </div>
                {/* Lab quick chips */}
                <div className="flex items-center gap-1.5 overflow-x-auto pt-2 pb-1">
                  {POPULAR_LABS.slice(0, 4).map((lab) => (
                    <button
                      type="button"
                      key={lab}
                      onClick={() => setLabName(lab)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] whitespace-nowrap border transition-all cursor-pointer ${
                        labName === lab
                          ? 'bg-purple-500/20 text-purple-300 border-purple-400'
                          : 'bg-white/5 text-white/60 border-white/10 hover:text-white'
                      }`}
                    >
                      {lab}
                    </button>
                  ))}
                </div>
              </div>

              {/* Patient Query / Note */}
              <div>
                <label className="text-white/70 block mb-1 font-bold">
                  Specific Question or Symptoms to Ask Doctor
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="e.g. Doctor, my blood sugar is slightly high today. Should I increase my walk or adjust medication dosage?"
                  value={patientQuestion}
                  onChange={(e) => setPatientQuestion(e.target.value)}
                  className="w-full bg-white/5 border border-white/15 focus:border-purple-400 rounded-xl p-3 text-white placeholder:text-white/30 focus:outline-none resize-none"
                />
              </div>

              {/* Actions */}
              <div className="pt-3 flex items-center justify-end gap-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 text-xs uppercase tracking-wider cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-orange-500 text-white font-mono text-xs font-bold uppercase tracking-wider shadow-lg shadow-purple-900/40 hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  {isSubmitting ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      Uploading...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[16px]">send</span>
                      Send to Doctor
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: DOCTOR WRITE CLINICAL REVIEW */}
      {selectedTestForReview && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0e1424] border border-purple-500/30 rounded-[28px] max-w-xl w-full p-6 md:p-8 shadow-2xl relative animate-scaleIn max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedTestForReview(null)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white/60 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300">
                <span className="material-symbols-outlined text-2xl">rate_review</span>
              </div>
              <div>
                <h3 className="font-headline-md text-xl font-bold text-white">
                  Doctor Clinical Review
                </h3>
                <p className="text-xs font-mono text-white/50">
                  Reviewing {selectedTestForReview.title} for {patient.name}
                </p>
              </div>
            </div>

            {/* Test Context */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-3.5 space-y-2 mb-4 text-xs font-mono">
              <div className="flex justify-between text-white/60">
                <span>Lab: <strong>{selectedTestForReview.labName}</strong></span>
                <span>File: <strong>{selectedTestForReview.fileName}</strong></span>
              </div>
              <div className="bg-black/30 p-2.5 rounded-lg border border-white/5">
                <span className="text-[10px] text-purple-300 uppercase block font-bold">Patient Question:</span>
                <p className="text-white/90 italic mt-0.5">"{selectedTestForReview.patientQuestion}"</p>
              </div>
            </div>

            <div className="space-y-4 text-xs font-mono">
              <div>
                <label className="text-white/70 block mb-1 font-bold">Clinical Assessment & Diagnosis</label>
                <textarea
                  rows={3}
                  required
                  placeholder="e.g. Blood sugar levels are slightly elevated but kidney function and electrolytes remain optimal..."
                  value={doctorAssessment}
                  onChange={(e) => setDoctorAssessment(e.target.value)}
                  className="w-full bg-white/5 border border-white/15 focus:border-emerald-400 rounded-xl p-3 text-white placeholder:text-white/30 focus:outline-none resize-none"
                />
              </div>

              <div>
                <label className="text-white/70 block mb-1 font-bold">Action Plan & Patient Instructions</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Continue current dosage. Walk 30 minutes daily after dinner and re-test in 4 weeks."
                  value={doctorActionPlan}
                  onChange={(e) => setDoctorActionPlan(e.target.value)}
                  className="w-full bg-white/5 border border-white/15 focus:border-emerald-400 rounded-xl p-3 text-white placeholder:text-white/30 focus:outline-none resize-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="rx-update"
                  checked={prescriptionUpdated}
                  onChange={(e) => setPrescriptionUpdated(e.target.checked)}
                  className="rounded border-white/20 bg-white/5 text-purple-600 focus:ring-purple-500"
                />
                <label htmlFor="rx-update" className="text-white/80 cursor-pointer">
                  Prescription adjusted based on this report
                </label>
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setSelectedTestForReview(null)}
                  className="px-4 py-2 rounded-xl bg-white/5 text-white/70 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleDoctorSubmitReview(selectedTestForReview.id)}
                  className="px-6 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-mono text-xs font-bold uppercase tracking-wider shadow-lg shadow-emerald-900/40 hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[16px]">check</span>
                  Submit Review to Patient
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
