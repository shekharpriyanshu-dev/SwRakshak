import { DatabaseSync } from 'node:sqlite';
import pg from 'pg';
import path from 'path';
import fs from 'fs';
import { initialDoctors, initialPatients } from '../src/data/mockData';
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
} from '../src/types';

// Detect whether to use PostgreSQL (if DATABASE_URL is configured) or embedded SQLite
const isPostgres = Boolean(process.env.DATABASE_URL);
let pgPool: pg.Pool | null = null;
let sqliteDb: DatabaseSync | null = null;

export function getDbType(): 'postgres' | 'sqlite' {
  return isPostgres ? 'postgres' : 'sqlite';
}

// Initialize Database Connection
export function getDbConnection() {
  if (isPostgres) {
    if (!pgPool) {
      pgPool = new pg.Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined,
      });
      pgPool.on('error', (err) => {
        console.error('Unexpected error on idle PostgreSQL client', err);
      });
    }
    return { type: 'postgres' as const, client: pgPool };
  } else {
    if (!sqliteDb) {
      const dbPath = path.resolve(process.cwd(), 'swrakshak.db');
      sqliteDb = new DatabaseSync(dbPath);
    }
    return { type: 'sqlite' as const, client: sqliteDb };
  }
}

// Convert '?' placeholders to '$1, $2, ...' for PostgreSQL queries
function formatSql(sql: string, isPg: boolean): string {
  if (!isPg) return sql;
  let paramIndex = 1;
  return sql.replace(/\?/g, () => `$${paramIndex++}`);
}

// Universal Query Executor
export async function executeQuery<T = any>(sql: string, params: any[] = []): Promise<T[]> {
  const db = getDbConnection();

  if (db.type === 'postgres') {
    const formatted = formatSql(sql, true);
    const result = await db.client.query(formatted, params);
    return result.rows as T[];
  } else {
    // SQLite
    const stmt = db.client.prepare(sql);
    if (sql.trim().toUpperCase().startsWith('SELECT')) {
      return stmt.all(...params) as T[];
    } else {
      stmt.run(...params);
      return [] as T[];
    }
  }
}

// Universal Command (INSERT, UPDATE, DELETE)
export async function executeCommand(sql: string, params: any[] = []): Promise<void> {
  const db = getDbConnection();

  if (db.type === 'postgres') {
    const formatted = formatSql(sql, true);
    await db.client.query(formatted, params);
  } else {
    const stmt = db.client.prepare(sql);
    stmt.run(...params);
  }
}

// Execute multiple DDL statements sequentially
async function executeBatchDDL(statements: string[]): Promise<void> {
  for (const stmt of statements) {
    const trimmed = stmt.trim();
    if (!trimmed) continue;
    await executeCommand(trimmed);
  }
}

