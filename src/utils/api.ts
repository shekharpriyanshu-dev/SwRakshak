import {
  ClinicalRecord,
  DoctorProfile,
  DoctorSuggestion,
  Medication,
  Patient,
  UploadedLabTest,
  VideoConsultationSession,
  VitalTrendPoint,
  Vitals,
} from '../types';

const API_BASE = '/api';

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.message || `Request failed with status ${response.status}`);
  }

  return response.json();
}

export const api = {
  // Check health and DB type
  checkHealth: async () => {
    return request<{ status: string; database: 'postgres' | 'sqlite' }>('/health');
  },

  // Doctors
  getDoctors: async (): Promise<DoctorProfile[]> => {
    const res = await request<{ success: boolean; data: DoctorProfile[] }>('/doctors');
    return res.data;
  },

  saveDoctor: async (doctor: DoctorProfile): Promise<DoctorProfile> => {
    const res = await request<{ success: boolean; data: DoctorProfile }>('/doctors', {
      method: 'POST',
      body: JSON.stringify(doctor),
    });
    return res.data;
  },

  // Patients
  getPatients: async (): Promise<Patient[]> => {
    const res = await request<{ success: boolean; data: Patient[] }>('/patients');
    return res.data;
  },

  getPatient: async (id: string): Promise<Patient> => {
    const res = await request<{ success: boolean; data: Patient }>(`/patients/${encodeURIComponent(id)}`);
    return res.data;
  },

  createPatient: async (patient: Patient): Promise<Patient> => {
    const res = await request<{ success: boolean; data: Patient }>('/patients', {
      method: 'POST',
      body: JSON.stringify(patient),
    });
    return res.data;
  },

  updatePatient: async (id: string, updates: Partial<Patient>): Promise<Patient> => {
    const res = await request<{ success: boolean; data: Patient }>(`/patients/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    return res.data;
  },

  // Vitals
  recordVitals: async (
    patientId: string,
    vitals: Vitals,
    trendPoint?: VitalTrendPoint
  ): Promise<Patient> => {
    const res = await request<{ success: boolean; data: Patient }>(
      `/patients/${encodeURIComponent(patientId)}/vitals`,
      {
        method: 'POST',
        body: JSON.stringify({ vitals, trendPoint }),
      }
    );
    return res.data;
  },

  // Records
  addClinicalRecord: async (patientId: string, record: ClinicalRecord): Promise<ClinicalRecord> => {
    const res = await request<{ success: boolean; data: ClinicalRecord }>(
      `/patients/${encodeURIComponent(patientId)}/records`,
      {
        method: 'POST',
        body: JSON.stringify(record),
      }
    );
    return res.data;
  },

  // Suggestions
  addDoctorSuggestion: async (
    patientId: string,
    suggestion: DoctorSuggestion
  ): Promise<DoctorSuggestion> => {
    const res = await request<{ success: boolean; data: DoctorSuggestion }>(
      `/patients/${encodeURIComponent(patientId)}/suggestions`,
      {
        method: 'POST',
        body: JSON.stringify(suggestion),
      }
    );
    return res.data;
  },

  // Medications
  addMedication: async (patientId: string, medication: Medication): Promise<Medication> => {
    const res = await request<{ success: boolean; data: Medication }>(
      `/patients/${encodeURIComponent(patientId)}/medications`,
      {
        method: 'POST',
        body: JSON.stringify(medication),
      }
    );
    return res.data;
  },

  // Upload Lab Test
  uploadLabTest: async (patientId: string, labTest: UploadedLabTest): Promise<UploadedLabTest> => {
    const res = await request<{ success: boolean; data: UploadedLabTest }>(
      `/patients/${encodeURIComponent(patientId)}/lab-tests`,
      {
        method: 'POST',
        body: JSON.stringify(labTest),
      }
    );
    return res.data;
  },

  // Review Lab Test
  reviewLabTest: async (
    labTestId: string,
    doctorResponse: NonNullable<UploadedLabTest['doctorResponse']>
  ): Promise<void> => {
    await request<{ success: boolean }>(`/lab-tests/${encodeURIComponent(labTestId)}/review`, {
      method: 'PUT',
      body: JSON.stringify({ doctorResponse }),
    });
  },

  // Video Consultations
  scheduleVideoConsultation: async (
    session: VideoConsultationSession
  ): Promise<VideoConsultationSession> => {
    const res = await request<{ success: boolean; data: VideoConsultationSession }>(
      '/video-consultations',
      {
        method: 'POST',
        body: JSON.stringify(session),
      }
    );
    return res.data;
  },

  updateVideoConsultation: async (
    id: string,
    updates: Partial<VideoConsultationSession>
  ): Promise<void> => {
    await request<{ success: boolean }>(`/video-consultations/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },
};
