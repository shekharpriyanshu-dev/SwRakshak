import React, { useState, useEffect } from 'react';
import { initialDoctors, initialPatients } from './data/mockData';
import { api } from './utils/api';
import {
  ActiveTab,
  ClinicalRecord,
  DoctorProfile,
  DoctorSuggestion,
  Medication,
  Patient,
  UserRole,
  VitalTrendPoint,
  UploadedLabTest,
  VideoConsultationSession,
} from './types';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { DashboardView } from './components/DashboardView';
import { PatientsView } from './components/PatientsView';
import { RecordsView } from './components/RecordsView';
import { ProfileView } from './components/ProfileView';
import { PatientPortalView } from './components/PatientPortalView';
import { VideoConsultationModal } from './components/VideoConsultationModal';
import { AuthPage } from './components/AuthPage';
import { LandingPage } from './components/LandingPage';
import { CompanyFooter } from './components/CompanyFooter';
import {
  AddDoctorModal,
  AddDoctorObservationModal,
  AddDoctorSuggestionModal,
  AddPatientModal,
  AddPrescriptionModal,
  AddRecordModal,
  ChangePinModal,
  DoctorSwitchModal,
  LabResultsModal,
  LockScreenOverlay,
  PatientLoginModal,
  ReportModal,
  UpdateVitalsModal,
} from './components/Modals';

const PATIENTS_STORAGE_KEY = 'swrakshak_patients_v2';
const DOCTORS_STORAGE_KEY = 'swrakshak_doctors_v2';
const CURRENT_DOC_ID_KEY = 'swrakshak_current_doc_id';
const ROLE_STORAGE_KEY = 'swrakshak_user_role';
const CURRENT_PATIENT_ID_KEY = 'swrakshak_current_patient_id';

