export type PatientStatus = 'Active' | 'Critical' | 'Stable' | 'Pending Lab';

export type RecordType = 'MRI' | 'CLINIC' | 'BLOOD' | 'X-RAY' | 'CT' | 'NOTE' | 'CONSULTATION' | 'TELEHEALTH';

export type UserRole = 'doctor' | 'patient';

export interface Vitals {
  bloodPressure: {
    value: string;
    systolic: number;
    diastolic: number;
    unit: string;
    status: 'Stable' | 'Elevated' | 'High' | 'Normal';
  };
  heartRate: {
    value: number;
    unit: string;
    status: 'Normal' | 'Elevated' | 'Low';
  };
  weight: {
    value: number;
    unit: string;
    change: string;
  };
  spO2: {
    value: number;
    unit: string;
    condition: string;
  };
  temperature?: {
    value: number;
    unit: string;
  };
  respirationRate?: {
    value: number;
    unit: string;
  };
}

export interface LabItem {
  testName: string;
  value: string;
  unit: string;
  referenceRange: string;
  flag?: 'NORMAL' | 'HIGH' | 'LOW' | 'CRITICAL';
}

export interface ClinicalRecord {
  id: string;
  type: RecordType;
  title: string;
  date: string;
  doctor: string;
  clinicOrLab: string;
  summary: string;
  detailedFindings?: string[];
  impression?: string;
  recommendations?: string;
  badgeLabel: string;
  hasReport?: boolean;
  hasLabResults?: boolean;
  labItems?: LabItem[];
  imagingUrl?: string;
  imagingType?: string;
}

export interface DoctorSuggestion {
  id: string;
  date: string;
  doctorName: string;
  doctorTitle: string;
  category: 'Medication' | 'Diet & Nutrition' | 'Activity & Rest' | 'Follow-up' | 'General Advice';
  suggestion: string;
  priority: 'Routine' | 'High' | 'Immediate';
}

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  instructions: string;
  prescribedBy: string;
  startDate: string;
  status: 'Active' | 'Completed';
}

export interface VitalTrendPoint {
  id?: string;
  date: string; // e.g. "Aug 26" or "2026-08-26"
  time?: string; // e.g. "08:30 AM"
  systolic: number; // mmHg
  diastolic: number; // mmHg
  heartRate: number; // bpm
  spO2?: number; // %
  weight?: number; // kg
  notes?: string;
  tag?: 'Morning' | 'Evening' | 'Post-Meal' | 'Resting' | 'Post-Walk';
}

export interface Patient {
  id: string; // e.g. PID-99821
  pin?: string; // 4-digit PIN for patient login (e.g. '1234')
  name: string;
  dob: string;
  age: number;
  gender: 'Female' | 'Male' | 'Other';
  bloodType: string;
  status: PatientStatus;
  avatarUrl?: string;
  initials?: string;
  timeSeenToday?: string;
  phone?: string;
  email?: string;
  room?: string;
  allergies?: string[];
  assignedDoctorId?: string;
  assignedDoctorName?: string;
  vitals: Vitals;
  vitalsHistory?: VitalTrendPoint[];
  clinicalHistory: ClinicalRecord[];
  doctorSuggestions?: DoctorSuggestion[];
  medications?: Medication[];
  doctorObservations?: string[]; // Internal doctor-only observations (strictly hidden from patient portal)
  uploadedLabTests?: UploadedLabTest[];
  videoConsultations?: VideoConsultationSession[];
}

export interface UploadedLabTest {
  id: string;
  patientId: string;
  patientName: string;
  title: string;
  testType: 'Blood Work' | 'Radiology / X-Ray' | 'ECG / Cardiology' | 'Pathology / Urine' | 'Lipid & Sugar' | 'Other';
  dateUploaded: string;
  labName: string;
  patientQuestion: string;
  fileName: string;
  fileSize: string;
  fileType: 'pdf' | 'image';
  fileDataUrl?: string; // image or simulated doc
  status: 'Pending Review' | 'Under Review' | 'Reviewed';
  assignedDoctorId?: string;
  assignedDoctorName?: string;
  doctorResponse?: {
    doctorName: string;
    doctorId?: string;
    respondedAt: string;
    assessment: string;
    actionPlan: string;
    prescriptionUpdated?: boolean;
    urgentFollowUpNeeded?: boolean;
  };
}

export interface VideoConsultationSession {
  id: string;
  patientId: string;
  patientName: string;
  patientAvatar?: string;
  doctorId: string;
  doctorName: string;
  doctorSpecialty?: string;
  scheduledTime: string;
  status: 'Scheduled' | 'Live' | 'Completed' | 'Missed';
  roomCode: string;
  durationMinutes?: number;
  chiefComplaint?: string;
  consultationSummary?: string;
  prescriptionsGiven?: string[];
  telehealthNotes?: string;
}

export interface DoctorProfile {
  id: string;
  name: string;
  title: string;
  department: string;
  room: string;
  employeeId: string;
  avatarUrl: string;
  patientsCount: number;
  apptsTodayCount: number;
  biometricEnabled: boolean;
  criticalAlertsEnabled: boolean;
  scheduleUpdatesEnabled: boolean;
  language: string;
  pin: string;
  specialty?: string;
  email?: string;
  phone?: string;
}

export interface MedicineAlarm {
  id: string;
  medicineId?: string;
  medicineName: string;
  dosage: string;
  slot: 'Morning' | 'Afternoon' | 'Evening' | 'Night';
  time: string; // e.g. "08:30 AM" or "08:30"
  instructions: string;
  isEnabled: boolean;
  isTakenToday: boolean;
  takenAt?: string;
}

export type PatientSection =
  | 'overview'
  | 'vitals-trends'
  | 'lab-upload'
  | 'video-consult'
  | 'suggestions'
  | 'medications'
  | 'alarms'
  | 'meals'
  | 'medicine-search'
  | 'records';

export type ActiveTab =
  | 'dashboard'
  | 'patients'
  | 'records'
  | 'telehealth'
  | 'lab-reviews'
  | 'profile'
  | 'suggestions'
  | 'prescriptions'
  | 'my-health'
  | 'my-reports'
  | 'lab-upload'
  | 'video-consult'
  | 'meals'
  | 'alarms'
  | 'medicine-search';