// Initialize tables and seed initial data
export async function initDatabase(): Promise<void> {
  const isPg = isPostgres;
  console.log(`[Database] Initializing SQL Database (${isPg ? 'PostgreSQL' : 'SQLite'})...`);

  // Table DDL definitions
  const ddlStatements = [
    `CREATE TABLE IF NOT EXISTS doctors (
      id VARCHAR(100) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      title VARCHAR(255),
      department VARCHAR(255),
      room VARCHAR(100),
      employee_id VARCHAR(100),
      avatar_url TEXT,
      patients_count INTEGER DEFAULT 0,
      appts_today_count INTEGER DEFAULT 0,
      biometric_enabled BOOLEAN DEFAULT true,
      critical_alerts_enabled BOOLEAN DEFAULT true,
      schedule_updates_enabled BOOLEAN DEFAULT true,
      language VARCHAR(100) DEFAULT 'English (US)',
      pin VARCHAR(50) DEFAULT '1234',
      specialty VARCHAR(255),
      email VARCHAR(255),
      phone VARCHAR(100),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,

    `CREATE TABLE IF NOT EXISTS patients (
      id VARCHAR(100) PRIMARY KEY,
      pin VARCHAR(50) DEFAULT '1234',
      name VARCHAR(255) NOT NULL,
      dob VARCHAR(50),
      age INTEGER,
      gender VARCHAR(50),
      blood_type VARCHAR(20),
      status VARCHAR(50) DEFAULT 'Stable',
      avatar_url TEXT,
      initials VARCHAR(10),
      time_seen_today VARCHAR(100),
      phone VARCHAR(100),
      email VARCHAR(255),
      room VARCHAR(100),
      allergies TEXT,
      assigned_doctor_id VARCHAR(100),
      assigned_doctor_name VARCHAR(255),
      vitals TEXT,
      doctor_observations TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,

    `CREATE TABLE IF NOT EXISTS vital_trends (
      id VARCHAR(100) PRIMARY KEY,
      patient_id VARCHAR(100) NOT NULL,
      date VARCHAR(50) NOT NULL,
      time VARCHAR(50),
      systolic INTEGER NOT NULL,
      diastolic INTEGER NOT NULL,
      heart_rate INTEGER NOT NULL,
      spo2 INTEGER,
      weight REAL,
      tag VARCHAR(100),
      notes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,

    `CREATE TABLE IF NOT EXISTS clinical_records (
      id VARCHAR(100) PRIMARY KEY,
      patient_id VARCHAR(100) NOT NULL,
      type VARCHAR(50) NOT NULL,
      title VARCHAR(255) NOT NULL,
      date VARCHAR(50) NOT NULL,
      doctor VARCHAR(255) NOT NULL,
      clinic_or_lab VARCHAR(255),
      summary TEXT,
      detailed_findings TEXT,
      impression TEXT,
      recommendations TEXT,
      badge_label VARCHAR(100),
      has_report BOOLEAN DEFAULT true,
      has_lab_results BOOLEAN DEFAULT false,
      lab_items TEXT,
      imaging_url TEXT,
      imaging_type VARCHAR(100),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,

    `CREATE TABLE IF NOT EXISTS doctor_suggestions (
      id VARCHAR(100) PRIMARY KEY,
      patient_id VARCHAR(100) NOT NULL,
      date VARCHAR(50) NOT NULL,
      doctor_name VARCHAR(255) NOT NULL,
      doctor_title VARCHAR(255),
      category VARCHAR(100) NOT NULL,
      suggestion TEXT NOT NULL,
      priority VARCHAR(50) DEFAULT 'Routine',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,

    `CREATE TABLE IF NOT EXISTS medications (
      id VARCHAR(100) PRIMARY KEY,
      patient_id VARCHAR(100) NOT NULL,
      name VARCHAR(255) NOT NULL,
      dosage VARCHAR(100) NOT NULL,
      frequency VARCHAR(100) NOT NULL,
      instructions TEXT,
      prescribed_by VARCHAR(255) NOT NULL,
      start_date VARCHAR(50) NOT NULL,
      status VARCHAR(50) DEFAULT 'Active',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,

    `CREATE TABLE IF NOT EXISTS uploaded_lab_tests (
      id VARCHAR(100) PRIMARY KEY,
      patient_id VARCHAR(100) NOT NULL,
      patient_name VARCHAR(255) NOT NULL,
      title VARCHAR(255) NOT NULL,
      test_type VARCHAR(100) NOT NULL,
      date_uploaded VARCHAR(50) NOT NULL,
      lab_name VARCHAR(255),
      patient_question TEXT,
      file_name VARCHAR(255),
      file_size VARCHAR(50),
      file_type VARCHAR(50),
      file_data_url TEXT,
      status VARCHAR(50) DEFAULT 'Pending Review',
      assigned_doctor_id VARCHAR(100),
      assigned_doctor_name VARCHAR(255),
      doctor_response TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,

    `CREATE TABLE IF NOT EXISTS video_consultations (
      id VARCHAR(100) PRIMARY KEY,
      patient_id VARCHAR(100) NOT NULL,
      patient_name VARCHAR(255) NOT NULL,
      patient_avatar TEXT,
      doctor_id VARCHAR(100) NOT NULL,
      doctor_name VARCHAR(255) NOT NULL,
      doctor_specialty VARCHAR(255),
      scheduled_time VARCHAR(100) NOT NULL,
      status VARCHAR(50) DEFAULT 'Scheduled',
      room_code VARCHAR(100) NOT NULL,
      duration_minutes INTEGER DEFAULT 15,
      chief_complaint TEXT,
      consultation_summary TEXT,
      prescriptions_given TEXT,
      telehealth_notes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
  ];

  await executeBatchDDL(ddlStatements);

  // Seed Initial Doctors if empty
  const existingDoctors = await executeQuery<{ count: number | string }>(
    'SELECT COUNT(*) as count FROM doctors'
  );
  const docCount = Number(existingDoctors[0]?.count || 0);

  if (docCount === 0) {
    console.log('[Database] Seeding initial doctors into SQL database...');
    for (const doc of initialDoctors) {
      await executeCommand(
        `INSERT INTO doctors (
          id, name, title, department, room, employee_id, avatar_url,
          patients_count, appts_today_count, biometric_enabled,
          critical_alerts_enabled, schedule_updates_enabled, language,
          pin, specialty, email, phone
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          doc.id,
          doc.name,
          doc.title,
          doc.department,
          doc.room,
          doc.employeeId,
          doc.avatarUrl,
          doc.patientsCount,
          doc.apptsTodayCount,
          doc.biometricEnabled ? 1 : 0,
          doc.criticalAlertsEnabled ? 1 : 0,
          doc.scheduleUpdatesEnabled ? 1 : 0,
          doc.language,
          doc.pin || '1234',
          doc.specialty || '',
          doc.email || '',
          doc.phone || '',
        ]
      );
    }
  }

  // Seed Initial Patients if empty
  const existingPatients = await executeQuery<{ count: number | string }>(
    'SELECT COUNT(*) as count FROM patients'
  );
  const patCount = Number(existingPatients[0]?.count || 0);

  if (patCount === 0) {
    console.log('[Database] Seeding initial patients and medical records into SQL database...');
    for (const pat of initialPatients) {
      await insertFullPatient(pat);
    }
  }

  console.log('[Database] SQL tables and data verified.');
}

// Helper to insert a full Patient with all relations
export async function insertFullPatient(pat: Patient): Promise<void> {
  await executeCommand(
    `INSERT INTO patients (
      id, pin, name, dob, age, gender, blood_type, status,
      avatar_url, initials, time_seen_today, phone, email, room,
      allergies, assigned_doctor_id, assigned_doctor_name, vitals,
      doctor_observations
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      pat.id,
      pat.pin || '1234',
      pat.name,
      pat.dob,
      pat.age,
      pat.gender,
      pat.bloodType,
      pat.status,
      pat.avatarUrl || '',
      pat.initials || '',
      pat.timeSeenToday || '',
      pat.phone || '',
      pat.email || '',
      pat.room || '',
      JSON.stringify(pat.allergies || []),
      pat.assignedDoctorId || 'doc-1',
      pat.assignedDoctorName || 'Dr. Rajesh Sharma',
      JSON.stringify(pat.vitals),
      JSON.stringify(pat.doctorObservations || []),
    ]
  );

  // Insert Vitals History
  if (pat.vitalsHistory && pat.vitalsHistory.length > 0) {
    for (const v of pat.vitalsHistory) {
      const vId = v.id || `vh-${pat.id}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      await executeCommand(
        `INSERT INTO vital_trends (
          id, patient_id, date, time, systolic, diastolic, heart_rate, spo2, weight, tag, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          vId,
          pat.id,
          v.date,
          v.time || '',
          v.systolic,
          v.diastolic,
          v.heartRate,
          v.spO2 || 98,
          v.weight || 70,
          v.tag || '',
          v.notes || '',
        ]
      );
    }
  }

  // Insert Clinical History
  if (pat.clinicalHistory && pat.clinicalHistory.length > 0) {
    for (const rec of pat.clinicalHistory) {
      await executeCommand(
        `INSERT INTO clinical_records (
          id, patient_id, type, title, date, doctor, clinic_or_lab,
          summary, detailed_findings, impression, recommendations,
          badge_label, has_report, has_lab_results, lab_items,
          imaging_url, imaging_type
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          rec.id,
          pat.id,
          rec.type,
          rec.title,
          rec.date,
          rec.doctor,
          rec.clinicOrLab,
          rec.summary,
          JSON.stringify(rec.detailedFindings || []),
          rec.impression || '',
          rec.recommendations || '',
          rec.badgeLabel,
          rec.hasReport ? 1 : 0,
          rec.hasLabResults ? 1 : 0,
          JSON.stringify(rec.labItems || []),
          rec.imagingUrl || '',
          rec.imagingType || '',
        ]
      );
    }
  }

  // Insert Doctor Suggestions
  if (pat.doctorSuggestions && pat.doctorSuggestions.length > 0) {
    for (const sug of pat.doctorSuggestions) {
      await executeCommand(
        `INSERT INTO doctor_suggestions (
          id, patient_id, date, doctor_name, doctor_title, category, suggestion, priority
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          sug.id,
          pat.id,
          sug.date,
          sug.doctorName,
          sug.doctorTitle,
          sug.category,
          sug.suggestion,
          sug.priority,
        ]
      );
    }
  }

  // Insert Medications
  if (pat.medications && pat.medications.length > 0) {
    for (const med of pat.medications) {
      await executeCommand(
        `INSERT INTO medications (
          id, patient_id, name, dosage, frequency, instructions, prescribed_by, start_date, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          med.id,
          pat.id,
          med.name,
          med.dosage,
          med.frequency,
          med.instructions,
          med.prescribedBy,
          med.startDate,
          med.status,
        ]
      );
    }
  }

  // Insert Uploaded Lab Tests
  if (pat.uploadedLabTests && pat.uploadedLabTests.length > 0) {
    for (const lab of pat.uploadedLabTests) {
      await executeCommand(
        `INSERT INTO uploaded_lab_tests (
          id, patient_id, patient_name, title, test_type, date_uploaded,
          lab_name, patient_question, file_name, file_size, file_type,
          file_data_url, status, assigned_doctor_id, assigned_doctor_name,
          doctor_response
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          lab.id,
          pat.id,
          lab.patientName,
          lab.title,
          lab.testType,
          lab.dateUploaded,
          lab.labName,
          lab.patientQuestion,
          lab.fileName,
          lab.fileSize,
          lab.fileType,
          lab.fileDataUrl || '',
          lab.status,
          lab.assignedDoctorId || '',
          lab.assignedDoctorName || '',
          JSON.stringify(lab.doctorResponse || null),
        ]
      );
    }
  }

  // Insert Video Consultations
  if (pat.videoConsultations && pat.videoConsultations.length > 0) {
    for (const vc of pat.videoConsultations) {
      await executeCommand(
        `INSERT INTO video_consultations (
          id, patient_id, patient_name, patient_avatar, doctor_id, doctor_name,
          doctor_specialty, scheduled_time, status, room_code, duration_minutes,
          chief_complaint, consultation_summary, prescriptions_given, telehealth_notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          vc.id,
          pat.id,
          vc.patientName,
          vc.patientAvatar || '',
          vc.doctorId,
          vc.doctorName,
          vc.doctorSpecialty || '',
          vc.scheduledTime,
          vc.status,
          vc.roomCode,
          vc.durationMinutes || 15,
          vc.chiefComplaint || '',
          vc.consultationSummary || '',
          JSON.stringify(vc.prescriptionsGiven || []),
          vc.telehealthNotes || '',
        ]
      );
    }
  }
}

// ----------------------------------------------------------------------
// DATA ACCESS METHODS
// ----------------------------------------------------------------------

export async function getAllDoctors(): Promise<DoctorProfile[]> {
  const rows = await executeQuery<any>('SELECT * FROM doctors ORDER BY name ASC');
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    title: r.title,
    department: r.department,
    room: r.room,
    employeeId: r.employee_id,
    avatarUrl: r.avatar_url,
    patientsCount: Number(r.patients_count),
    apptsTodayCount: Number(r.appts_today_count),
    biometricEnabled: Boolean(r.biometric_enabled),
    criticalAlertsEnabled: Boolean(r.critical_alerts_enabled),
    scheduleUpdatesEnabled: Boolean(r.schedule_updates_enabled),
    language: r.language,
    pin: r.pin,
    specialty: r.specialty,
    email: r.email,
    phone: r.phone,
  }));
}

export async function saveDoctor(doc: DoctorProfile): Promise<DoctorProfile> {
  const existing = await executeQuery<any>('SELECT id FROM doctors WHERE id = ?', [doc.id]);
  if (existing.length > 0) {
    await executeCommand(
      `UPDATE doctors SET
        name = ?, title = ?, department = ?, room = ?, employee_id = ?,
        avatar_url = ?, patients_count = ?, appts_today_count = ?,
        biometric_enabled = ?, critical_alerts_enabled = ?,
        schedule_updates_enabled = ?, language = ?, pin = ?,
        specialty = ?, email = ?, phone = ?
      WHERE id = ?`,
      [
        doc.name,
        doc.title,
        doc.department,
        doc.room,
        doc.employeeId,
        doc.avatarUrl,
        doc.patientsCount,
        doc.apptsTodayCount,
        doc.biometricEnabled ? 1 : 0,
        doc.criticalAlertsEnabled ? 1 : 0,
        doc.scheduleUpdatesEnabled ? 1 : 0,
        doc.language,
        doc.pin,
        doc.specialty || '',
        doc.email || '',
        doc.phone || '',
        doc.id,
      ]
    );
  } else {
    await executeCommand(
      `INSERT INTO doctors (
        id, name, title, department, room, employee_id, avatar_url,
        patients_count, appts_today_count, biometric_enabled,
        critical_alerts_enabled, schedule_updates_enabled, language,
        pin, specialty, email, phone
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        doc.id,
        doc.name,
        doc.title,
        doc.department,
        doc.room,
        doc.employeeId,
        doc.avatarUrl,
        doc.patientsCount,
        doc.apptsTodayCount,
        doc.biometricEnabled ? 1 : 0,
        doc.criticalAlertsEnabled ? 1 : 0,
        doc.scheduleUpdatesEnabled ? 1 : 0,
        doc.language,
        doc.pin,
        doc.specialty || '',
        doc.email || '',
        doc.phone || '',
      ]
    );
  }
  return doc;
}

export async function getAllPatients(): Promise<Patient[]> {
  const patientRows = await executeQuery<any>('SELECT * FROM patients ORDER BY created_at DESC');

  const [trendsRows, recordsRows, suggestionsRows, medsRows, labsRows, consultRows] = await Promise.all([
    executeQuery<any>('SELECT * FROM vital_trends ORDER BY created_at ASC'),
    executeQuery<any>('SELECT * FROM clinical_records ORDER BY created_at DESC'),
    executeQuery<any>('SELECT * FROM doctor_suggestions ORDER BY created_at DESC'),
    executeQuery<any>('SELECT * FROM medications ORDER BY created_at DESC'),
    executeQuery<any>('SELECT * FROM uploaded_lab_tests ORDER BY created_at DESC'),
    executeQuery<any>('SELECT * FROM video_consultations ORDER BY created_at DESC'),
  ]);

  return patientRows.map((p) => {
    let vitalsObj: Vitals = {
      bloodPressure: { value: '120/80', systolic: 120, diastolic: 80, unit: 'mmHg', status: 'Normal' },
      heartRate: { value: 72, unit: 'bpm', status: 'Normal' },
      weight: { value: 155, unit: 'lbs', change: '0' },
      spO2: { value: 99, unit: '%', condition: 'Optimal' },
    };

    try {
      if (p.vitals) vitalsObj = JSON.parse(p.vitals);
    } catch {
      // fallback
    }

    let allergies: string[] = [];
    try {
      if (p.allergies) allergies = JSON.parse(p.allergies);
    } catch {}

    let doctorObservations: string[] = [];
    try {
      if (p.doctor_observations) doctorObservations = JSON.parse(p.doctor_observations);
    } catch {}

    const vitalsHistory: VitalTrendPoint[] = trendsRows
      .filter((t) => t.patient_id === p.id)
      .map((t) => ({
        id: t.id,
        date: t.date,
        time: t.time,
        systolic: Number(t.systolic),
        diastolic: Number(t.diastolic),
        heartRate: Number(t.heart_rate),
        spO2: t.spo2 ? Number(t.spo2) : undefined,
        weight: t.weight ? Number(t.weight) : undefined,
        tag: t.tag || undefined,
        notes: t.notes || undefined,
      }));

    const clinicalHistory: ClinicalRecord[] = recordsRows
      .filter((r) => r.patient_id === p.id)
      .map((r) => {
        let findings: string[] = [];
        try {
          if (r.detailed_findings) findings = JSON.parse(r.detailed_findings);
        } catch {}

        let labItems = undefined;
        try {
          if (r.lab_items) labItems = JSON.parse(r.lab_items);
        } catch {}

        return {
          id: r.id,
          type: r.type,
          title: r.title,
          date: r.date,
          doctor: r.doctor,
          clinicOrLab: r.clinic_or_lab,
          summary: r.summary,
          detailedFindings: findings,
          impression: r.impression || undefined,
          recommendations: r.recommendations || undefined,
          badgeLabel: r.badge_label,
          hasReport: Boolean(r.has_report),
          hasLabResults: Boolean(r.has_lab_results),
          labItems,
          imagingUrl: r.imaging_url || undefined,
          imagingType: r.imaging_type || undefined,
        };
      });

    const doctorSuggestions: DoctorSuggestion[] = suggestionsRows
      .filter((s) => s.patient_id === p.id)
      .map((s) => ({
        id: s.id,
        date: s.date,
        doctorName: s.doctor_name,
        doctorTitle: s.doctor_title,
        category: s.category,
        suggestion: s.suggestion,
        priority: s.priority,
      }));

    const medications: Medication[] = medsRows
      .filter((m) => m.patient_id === p.id)
      .map((m) => ({
        id: m.id,
        name: m.name,
        dosage: m.dosage,
        frequency: m.frequency,
        instructions: m.instructions,
        prescribedBy: m.prescribed_by,
        startDate: m.start_date,
        status: m.status,
      }));

    const uploadedLabTests: UploadedLabTest[] = labsRows
      .filter((l) => l.patient_id === p.id)
      .map((l) => {
        let doctorResponse = undefined;
        try {
          if (l.doctor_response) doctorResponse = JSON.parse(l.doctor_response);
        } catch {}

        return {
          id: l.id,
          patientId: l.patient_id,
          patientName: l.patient_name,
          title: l.title,
          testType: l.test_type,
          dateUploaded: l.date_uploaded,
          labName: l.lab_name,
          patientQuestion: l.patient_question,
          fileName: l.file_name,
          fileSize: l.file_size,
          fileType: l.file_type,
          fileDataUrl: l.file_data_url || undefined,
          status: l.status,
          assignedDoctorId: l.assigned_doctor_id || undefined,
          assignedDoctorName: l.assigned_doctor_name || undefined,
          doctorResponse,
        };
      });

    const videoConsultations: VideoConsultationSession[] = consultRows
      .filter((v) => v.patient_id === p.id)
      .map((v) => {
        let prescriptionsGiven = undefined;
        try {
          if (v.prescriptions_given) prescriptionsGiven = JSON.parse(v.prescriptions_given);
        } catch {}

        return {
          id: v.id,
          patientId: v.patient_id,
          patientName: v.patient_name,
          patientAvatar: v.patient_avatar || undefined,
          doctorId: v.doctor_id,
          doctorName: v.doctor_name,
          doctorSpecialty: v.doctor_specialty || undefined,
          scheduledTime: v.scheduled_time,
          status: v.status,
          roomCode: v.room_code,
          durationMinutes: v.duration_minutes ? Number(v.duration_minutes) : 15,
          chiefComplaint: v.chief_complaint || undefined,
          consultationSummary: v.consultation_summary || undefined,
          prescriptionsGiven,
          telehealthNotes: v.telehealth_notes || undefined,
        };
      });

    return {
      id: p.id,
      pin: p.pin,
      name: p.name,
      dob: p.dob,
      age: Number(p.age),
      gender: p.gender,
      bloodType: p.blood_type,
      status: p.status,
      avatarUrl: p.avatar_url || undefined,
      initials: p.initials || undefined,
      timeSeenToday: p.time_seen_today || undefined,
      phone: p.phone || undefined,
      email: p.email || undefined,
      room: p.room || undefined,
      allergies,
      assignedDoctorId: p.assigned_doctor_id || undefined,
      assignedDoctorName: p.assigned_doctor_name || undefined,
      vitals: vitalsObj,
      vitalsHistory,
      clinicalHistory,
      doctorSuggestions,
      medications,
      doctorObservations,
      uploadedLabTests,
      videoConsultations,
    };
  });
}

export async function getPatientById(id: string): Promise<Patient | null> {
  const all = await getAllPatients();
  return all.find((p) => p.id.toLowerCase() === id.toLowerCase()) || null;
}

export async function createPatient(patient: Patient): Promise<Patient> {
  await insertFullPatient(patient);
  return patient;
}

export async function updatePatient(id: string, updates: Partial<Patient>): Promise<Patient | null> {
  const existing = await getPatientById(id);
  if (!existing) return null;

  const merged: Patient = { ...existing, ...updates };

  await executeCommand(
    `UPDATE patients SET
      name = ?, pin = ?, dob = ?, age = ?, gender = ?, blood_type = ?,
      status = ?, phone = ?, email = ?, room = ?, allergies = ?,
      assigned_doctor_id = ?, assigned_doctor_name = ?, vitals = ?,
      doctor_observations = ?
    WHERE id = ?`,
    [
      merged.name,
      merged.pin || '1234',
      merged.dob,
      merged.age,
      merged.gender,
      merged.bloodType,
      merged.status,
      merged.phone || '',
      merged.email || '',
      merged.room || '',
      JSON.stringify(merged.allergies || []),
      merged.assignedDoctorId || 'doc-1',
      merged.assignedDoctorName || 'Dr. Rajesh Sharma',
      JSON.stringify(merged.vitals),
      JSON.stringify(merged.doctorObservations || []),
      id,
    ]
  );

  return getPatientById(id);
}

export async function addVitalTrendPoint(patientId: string, vitals: Vitals, trendPoint?: VitalTrendPoint): Promise<Patient | null> {
  // Update current vitals in patient table
  await executeCommand('UPDATE patients SET vitals = ? WHERE id = ?', [
    JSON.stringify(vitals),
    patientId,
  ]);

  // Insert trend history point
  if (trendPoint) {
    const vId = trendPoint.id || `vh-${patientId}-${Date.now()}`;
    await executeCommand(
      `INSERT INTO vital_trends (
        id, patient_id, date, time, systolic, diastolic, heart_rate, spo2, weight, tag, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        vId,
        patientId,
        trendPoint.date,
        trendPoint.time || '',
        trendPoint.systolic,
        trendPoint.diastolic,
        trendPoint.heartRate,
        trendPoint.spO2 || 98,
        trendPoint.weight || 70,
        trendPoint.tag || '',
        trendPoint.notes || '',
      ]
    );
  }

  return getPatientById(patientId);
}

export async function addClinicalRecord(patientId: string, record: ClinicalRecord): Promise<ClinicalRecord> {
  await executeCommand(
    `INSERT INTO clinical_records (
      id, patient_id, type, title, date, doctor, clinic_or_lab,
      summary, detailed_findings, impression, recommendations,
      badge_label, has_report, has_lab_results, lab_items,
      imaging_url, imaging_type
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      record.id,
      patientId,
      record.type,
      record.title,
      record.date,
      record.doctor,
      record.clinicOrLab,
      record.summary,
      JSON.stringify(record.detailedFindings || []),
      record.impression || '',
      record.recommendations || '',
      record.badgeLabel,
      record.hasReport ? 1 : 0,
      record.hasLabResults ? 1 : 0,
      JSON.stringify(record.labItems || []),
      record.imagingUrl || '',
      record.imagingType || '',
    ]
  );
  return record;
}

export async function addDoctorSuggestion(patientId: string, suggestion: DoctorSuggestion): Promise<DoctorSuggestion> {
  await executeCommand(
    `INSERT INTO doctor_suggestions (
      id, patient_id, date, doctor_name, doctor_title, category, suggestion, priority
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      suggestion.id,
      patientId,
      suggestion.date,
      suggestion.doctorName,
      suggestion.doctorTitle,
      suggestion.category,
      suggestion.suggestion,
      suggestion.priority,
    ]
  );
  return suggestion;
}

export async function addMedication(patientId: string, medication: Medication): Promise<Medication> {
  await executeCommand(
    `INSERT INTO medications (
      id, patient_id, name, dosage, frequency, instructions, prescribed_by, start_date, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      medication.id,
      patientId,
      medication.name,
      medication.dosage,
      medication.frequency,
      medication.instructions,
      medication.prescribedBy,
      medication.startDate,
      medication.status,
    ]
  );
  return medication;
}

export async function addUploadedLabTest(labTest: UploadedLabTest): Promise<UploadedLabTest> {
  await executeCommand(
    `INSERT INTO uploaded_lab_tests (
      id, patient_id, patient_name, title, test_type, date_uploaded,
      lab_name, patient_question, file_name, file_size, file_type,
      file_data_url, status, assigned_doctor_id, assigned_doctor_name,
      doctor_response
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      labTest.id,
      labTest.patientId,
      labTest.patientName,
      labTest.title,
      labTest.testType,
      labTest.dateUploaded,
      labTest.labName,
      labTest.patientQuestion,
      labTest.fileName,
      labTest.fileSize,
      labTest.fileType,
      labTest.fileDataUrl || '',
      labTest.status,
      labTest.assignedDoctorId || '',
      labTest.assignedDoctorName || '',
      JSON.stringify(labTest.doctorResponse || null),
    ]
  );
  return labTest;
}

export async function updateLabTestReview(
  id: string,
  doctorResponse: NonNullable<UploadedLabTest['doctorResponse']>
): Promise<void> {
  await executeCommand(
    `UPDATE uploaded_lab_tests SET
      status = 'Reviewed',
      doctor_response = ?
    WHERE id = ?`,
    [JSON.stringify(doctorResponse), id]
  );
}

export async function createVideoConsultation(session: VideoConsultationSession): Promise<VideoConsultationSession> {
  await executeCommand(
    `INSERT INTO video_consultations (
      id, patient_id, patient_name, patient_avatar, doctor_id, doctor_name,
      doctor_specialty, scheduled_time, status, room_code, duration_minutes,
      chief_complaint, consultation_summary, prescriptions_given, telehealth_notes
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      session.id,
      session.patientId,
      session.patientName,
      session.patientAvatar || '',
      session.doctorId,
      session.doctorName,
      session.doctorSpecialty || '',
      session.scheduledTime,
      session.status,
      session.roomCode,
      session.durationMinutes || 15,
      session.chiefComplaint || '',
      session.consultationSummary || '',
      JSON.stringify(session.prescriptionsGiven || []),
      session.telehealthNotes || '',
    ]
  );
  return session;
}

export async function updateVideoConsultation(
  id: string,
  updates: Partial<VideoConsultationSession>
): Promise<void> {
  const existing = await executeQuery<any>('SELECT * FROM video_consultations WHERE id = ?', [id]);
  if (existing.length === 0) return;

  const current = existing[0];
  const newStatus = updates.status || current.status;
  const notes = updates.telehealthNotes !== undefined ? updates.telehealthNotes : current.telehealth_notes;
  const summary = updates.consultationSummary !== undefined ? updates.consultationSummary : current.consultation_summary;

  await executeCommand(
    `UPDATE video_consultations SET
      status = ?,
      telehealth_notes = ?,
      consultation_summary = ?
    WHERE id = ?`,
    [newStatus, notes || '', summary || '', id]
  );
}