export default function App() {
  // Role State: 'doctor' or 'patient'
  const [userRole, setUserRole] = useState<UserRole>(() => {
    try {
      const saved = localStorage.getItem(ROLE_STORAGE_KEY);
      if (saved === 'doctor' || saved === 'patient') return saved;
    } catch (e) {
      console.error(e);
    }
    return 'doctor';
  });

  const [activeTab, setActiveTab] = useState<ActiveTab>('landing');
  const [dbType, setDbType] = useState<string>('sqlite');

  // Multi-Doctor Registry State
  const [doctors, setDoctors] = useState<DoctorProfile[]>(() => {
    try {
      const saved = localStorage.getItem(DOCTORS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Failed to restore doctors from storage', e);
    }
    return initialDoctors;
  });

  // Current Active Doctor Profile
  const [currentDoctor, setCurrentDoctor] = useState<DoctorProfile>(() => {
    try {
      const savedId = localStorage.getItem(CURRENT_DOC_ID_KEY);
      if (savedId) {
        const savedDoctors = localStorage.getItem(DOCTORS_STORAGE_KEY);
        if (savedDoctors) {
          const parsed = JSON.parse(savedDoctors);
          const found = parsed.find((d: DoctorProfile) => d.id === savedId);
          if (found) return found;
        }
      }
    } catch (e) {
      console.error(e);
    }
    return initialDoctors[0];
  });

  // Patients Collection State
  const [patients, setPatients] = useState<Patient[]>(() => {
    try {
      const saved = localStorage.getItem(PATIENTS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Failed to restore patients from storage', e);
    }
    return initialPatients;
  });

  // Fetch real data from Node.js + Express SQL Database API
  useEffect(() => {
    let isMounted = true;
    async function loadSqlDatabaseData() {
      try {
        const healthRes = await api.checkHealth().catch(() => null);
        if (isMounted && healthRes?.database) {
          setDbType(healthRes.database);
        }

        const [apiDoctors, apiPatients] = await Promise.all([
          api.getDoctors().catch(() => null),
          api.getPatients().catch(() => null),
        ]);

        if (!isMounted) return;

        if (apiDoctors && apiDoctors.length > 0) {
          setDoctors(apiDoctors);
          setCurrentDoctor((curr) => apiDoctors.find((d) => d.id === curr.id) || apiDoctors[0]);
        }

        if (apiPatients && apiPatients.length > 0) {
          setPatients(apiPatients);
          setSelectedPatient((curr) => apiPatients.find((p) => p.id === curr.id) || apiPatients[0]);
          setCurrentPatient((curr) => (curr ? apiPatients.find((p) => p.id === curr.id) || apiPatients[0] : apiPatients[0]));
        }
      } catch (err) {
        console.warn('[SwRakshak] Running in offline/cache mode:', err);
      }
    }

    loadSqlDatabaseData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Selected Patient for Doctor View
  const [selectedPatient, setSelectedPatient] = useState<Patient>(() => {
    return initialPatients[0];
  });

  // Logged-in Patient for Patient Portal View
  const [currentPatient, setCurrentPatient] = useState<Patient | null>(() => {
    try {
      const savedPatientId = localStorage.getItem(CURRENT_PATIENT_ID_KEY);
      if (savedPatientId) {
        const found = initialPatients.find((p) => p.id === savedPatientId);
        if (found) return found;
      }
    } catch (e) {
      console.error(e);
    }
    return initialPatients[0];
  });

  // Persist storage
  useEffect(() => {
    try {
      localStorage.setItem(PATIENTS_STORAGE_KEY, JSON.stringify(patients));
    } catch (e) {
      console.error(e);
    }
  }, [patients]);

  useEffect(() => {
    try {
      localStorage.setItem(DOCTORS_STORAGE_KEY, JSON.stringify(doctors));
    } catch (e) {
      console.error(e);
    }
  }, [doctors]);

  useEffect(() => {
    try {
      localStorage.setItem(CURRENT_DOC_ID_KEY, currentDoctor.id);
    } catch (e) {
      console.error(e);
    }
  }, [currentDoctor]);

  useEffect(() => {
    try {
      localStorage.setItem(ROLE_STORAGE_KEY, userRole);
    } catch (e) {
      console.error(e);
    }
  }, [userRole]);

  useEffect(() => {
    if (currentPatient) {
      try {
        localStorage.setItem(CURRENT_PATIENT_ID_KEY, currentPatient.id);
      } catch (e) {
        console.error(e);
      }
    }
  }, [currentPatient]);

  // Keep selectedPatient synced with latest patient array changes
  useEffect(() => {
    if (selectedPatient) {
      const current = patients.find((p) => p.id === selectedPatient.id);
      if (current && JSON.stringify(current) !== JSON.stringify(selectedPatient)) {
        setSelectedPatient(current);
      }
    }
  }, [patients, selectedPatient]);

  // Keep currentPatient synced with latest patient array changes
  useEffect(() => {
    if (currentPatient) {
      const current = patients.find((p) => p.id === currentPatient.id);
      if (current && JSON.stringify(current) !== JSON.stringify(currentPatient)) {
        setCurrentPatient(current);
      }
    }
  }, [patients, currentPatient]);

  // Modals Visibility
  const [activeReportRecord, setActiveReportRecord] = useState<ClinicalRecord | null>(null);
  const [activeLabRecord, setActiveLabRecord] = useState<ClinicalRecord | null>(null);
  const [isAddRecordOpen, setIsAddRecordOpen] = useState(false);
  const [isAddPatientOpen, setIsAddPatientOpen] = useState(false);
  const [isUpdateVitalsOpen, setIsUpdateVitalsOpen] = useState(false);
  const [isChangePinOpen, setIsChangePinOpen] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [isDoctorSwitchOpen, setIsDoctorSwitchOpen] = useState(false);
  const [isAddDoctorOpen, setIsAddDoctorOpen] = useState(false);
  const [isPatientLoginOpen, setIsPatientLoginOpen] = useState(false);
  const [isAddSuggestionOpen, setIsAddSuggestionOpen] = useState(false);
  const [isAddPrescriptionOpen, setIsAddPrescriptionOpen] = useState(false);
  const [isAddObservationOpen, setIsAddObservationOpen] = useState(false);
  const [isDoctorVideoModalOpen, setIsDoctorVideoModalOpen] = useState(false);

  // Toast Notification System
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 3500);
  };

  // Role switching
  const handleSwitchRole = (newRole: UserRole) => {
    setUserRole(newRole);
    if (newRole === 'doctor') {
      setActiveTab('dashboard');
      showToast(`Switched to Doctor Hub (${currentDoctor.name})`);
    } else {
      setActiveTab('my-health');
      showToast(`Accessing Patient Portal for ${currentPatient?.name || 'Patient'}`);
    }
  };

  // Doctor Management
  const handleSelectDoctor = (doctor: DoctorProfile) => {
    setCurrentDoctor(doctor);
    setUserRole('doctor');
    setActiveTab('dashboard');
    showToast(`Signed in as ${doctor.name} (${doctor.department})`);
  };

  const handleAddDoctor = (newDoc: DoctorProfile) => {
    setDoctors((prev) => [newDoc, ...prev]);
    setCurrentDoctor(newDoc);
    setUserRole('doctor');
    setActiveTab('dashboard');
    showToast(`Registered and signed in as ${newDoc.name}`);
    api.saveDoctor(newDoc).catch((err) => console.error('Failed to sync doctor to SQL DB:', err));
  };

  // Patient Login
  const handleLoginPatient = (patient: Patient) => {
    setCurrentPatient(patient);
    setSelectedPatient(patient);
    setUserRole('patient');
    setActiveTab('my-health');
    showToast(`Welcome to SwRakshak Patient Portal, ${patient.name}`);
  };

  // Patient Registration from Auth Page
  const handleRegisterPatient = (newPatient: Patient) => {
    setPatients((prev) => [newPatient, ...prev]);
    setCurrentPatient(newPatient);
    setSelectedPatient(newPatient);
    setUserRole('patient');
    setActiveTab('my-health');
    showToast(`Registered and signed in as ${newPatient.name}`);
    api.createPatient(newPatient).catch((err) => console.error('Failed to sync patient to SQL DB:', err));
  };

  // Patient selection from doctor list
  const handleSelectPatientFromDoctor = (patient: Patient) => {
    setSelectedPatient(patient);
    setActiveTab('records');
  };

  // Save new clinical record
  const handleSaveRecord = (patientId: string, record: ClinicalRecord) => {
    setPatients((prev) =>
      prev.map((p) => {
        if (p.id === patientId) {
          return {
            ...p,
            clinicalHistory: [record, ...p.clinicalHistory],
          };
        }
        return p;
      })
    );
    showToast(`New ${record.type} record saved for patient`);
    api.addClinicalRecord(patientId, record).catch((err) => console.error('Failed to save record to SQL DB:', err));
  };

  // Save doctor suggestion / care advice
  const handleSaveSuggestion = (patientId: string, suggestion: DoctorSuggestion) => {
    setPatients((prev) =>
      prev.map((p) => {
        if (p.id === patientId) {
          return {
            ...p,
            doctorSuggestions: [suggestion, ...(p.doctorSuggestions || [])],
          };
        }
        return p;
      })
    );
    showToast(`Doctor advice published to patient portal`);
    api.addDoctorSuggestion(patientId, suggestion).catch((err) => console.error('Failed to save suggestion to SQL DB:', err));
  };

  // Save prescription
  const handleSavePrescription = (patientId: string, prescription: Medication) => {
    setPatients((prev) =>
      prev.map((p) => {
        if (p.id === patientId) {
          return {
            ...p,
            medications: [prescription, ...(p.medications || [])],
          };
        }
        return p;
      })
    );
    showToast(`Prescription recorded for ${prescription.name}`);
    api.addMedication(patientId, prescription).catch((err) => console.error('Failed to save medication to SQL DB:', err));
  };

  // Save confidential doctor observation (MD Only)
  const handleSaveObservation = (patientId: string, observation: string) => {
    let updatedObservations: string[] = [];
    setPatients((prev) =>
      prev.map((p) => {
        if (p.id === patientId) {
          updatedObservations = [observation, ...(p.doctorObservations || [])];
          return {
            ...p,
            doctorObservations: updatedObservations,
          };
        }
        return p;
      })
    );
    showToast(`Confidential internal MD observation saved`);
    api.updatePatient(patientId, { doctorObservations: updatedObservations }).catch((err) => console.error('Failed to update observations in SQL DB:', err));
  };

  // Save vitals
  const handleSaveVitals = (patientId: string, newVitals: Patient['vitals']) => {
    setPatients((prev) =>
      prev.map((p) => {
        if (p.id === patientId) {
          return { ...p, vitals: newVitals };
        }
        return p;
      })
    );
    showToast(`Vitals updated for ${selectedPatient.name}`);
    api.recordVitals(patientId, newVitals).catch((err) => console.error('Failed to save vitals in SQL DB:', err));
  };

  // Update vitals history from patient portal
  const handleUpdatePatientVitalsHistory = (updatedHistory: VitalTrendPoint[]) => {
    if (!currentPatient) return;
    const latest = updatedHistory[updatedHistory.length - 1];

    let computedVitals: Patient['vitals'] = currentPatient.vitals;
    setPatients((prev) =>
      prev.map((p) => {
        if (p.id === currentPatient.id) {
          const updatedVitals: Patient['vitals'] = latest
            ? {
                ...p.vitals,
                bloodPressure: {
                  ...p.vitals.bloodPressure,
                  value: `${latest.systolic}/${latest.diastolic}`,
                  systolic: latest.systolic,
                  diastolic: latest.diastolic,
                  status:
                    latest.systolic > 135 || latest.diastolic > 88
                      ? 'Elevated'
                      : 'Stable',
                },
                heartRate: {
                  ...p.vitals.heartRate,
                  value: latest.heartRate,
                },
                ...(latest.spO2
                  ? { spO2: { ...p.vitals.spO2, value: latest.spO2 } }
                  : {}),
                ...(latest.weight
                  ? { weight: { ...p.vitals.weight, value: latest.weight } }
                  : {}),
              }
            : p.vitals;
          computedVitals = updatedVitals;

          return {
            ...p,
            vitals: updatedVitals,
            vitalsHistory: updatedHistory,
          };
        }
        return p;
      })
    );

    if (latest) {
      api.recordVitals(currentPatient.id, computedVitals, latest).catch((err) => console.error('Failed to sync vitals to SQL DB:', err));
    }
  };

  // Update uploaded lab tests for a patient
  const handleUpdatePatientTests = (patientId: string, updatedTests: UploadedLabTest[]) => {
    setPatients((prev) =>
      prev.map((p) => {
        if (p.id === patientId) {
          return {
            ...p,
            uploadedLabTests: updatedTests,
          };
        }
        return p;
      })
    );

    const latest = updatedTests[0];
    if (latest) {
      api.uploadLabTest(patientId, latest).catch((err) => console.error('Failed to sync lab test to SQL DB:', err));
    }
  };

  // Record completed video consultation
  const handleCompleteConsultation = (patientId: string, session: VideoConsultationSession) => {
    // Also create a clinical record entry for consultation history
    const consultRecord: ClinicalRecord = {
      id: `rec-${session.id}`,
      type: 'CONSULTATION',
      title: `Telehealth Video Consultation (${session.doctorName})`,
      date: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
      doctor: session.doctorName,
      clinicOrLab: 'Telehealth Remote Care',
      summary:
        session.consultationSummary ||
        session.telehealthNotes ||
        `Remote video consultation completed with ${session.doctorName}. Duration: ${session.durationMinutes || 15} mins.`,
      badgeLabel: 'TELEHEALTH',
      detailedFindings:
        session.prescriptionsGiven && session.prescriptionsGiven.length > 0
          ? [`Prescriptions Issued: ${session.prescriptionsGiven.join(', ')}`]
          : ['Routine virtual check-in and patient guidance.'],
      recommendations: session.telehealthNotes || 'Continue prescribed care regime and monitor vitals.',
    };

    setPatients((prev) =>
      prev.map((p) => {
        if (p.id === patientId) {
          const currentSessions = p.videoConsultations || [];
          return {
            ...p,
            videoConsultations: [session, ...currentSessions],
            clinicalHistory: [consultRecord, ...p.clinicalHistory],
          };
        }
        return p;
      })
    );
    showToast(`Video consultation with ${session.patientName} saved to medical record`);

    api.scheduleVideoConsultation(session).catch((err) => console.error('Failed to sync video consult to SQL DB:', err));
    api.addClinicalRecord(patientId, consultRecord).catch((err) => console.error('Failed to sync consult record to SQL DB:', err));
  };

  // Register new patient
  const handleAddPatient = (newPatient: Patient) => {
    const patientWithDoc: Patient = {
      ...newPatient,
      assignedDoctorId: currentDoctor.id,
      assignedDoctorName: currentDoctor.name,
      pin: '1234',
    };
    setPatients((prev) => [patientWithDoc, ...prev]);
    setSelectedPatient(patientWithDoc);
    setActiveTab('records');
    showToast(`Registered patient ${newPatient.name} (${newPatient.id})`);
    api.createPatient(patientWithDoc).catch((err) => console.error('Failed to create patient in SQL DB:', err));
  };

  // Update doctor PIN
  const handleSaveDoctorPin = (newPin: string) => {
    const updated = { ...currentDoctor, pin: newPin };
    setCurrentDoctor(updated);
    setDoctors((prev) =>
      prev.map((d) => (d.id === currentDoctor.id ? updated : d))
    );
    showToast('Security PIN successfully updated');
    api.saveDoctor(updated).catch((err) => console.error('Failed to update doctor PIN in SQL DB:', err));
  };

  const handleUpdateDoctor = (updated: Partial<DoctorProfile>) => {
    const merged = { ...currentDoctor, ...updated };
    setCurrentDoctor(merged);
    setDoctors((prev) =>
      prev.map((d) => (d.id === currentDoctor.id ? merged : d))
    );
    api.saveDoctor(merged).catch((err) => console.error('Failed to update doctor profile in SQL DB:', err));
  };

  // Quick Open MRI Scan
  const handleOpenRecentScans = () => {
    const scanRec = selectedPatient.clinicalHistory.find((r) => r.type === 'MRI') || {
      id: 'scan-demo',
      type: 'MRI' as const,
      title: 'Diagnostic Imaging (Knee Scan)',
      date: 'Mar 12, 2024',
      doctor: currentDoctor.name,
      clinicOrLab: 'Radiology Dept',
      summary: 'Routine MRI scan. High contrast imaging shows intact cruciate ligaments.',
      badgeLabel: 'MRI',
      detailedFindings: [
        'Anterior & posterior cruciate ligaments intact.',
        'Normal meniscal morphology.',
        'Mild effusion in suprapatellar recess.',
      ],
      impression: 'No ligament tear or osteochondral defect.',
    };
    setActiveReportRecord(scanRec);
  };

  // Primary Landing & First Appearance Page (SwRakshak About, Services, Notices & Info Editor)
  if (activeTab === 'landing') {
    return (
      <LandingPage
        onEnterAuth={(mode) => {
          setActiveTab('auth');
        }}
        onEnterDoctorHub={(doc) => {
          if (doc) {
            handleSelectDoctor(doc);
          } else {
            setUserRole('doctor');
            setActiveTab('dashboard');
          }
          showToast(`Entered SwRakshak Doctor Hub`);
        }}
        onEnterPatientPortal={(pat) => {
          if (pat) {
            handleLoginPatient(pat);
          } else {
            setUserRole('patient');
            setActiveTab('my-health');
          }
          showToast(`Entered SwRakshak Patient Portal`);
        }}
        doctors={doctors}
        patients={patients}
        showToast={showToast}
      />
    );
  }

  // Dedicated Authentication / Login & Signup Page
  if (activeTab === 'auth') {
    return (
      <AuthPage
        doctors={doctors}
        patients={patients}
        onLoginDoctor={(doc) => {
          handleSelectDoctor(doc);
        }}
        onLoginPatient={(pat) => {
          handleLoginPatient(pat);
        }}
        onRegisterDoctor={(newDoc) => {
          handleAddDoctor(newDoc);
        }}
        onRegisterPatient={(newPat) => {
          handleRegisterPatient(newPat);
        }}
        onCancel={() => {
          setActiveTab('landing');
        }}
        showToast={showToast}
        defaultRole={userRole}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#0a050b] text-[#f0f0f0] flex flex-col font-['Inter'] relative selection:bg-purple-600/30 selection:text-white overflow-x-hidden">
      {/* Immersive UI Ambient Glowing Orbs */}
      <div className="fixed top-[-15%] left-[-10%] w-[550px] h-[550px] bg-purple-900/25 rounded-full blur-[130px] pointer-events-none z-0"></div>
      <div className="fixed bottom-[-10%] right-[-5%] w-[500px] h-[500px] bg-orange-900/15 rounded-full blur-[110px] pointer-events-none z-0"></div>
      <div className="fixed top-[35%] left-[25%] w-[350px] h-[350px] bg-blue-900/15 rounded-full blur-[90px] pointer-events-none z-0"></div>

      {/* Top App Bar Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onSearchClick={() => setActiveTab('patients')}
        userRole={userRole}
        currentDoctor={currentDoctor}
        currentPatient={currentPatient}
        onOpenDoctorSwitchModal={() => setIsDoctorSwitchOpen(true)}
        onOpenPatientLoginModal={() => setIsPatientLoginOpen(true)}
        onSwitchRole={handleSwitchRole}
        onOpenAuthPage={() => setActiveTab('auth')}
        dbType={dbType}
      />

      {/* Main Content Area */}
      <main className="flex-grow flex flex-col relative z-10">
        {/* PATIENT ROLE VIEW */}
        {userRole === 'patient' && currentPatient && (
          <PatientPortalView
            patient={currentPatient}
            onOpenReportModal={(rec) => setActiveReportRecord(rec)}
            onOpenLabResultsModal={(rec) => setActiveLabRecord(rec)}
            onSwitchToDoctorLogin={() => setIsDoctorSwitchOpen(true)}
            onUpdatePatientVitals={handleUpdatePatientVitalsHistory}
            onUpdatePatientTests={(updatedTests) =>
              handleUpdatePatientTests(currentPatient.id, updatedTests)
            }
            onCompleteConsultation={(session) =>
              handleCompleteConsultation(currentPatient.id, session)
            }
            currentDoctor={currentDoctor}
            showToast={showToast}
          />
        )}

        {/* DOCTOR ROLE VIEWS */}
        {userRole === 'doctor' && (
          <>
            {activeTab === 'dashboard' && (
              <DashboardView
                patients={patients}
                onSelectPatient={handleSelectPatientFromDoctor}
                onOpenNewRecordModal={() => setIsAddRecordOpen(true)}
                onOpenRecentScansModal={handleOpenRecentScans}
                onOpenPendingLabsFilter={() => setActiveTab('patients')}
              />
            )}

            {activeTab === 'patients' && (
              <PatientsView
                patients={patients}
                onSelectPatient={handleSelectPatientFromDoctor}
                onAddNewPatient={() => setIsAddPatientOpen(true)}
              />
            )}

            {activeTab === 'records' && (
              <RecordsView
                patient={selectedPatient}
                allPatients={patients}
                onSelectPatient={setSelectedPatient}
                onBack={() => setActiveTab('patients')}
                onOpenReportModal={(rec) => setActiveReportRecord(rec)}
                onOpenLabResultsModal={(rec) => setActiveLabRecord(rec)}
                onOpenAddNoteModal={() => setIsAddRecordOpen(true)}
                onOpenEditProfileModal={() => showToast('Edit patient profile settings')}
                onOpenUpdateVitalsModal={() => setIsUpdateVitalsOpen(true)}
                onOpenAddSuggestionModal={() => setIsAddSuggestionOpen(true)}
                onOpenAddPrescriptionModal={() => setIsAddPrescriptionOpen(true)}
                onOpenAddObservationModal={() => setIsAddObservationOpen(true)}
                onStartVideoConsult={() => setIsDoctorVideoModalOpen(true)}
                onUpdatePatientTests={(updatedTests) =>
                  handleUpdatePatientTests(selectedPatient.id, updatedTests)
                }
                currentDoctor={currentDoctor}
                currentDoctorName={currentDoctor.name}
                showToast={showToast}
              />
            )}

            {activeTab === 'profile' && (
              <ProfileView
                doctor={currentDoctor}
                onUpdateDoctor={handleUpdateDoctor}
                onOpenChangePinModal={() => setIsChangePinOpen(true)}
                onLogout={() => {
                  setActiveTab('auth');
                  showToast('Logged out securely. Welcome to SwRakshak.');
                }}
                onEditPhoto={() => showToast('Doctor avatar photo edit enabled')}
                showToast={showToast}
              />
            )}
          </>
        )}
      </main>

      {/* Reusable Corporate Healthcare Footer with Address, Mail, Emergency Helpline */}
      <CompanyFooter onOpenAuth={() => setActiveTab('auth')} />

      {/* Mobile Bottom Navigation Bar */}
      <BottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        userRole={userRole}
        onOpenPatientLogin={() => setIsPatientLoginOpen(true)}
        onOpenDoctorSwitch={() => setIsDoctorSwitchOpen(true)}
      />

      {/* Modals */}
      {/* 1. Report Modal */}
      {activeReportRecord && (
        <ReportModal
          record={activeReportRecord}
          patient={userRole === 'patient' ? currentPatient : selectedPatient}
          onClose={() => setActiveReportRecord(null)}
          showToast={showToast}
        />
      )}

      {/* 2. Lab Results Modal */}
      {activeLabRecord && (
        <LabResultsModal
          record={activeLabRecord}
          patient={userRole === 'patient' ? currentPatient : selectedPatient}
          onClose={() => setActiveLabRecord(null)}
          showToast={showToast}
        />
      )}

      {/* 3. Add New Clinical Record Modal */}
      {isAddRecordOpen && (
        <AddRecordModal
          patients={patients}
          selectedPatientId={selectedPatient.id}
          doctorName={currentDoctor.name}
          onClose={() => setIsAddRecordOpen(false)}
          onSave={handleSaveRecord}
        />
      )}

      {/* 4. Add New Patient Modal */}
      {isAddPatientOpen && (
        <AddPatientModal
          onClose={() => setIsAddPatientOpen(false)}
          onAddPatient={handleAddPatient}
        />
      )}

      {/* 5. Update Vitals Modal */}
      {isUpdateVitalsOpen && (
        <UpdateVitalsModal
          patient={selectedPatient}
          onClose={() => setIsUpdateVitalsOpen(false)}
          onSaveVitals={handleSaveVitals}
        />
      )}

      {/* 6. Change Doctor PIN Modal */}
      {isChangePinOpen && (
        <ChangePinModal
          currentPin={currentDoctor.pin}
          onClose={() => setIsChangePinOpen(false)}
          onSavePin={handleSaveDoctorPin}
        />
      )}

      {/* 7. Doctor Switch / Sign In Modal */}
      {isDoctorSwitchOpen && (
        <DoctorSwitchModal
          doctors={doctors}
          currentDoctor={currentDoctor}
          onSelectDoctor={handleSelectDoctor}
          onOpenAddDoctorModal={() => setIsAddDoctorOpen(true)}
          onClose={() => setIsDoctorSwitchOpen(false)}
        />
      )}

      {/* 8. Add New Doctor Modal */}
      {isAddDoctorOpen && (
        <AddDoctorModal
          onClose={() => setIsAddDoctorOpen(false)}
          onAddDoctor={handleAddDoctor}
        />
      )}

      {/* 9. Patient Login Modal */}
      {isPatientLoginOpen && (
        <PatientLoginModal
          patients={patients}
          onLoginPatient={handleLoginPatient}
          onClose={() => setIsPatientLoginOpen(false)}
        />
      )}

      {/* 10. Add Doctor Suggestion Modal */}
      {isAddSuggestionOpen && (
        <AddDoctorSuggestionModal
          patient={selectedPatient}
          doctorName={currentDoctor.name}
          doctorTitle={currentDoctor.title}
          onClose={() => setIsAddSuggestionOpen(false)}
          onSaveSuggestion={handleSaveSuggestion}
        />
      )}

      {/* 11. Add Prescription Modal */}
      {isAddPrescriptionOpen && (
        <AddPrescriptionModal
          patient={selectedPatient}
          doctorName={currentDoctor.name}
          onClose={() => setIsAddPrescriptionOpen(false)}
          onSavePrescription={handleSavePrescription}
        />
      )}

      {/* 12. Add Doctor Observation (MD Only) Modal */}
      {isAddObservationOpen && (
        <AddDoctorObservationModal
          patient={selectedPatient}
          doctorName={currentDoctor.name}
          onClose={() => setIsAddObservationOpen(false)}
          onSaveObservation={handleSaveObservation}
        />
      )}

      {/* 13. Workstation Lock Screen Overlay */}
      {isLocked && (
        <LockScreenOverlay
          doctor={currentDoctor}
          onUnlock={() => {
            setIsLocked(false);
            showToast('Workstation unlocked securely');
          }}
        />
      )}

      {/* 14. Doctor Telehealth Video Consultation Modal */}
      {isDoctorVideoModalOpen && (
        <VideoConsultationModal
          isOpen={isDoctorVideoModalOpen}
          onClose={() => setIsDoctorVideoModalOpen(false)}
          patient={selectedPatient}
          currentDoctor={currentDoctor}
          isDoctorMode={true}
          showToast={showToast}
          onCompleteConsultation={(session) =>
            handleCompleteConsultation(selectedPatient.id, session)
          }
        />
      )}

      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed top-24 right-4 z-50 bg-[#150a1c]/95 text-white text-xs px-4 py-2.5 rounded-full shadow-[0_0_25px_rgba(0,0,0,0.7)] border border-white/20 backdrop-blur-xl flex items-center gap-2 animate-bounce">
          <div className="w-2 h-2 rounded-full bg-orange-400 animate-pulse"></div>
          <span className="font-medium tracking-wide">{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
