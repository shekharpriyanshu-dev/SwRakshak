import { Router, Request, Response } from 'express';
import {
  addClinicalRecord,
  addDoctorSuggestion,
  addMedication,
  addUploadedLabTest,
  addVitalTrendPoint,
  createPatient,
  createVideoConsultation,
  getAllDoctors,
  getAllPatients,
  getDbType,
  getPatientById,
  saveDoctor,
  updateLabTestReview,
  updatePatient,
  updateVideoConsultation,
} from './db.js';

const router = Router();

// Health check & DB Status
router.get('/health', async (req: Request, res: Response) => {
  try {
    const dbType = getDbType();
    res.json({
      status: 'ok',
      service: 'SwRakshak Healthcare API',
      database: dbType,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// ----------------------------------------------------------------------
// DOCTOR APIS
// ----------------------------------------------------------------------

// GET /api/doctors - List all registered physicians
router.get('/doctors', async (req: Request, res: Response) => {
  try {
    const doctors = await getAllDoctors();
    res.json({ success: true, count: doctors.length, data: doctors });
  } catch (error: any) {
    console.error('Error fetching doctors:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/doctors - Create or update a physician profile
router.post('/doctors', async (req: Request, res: Response) => {
  try {
    const doctorData = req.body;
    if (!doctorData.id || !doctorData.name) {
      return res.status(400).json({ success: false, message: 'Doctor id and name are required.' });
    }
    const saved = await saveDoctor(doctorData);
    res.status(201).json({ success: true, data: saved });
  } catch (error: any) {
    console.error('Error saving doctor:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ----------------------------------------------------------------------
// PATIENT APIS
// ----------------------------------------------------------------------

// GET /api/patients - List all patients with nested clinical records & vitals
router.get('/patients', async (req: Request, res: Response) => {
  try {
    const patients = await getAllPatients();
    res.json({ success: true, count: patients.length, data: patients });
  } catch (error: any) {
    console.error('Error fetching patients:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/patients/:id - Retrieve single patient by ID
router.get('/patients/:id', async (req: Request, res: Response) => {
  try {
    const patient = await getPatientById(req.params.id);
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found.' });
    }
    res.json({ success: true, data: patient });
  } catch (error: any) {
    console.error('Error fetching patient:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/patients - Register new patient (enrolled by attending physician)
router.post('/patients', async (req: Request, res: Response) => {
  try {
    const patientData = req.body;
    if (!patientData.id || !patientData.name) {
      return res.status(400).json({ success: false, message: 'Patient ID and name are required.' });
    }
    const created = await createPatient(patientData);
    res.status(201).json({ success: true, data: created });
  } catch (error: any) {
    console.error('Error creating patient:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/patients/:id - Update patient profile / observations
router.put('/patients/:id', async (req: Request, res: Response) => {
  try {
    const updated = await updatePatient(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Patient not found.' });
    }
    res.json({ success: true, data: updated });
  } catch (error: any) {
    console.error('Error updating patient:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/patients/:id/vitals - Record new vitals reading & add to trend history
router.post('/patients/:id/vitals', async (req: Request, res: Response) => {
  try {
    const { vitals, trendPoint } = req.body;
    if (!vitals) {
      return res.status(400).json({ success: false, message: 'Vitals data is required.' });
    }
    const updated = await addVitalTrendPoint(req.params.id, vitals, trendPoint);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Patient not found.' });
    }
    res.json({ success: true, data: updated });
  } catch (error: any) {
    console.error('Error adding vitals:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/patients/:id/records - Add clinical record (MRI, Blood, Consultation, etc.)
router.post('/patients/:id/records', async (req: Request, res: Response) => {
  try {
    const record = req.body;
    if (!record.id || !record.title || !record.type) {
      return res.status(400).json({ success: false, message: 'Record id, title, and type are required.' });
    }
    const added = await addClinicalRecord(req.params.id, record);
    res.status(201).json({ success: true, data: added });
  } catch (error: any) {
    console.error('Error adding record:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/patients/:id/suggestions - Add doctor suggestion / care plan
router.post('/patients/:id/suggestions', async (req: Request, res: Response) => {
  try {
    const suggestion = req.body;
    if (!suggestion.id || !suggestion.suggestion) {
      return res.status(400).json({ success: false, message: 'Suggestion id and content are required.' });
    }
    const added = await addDoctorSuggestion(req.params.id, suggestion);
    res.status(201).json({ success: true, data: added });
  } catch (error: any) {
    console.error('Error adding suggestion:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/patients/:id/medications - Add medication / prescription
router.post('/patients/:id/medications', async (req: Request, res: Response) => {
  try {
    const medication = req.body;
    if (!medication.id || !medication.name) {
      return res.status(400).json({ success: false, message: 'Medication id and name are required.' });
    }
    const added = await addMedication(req.params.id, medication);
    res.status(201).json({ success: true, data: added });
  } catch (error: any) {
    console.error('Error adding medication:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/patients/:id/lab-tests - Patient uploads external lab report
router.post('/patients/:id/lab-tests', async (req: Request, res: Response) => {
  try {
    const labTest = req.body;
    if (!labTest.id || !labTest.title) {
      return res.status(400).json({ success: false, message: 'Lab test id and title are required.' });
    }
    labTest.patientId = req.params.id;
    const added = await addUploadedLabTest(labTest);
    res.status(201).json({ success: true, data: added });
  } catch (error: any) {
    console.error('Error adding lab test:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/lab-tests/:id/review - Doctor reviews lab test & provides assessment
router.put('/lab-tests/:id/review', async (req: Request, res: Response) => {
  try {
    const { doctorResponse } = req.body;
    if (!doctorResponse) {
      return res.status(400).json({ success: false, message: 'doctorResponse object is required.' });
    }
    await updateLabTestReview(req.params.id, doctorResponse);
    res.json({ success: true, message: 'Lab test reviewed successfully.' });
  } catch (error: any) {
    console.error('Error reviewing lab test:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/video-consultations - Schedule video consultation
router.post('/video-consultations', async (req: Request, res: Response) => {
  try {
    const session = req.body;
    if (!session.id || !session.patientId || !session.doctorId) {
      return res.status(400).json({ success: false, message: 'Session id, patientId, and doctorId are required.' });
    }
    const created = await createVideoConsultation(session);
    res.status(201).json({ success: true, data: created });
  } catch (error: any) {
    console.error('Error creating video consultation:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/video-consultations/:id - Update video consultation status / notes
router.put('/video-consultations/:id', async (req: Request, res: Response) => {
  try {
    await updateVideoConsultation(req.params.id, req.body);
    res.json({ success: true, message: 'Video consultation updated successfully.' });
  } catch (error: any) {
    console.error('Error updating video consultation:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
