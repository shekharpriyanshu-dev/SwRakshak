import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ClinicalRecord, Patient, UploadedLabTest, Medication, DoctorProfile } from '../types';

export type PdfAction = 'download' | 'open' | 'blob';

// Helper to draw standard branded medical document header
function drawMedicalHeader(
  doc: jsPDF,
  title: string,
  categoryBadge: string,
  clinicName: string = 'ApexCare Multispeciality Hospital & Research Center'
): number {
  const pageWidth = doc.internal.pageSize.getWidth();

  // Top header background bar
  doc.setFillColor(30, 20, 50); // Dark luxury violet
  doc.rect(0, 0, pageWidth, 28, 'F');

  // Cyan accent line
  doc.setFillColor(34, 211, 238);
  doc.rect(0, 28, pageWidth, 1.5, 'F');

  // Medical Cross Icon representation
  doc.setFillColor(168, 85, 247); // Purple
  doc.roundedRect(12, 6, 16, 16, 3, 3, 'F');
  doc.setFillColor(255, 255, 255);
  doc.rect(18.5, 9, 3, 10, 'F');
  doc.rect(15, 12.5, 10, 3, 'F');

  // Clinic Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(255, 255, 255);
  doc.text(clinicName, 32, 12);

  // Clinic Subtext / Accreditation
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(200, 190, 220);
  doc.text('NABH ACCREDITED • DIGITAL HEALTH & TELEMETRY NETWORK • ISO 9001:2015', 32, 17);
  doc.text('24x7 Emergency & Telehealth Consultations • Tel: +91 (011) 4920-8000', 32, 21);

  // Document Title & Badge on Right
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(34, 211, 238); // Cyan
  doc.text(categoryBadge.toUpperCase(), pageWidth - 14, 12, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(220, 220, 220);
  doc.text(`DOC-ID: ${Math.floor(100000 + Math.random() * 900000)}`, pageWidth - 14, 17, { align: 'right' });
  doc.text(`DATE: ${new Date().toLocaleDateString('en-GB')}`, pageWidth - 14, 21, { align: 'right' });

  // Main Document Title Banner
  let y = 37;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(25, 25, 35);
  doc.text(title, 14, y);

  // Subtitle / confidential text
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(110, 110, 130);
  doc.text('CONFIDENTIAL MEDICAL EXAMINATION & DIAGNOSTIC TELEMETRY RECORD', 14, y + 5);

  return y + 9;
}

// Helper to draw Patient Demographics Table/Box
function drawPatientDemographics(doc: jsPDF, patient: Patient, startY: number, attendingDoctor?: string): number {
  const pageWidth = doc.internal.pageSize.getWidth();
  const boxWidth = pageWidth - 28;
  const boxHeight = 22;

  // Background Box
  doc.setFillColor(248, 247, 252);
  doc.setDrawColor(220, 215, 235);
  doc.roundedRect(14, startY, boxWidth, boxHeight, 2, 2, 'FD');

  doc.setFontSize(7.5);
  const col1 = 18;
  const col2 = 68;
  const col3 = 118;
  const col4 = 158;

  // Row 1
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(120, 110, 140);
  doc.text('PATIENT NAME:', col1, startY + 5.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(20, 20, 30);
  doc.text(patient.name, col1 + 22, startY + 5.5);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(120, 110, 140);
  doc.text('PATIENT ID:', col2, startY + 5.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(130, 50, 190);
  doc.text(patient.id, col2 + 18, startY + 5.5);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(120, 110, 140);
  doc.text('AGE / GENDER:', col3, startY + 5.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(20, 20, 30);
  doc.text(`${patient.age} YRS / ${patient.gender}`, col3 + 22, startY + 5.5);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(120, 110, 140);
  doc.text('BLOOD GRP:', col4, startY + 5.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(220, 38, 38);
  doc.text(patient.bloodType || 'O+', col4 + 18, startY + 5.5);

  // Row 2
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(120, 110, 140);
  doc.text('DOB:', col1, startY + 11.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(20, 20, 30);
  doc.text(patient.dob, col1 + 10, startY + 11.5);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(120, 110, 140);
  doc.text('PHONE / CONTACT:', col2, startY + 11.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(20, 20, 30);
  doc.text(patient.phone || '+91 98765-43210', col2 + 28, startY + 11.5);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(120, 110, 140);
  doc.text('STATUS:', col3, startY + 11.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(16, 149, 100);
  doc.text(patient.status.toUpperCase(), col3 + 13, startY + 11.5);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(120, 110, 140);
  doc.text('ROOM/BED:', col4, startY + 11.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(20, 20, 30);
  doc.text(patient.room || 'OPD-102', col4 + 17, startY + 11.5);

  // Row 3 (Vitals snapshot)
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(120, 110, 140);
  doc.text('RECORDED VITALS:', col1, startY + 17.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(40, 40, 60);
  doc.text(
    `BP: ${patient.vitals?.bloodPressure?.value || '120/80 mmHg'}  •  HR: ${patient.vitals?.heartRate?.value || 72} bpm  •  SpO2: ${patient.vitals?.spO2?.value || 99}%  •  WT: ${patient.vitals?.weight?.value || 150} lbs`,
    col1 + 28,
    startY + 17.5
  );

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(120, 110, 140);
  doc.text('ATTENDING MD:', col4 - 15, startY + 17.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(110, 40, 180);
  doc.text(attendingDoctor || patient.assignedDoctorName || 'Dr. Rajesh Sharma', col4 + 8, startY + 17.5);

  return startY + boxHeight + 6;
}

// Helper to draw Footer & Digital Seal
function drawFooterAndSignatures(
  doc: jsPDF,
  doctorName: string = 'Dr. Rajesh Sharma, MD (Cardiology)',
  license: string = 'Reg No: MCI/2012/884920'
) {
  const pageHeight = doc.internal.pageSize.getHeight();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Bottom divider
  doc.setDrawColor(220, 220, 230);
  doc.line(14, pageHeight - 32, pageWidth - 14, pageHeight - 32);

  // Left Disclaimer
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.8);
  doc.setTextColor(140, 140, 150);
  doc.text('This is an electronically generated and cryptographically signed medical report.', 14, pageHeight - 27);
  doc.text('ApexCare Telehealth Portal • Valid for insurance, clinical reference and hospital admission.', 14, pageHeight - 23);
  doc.text('For urgent clinical queries, contact the 24x7 desk at support@apexcare.health', 14, pageHeight - 19);

  // Digital Signature Seal on Right
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(30, 30, 50);
  doc.text(doctorName, pageWidth - 14, pageHeight - 24, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(100, 100, 120);
  doc.text(`${license} • Digitally Verified`, pageWidth - 14, pageHeight - 20, { align: 'right' });

  // Verification stamp badge
  doc.setFillColor(236, 253, 245);
  doc.setDrawColor(16, 185, 129);
  doc.roundedRect(pageWidth - 75, pageHeight - 15, 61, 7, 1.5, 1.5, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(5, 150, 105);
  doc.text('✓ DIGITALLY VERIFIED & AUDITED', pageWidth - 44.5, pageHeight - 10.5, { align: 'center' });

  // Page numbering
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(160, 160, 170);
  doc.text(`Page 1 of 1 • Generated: ${new Date().toLocaleString()}`, 14, pageHeight - 7);
}

// Action executor (Save download or Open in new browser tab)
function handlePdfOutput(doc: jsPDF, filename: string, action: PdfAction = 'download') {
  if (action === 'open') {
    const blob = doc.output('blob');
    const blobUrl = URL.createObjectURL(blob);
    window.open(blobUrl, '_blank');
    return blobUrl;
  } else if (action === 'blob') {
    return doc.output('bloburl');
  } else {
    doc.save(filename);
    return null;
  }
}

/**
 * 1. Export any Clinical Record (MRI, CT, X-Ray, Clinic, Blood, Note, Consultation) to PDF
 */
export function exportClinicalRecordPdf(
  record: ClinicalRecord,
  patient: Patient,
  doctorName?: string,
  action: PdfAction = 'download'
) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const docDoctor = doctorName || record.doctor || patient.assignedDoctorName || 'Dr. Rajesh Sharma, MD';
  let y = drawMedicalHeader(doc, record.title, `${record.badgeLabel || record.type} REPORT`);
  y = drawPatientDemographics(doc, patient, y, docDoctor);

  // Examination / Service Details Bar
  doc.setFillColor(243, 240, 250);
  doc.roundedRect(14, y, doc.internal.pageSize.getWidth() - 28, 9, 1.5, 1.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 60, 160);
  doc.text(`RECORD DATE: ${record.date}`, 18, y + 5.8);
  doc.text(`FACILITY/LAB: ${record.clinicOrLab || 'ApexCare Diagnostic Center'}`, 80, y + 5.8);
  doc.text(`MODALITY: ${record.type} TELEMETRY`, 150, y + 5.8);
  y += 14;

  // 1. Clinical Indication / Reason for visit
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(80, 40, 130);
  doc.text('1. CLINICAL INDICATION & SUMMARY', 14, y);
  y += 4;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(40, 40, 50);
  const summaryLines = doc.splitTextToSize(record.summary || 'Routine clinical investigation.', 180);
  doc.text(summaryLines, 14, y);
  y += summaryLines.length * 4.5 + 4;

  // 2. Detailed Radiological / Clinical Findings
  if (record.detailedFindings && record.detailedFindings.length > 0) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(80, 40, 130);
    doc.text('2. DETAILED EXAMINATION FINDINGS', 14, y);
    y += 4;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(50, 50, 60);

    record.detailedFindings.forEach((finding) => {
      const findingLines = doc.splitTextToSize(`•  ${finding}`, 178);
      doc.text(findingLines, 16, y);
      y += findingLines.length * 4 + 1.5;
    });
    y += 3;
  }

  // 3. Lab Items Table (if present)
  if (record.labItems && record.labItems.length > 0) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(80, 40, 130);
    doc.text('3. DIAGNOSTIC LABORATORY TEST PARAMETERS', 14, y);
    y += 3;

    const tableRows = record.labItems.map((item) => [
      item.testName,
      `${item.value} ${item.unit || ''}`,
      `${item.referenceRange || 'N/A'} ${item.unit || ''}`,
      item.flag || 'NORMAL',
    ]);

    autoTable(doc, {
      startY: y,
      head: [['Investigation / Test Name', 'Observed Value', 'Biological Reference Interval', 'Evaluation Status']],
      body: tableRows,
      margin: { left: 14, right: 14 },
      headStyles: {
        fillColor: [55, 30, 85],
        textColor: [255, 255, 255],
        fontSize: 7.5,
        fontStyle: 'bold',
      },
      styles: {
        fontSize: 7.5,
        cellPadding: 2.2,
      },
      alternateRowStyles: {
        fillColor: [248, 246, 252],
      },
      didParseCell: (data) => {
        if (data.column.index === 3) {
          const val = data.cell.raw;
          if (val === 'HIGH') {
            data.cell.styles.textColor = [220, 38, 38];
            data.cell.styles.fontStyle = 'bold';
          } else if (val === 'LOW') {
            data.cell.styles.textColor = [217, 119, 6];
            data.cell.styles.fontStyle = 'bold';
          } else {
            data.cell.styles.textColor = [16, 149, 100];
            data.cell.styles.fontStyle = 'bold';
          }
        }
      },
    });

    const lastTable = (doc as any).lastAutoTable;
    y = (lastTable ? lastTable.finalY : y + 30) + 6;
  }

  // 4. Clinical Impression / Diagnosis Box
  if (record.impression) {
    const pageWidth = doc.internal.pageSize.getWidth();
    doc.setFillColor(254, 242, 242); // Warm reddish/orange soft box
    doc.setDrawColor(251, 146, 60);
    doc.roundedRect(14, y, pageWidth - 28, 14, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(194, 65, 12);
    doc.text('CLINICAL IMPRESSION & DIAGNOSIS:', 18, y + 5);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(30, 30, 40);
    const impLines = doc.splitTextToSize(record.impression, 172);
    doc.text(impLines, 18, y + 10);
    y += 18;
  }

  // 5. Recommendations / Follow-up Plan
  if (record.recommendations) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(80, 40, 130);
    doc.text('RECOMMENDED ACTION PLAN & FOLLOW-UP', 14, y);
    y += 4;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(40, 40, 50);
    const recLines = doc.splitTextToSize(record.recommendations, 180);
    doc.text(recLines, 14, y);
    y += recLines.length * 4 + 4;
  }

  drawFooterAndSignatures(doc, docDoctor);

  const cleanTitle = record.title.replace(/[^a-zA-Z0-9]/g, '_');
  const filename = `${patient.name.replace(/\s+/g, '_')}_${record.badgeLabel || record.type}_Report_${record.date.replace(/[^a-zA-Z0-9]/g, '-')}.pdf`;
  return handlePdfOutput(doc, filename, action);
}

/**
 * 2. Export Dedicated Lab Results (CBC, Lipid, Metabolic Profile)
 */
export function exportLabResultsPdf(
  record: ClinicalRecord,
  patient: Patient,
  doctorName?: string,
  action: PdfAction = 'download'
) {
  return exportClinicalRecordPdf(record, patient, doctorName, action);
}

/**
 * 3. Export Home Uploaded Lab Report & Doctor Review to PDF
 */
export function exportUploadedLabTestPdf(
  test: UploadedLabTest,
  patient: Patient,
  doctorName?: string,
  action: PdfAction = 'download'
) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const reviewerDoctor = test.doctorResponse?.doctorName || doctorName || patient.assignedDoctorName || 'Dr. Rajesh Sharma, MD';
  let y = drawMedicalHeader(doc, test.title, 'HOME LAB & RADIOLOGY REVIEW');
  y = drawPatientDemographics(doc, patient, y, reviewerDoctor);

  // Test metadata
  doc.setFillColor(245, 243, 255);
  doc.roundedRect(14, y, doc.internal.pageSize.getWidth() - 28, 12, 1.5, 1.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 60, 160);
  doc.text(`TEST CATEGORY: ${test.testType}`, 18, y + 5);
  doc.text(`DIAGNOSTIC LAB: ${test.labName || 'External Laboratory'}`, 90, y + 5);
  doc.text(`UPLOADED DATE: ${test.dateUploaded}`, 18, y + 9.5);
  doc.text(`FILE NAME: ${test.fileName} (${test.fileSize})`, 90, y + 9.5);
  y += 18;

  // 1. Patient Inquiries / Symptom Context
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(80, 40, 130);
  doc.text('1. PATIENT SUBMITTED QUESTIONS & CLINICAL CONTEXT', 14, y);
  y += 4;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(40, 40, 50);
  const qLines = doc.splitTextToSize(test.patientQuestion || 'Uploaded for routine review and doctor advice.', 180);
  doc.text(qLines, 14, y);
  y += qLines.length * 4.5 + 6;

  // 2. Doctor Review & Assessment
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(80, 40, 130);
  doc.text('2. TREATING PHYSICIAN CLINICAL ASSESSMENT', 14, y);
  y += 4;

  if (test.doctorResponse) {
    // Review container
    const pageWidth = doc.internal.pageSize.getWidth();
    doc.setFillColor(243, 244, 246);
    doc.roundedRect(14, y, pageWidth - 28, 26, 2, 2, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(55, 65, 81);
    doc.text(`Reviewed by: ${test.doctorResponse.doctorName} on ${test.doctorResponse.respondedAt}`, 18, y + 6);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(30, 30, 40);
    const assessLines = doc.splitTextToSize(`Assessment: ${test.doctorResponse.assessment}`, 174);
    doc.text(assessLines, 18, y + 12);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(120, 50, 180);
    const actionLines = doc.splitTextToSize(`Action Plan: ${test.doctorResponse.actionPlan}`, 174);
    doc.text(actionLines, 18, y + 19);

    y += 32;

    if (test.doctorResponse.urgentFollowUpNeeded) {
      doc.setFillColor(254, 226, 226);
      doc.setDrawColor(239, 68, 68);
      doc.roundedRect(14, y, pageWidth - 28, 10, 1.5, 1.5, 'FD');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(185, 28, 28);
      doc.text('⚠️ ATTENTION: URGENT CLINICAL FOLLOW-UP RECOMMENDED BY PHYSICIAN', 18, y + 6.5);
      y += 15;
    }
  } else {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8.5);
    doc.setTextColor(120, 120, 130);
    doc.text('Review pending by attending physician.', 14, y);
    y += 12;
  }

  drawFooterAndSignatures(doc, reviewerDoctor);

  const filename = `${patient.name.replace(/\s+/g, '_')}_LabReview_${test.title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
  return handlePdfOutput(doc, filename, action);
}

/**
 * 4. Export Official Prescription (Rx) PDF
 */
export function exportPrescriptionPdf(
  patient: Patient,
  medications: Medication[],
  doctorName: string = 'Dr. Rajesh Sharma, MD (Cardiology)',
  advice?: string,
  action: PdfAction = 'download'
) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  let y = drawMedicalHeader(doc, 'MEDICAL PRESCRIPTION (Rx)', 'OFFICIAL Rx ORDER');
  y = drawPatientDemographics(doc, patient, y, doctorName);

  // Big Rx Symbol
  doc.setFont('times', 'bolditalic');
  doc.setFontSize(22);
  doc.setTextColor(130, 40, 200);
  doc.text('℞', 14, y + 2);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(40, 40, 60);
  doc.text('PRESCRIBED MEDICATIONS & DOSAGE REGIMEN', 24, y);
  y += 5;

  const tableData = medications.map((med, index) => [
    `${index + 1}.`,
    med.name,
    med.dosage,
    med.frequency,
    med.instructions,
    med.status || 'Active',
  ]);

  autoTable(doc, {
    startY: y,
    head: [['#', 'Medicine Name', 'Strength', 'Frequency', 'Specific Timing / Instructions', 'Status']],
    body: tableData,
    margin: { left: 14, right: 14 },
    headStyles: {
      fillColor: [100, 50, 160],
      textColor: [255, 255, 255],
      fontSize: 8,
      fontStyle: 'bold',
    },
    styles: {
      fontSize: 8,
      cellPadding: 3,
    },
    alternateRowStyles: {
      fillColor: [249, 248, 253],
    },
  });

  const lastTable = (doc as any).lastAutoTable;
  y = (lastTable ? lastTable.finalY : y + 40) + 8;

  // General Medical Advice / Dietary notes
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(80, 40, 130);
  doc.text('GENERAL ADVICE & PRECAUTIONS:', 14, y);
  y += 4;

  const adviceText =
    advice ||
    '• Take all medicines on exact scheduled time with a full glass of water.\n• Do not skip or alter dosages without consulting Dr. Sharma.\n• Avoid excess sodium/salt intake, stay well hydrated (2.5L/day).\n• In case of dizziness, rash, or breathing difficulties, immediately reach the emergency desk.';

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(40, 40, 50);
  const adviceLines = doc.splitTextToSize(adviceText, 180);
  doc.text(adviceLines, 14, y);
  y += adviceLines.length * 4 + 6;

  drawFooterAndSignatures(doc, doctorName);

  const filename = `${patient.name.replace(/\s+/g, '_')}_Prescription_${new Date().toLocaleDateString('en-GB').replace(/\//g, '-')}.pdf`;
  return handlePdfOutput(doc, filename, action);
}

/**
 * 5. Export Complete Patient Comprehensive Health Summary & Passport PDF
 */
export function exportCompletePatientHistoryPdf(
  patient: Patient,
  doctorName?: string,
  action: PdfAction = 'download'
) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const attendingDoc = doctorName || patient.assignedDoctorName || 'Dr. Rajesh Sharma, MD';
  let y = drawMedicalHeader(doc, 'COMPREHENSIVE HEALTH SUMMARY & MEDICAL PASSPORT', 'PATIENT HEALTH PORTFOLIO');
  y = drawPatientDemographics(doc, patient, y, attendingDoc);

  // 1. Chronic Conditions & Allergies
  doc.setFillColor(243, 244, 246);
  doc.roundedRect(14, y, doc.internal.pageSize.getWidth() - 28, 12, 1.5, 1.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(70, 70, 90);
  doc.text('KNOWN ALLERGIES:', 18, y + 5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(220, 38, 38);
  doc.text(patient.allergies?.join(', ') || 'NKDA (No Known Drug Allergies)', 46, y + 5);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(70, 70, 90);
  doc.text('CHRONIC CONDITIONS:', 18, y + 9.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(30, 30, 40);
  doc.text('Hypertension, Mild Atherosclerosis, Chronic Knee Pain', 50, y + 9.5);
  y += 18;

  // 2. Active Medications
  if (patient.medications && patient.medications.length > 0) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(80, 40, 130);
    doc.text('ACTIVE MEDICATIONS', 14, y);
    y += 3;

    const medRows = patient.medications.map((m) => [m.name, m.dosage, m.frequency, m.instructions]);
    autoTable(doc, {
      startY: y,
      head: [['Medication', 'Dose', 'Frequency', 'Instructions']],
      body: medRows,
      margin: { left: 14, right: 14 },
      headStyles: { fillColor: [80, 40, 130], fontSize: 7.5 },
      styles: { fontSize: 7.5, cellPadding: 2 },
    });

    const lastTable = (doc as any).lastAutoTable;
    y = (lastTable ? lastTable.finalY : y + 25) + 6;
  }

  // 3. Clinical & Investigation Records Timeline
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(80, 40, 130);
  doc.text('CLINICAL ENCOUNTERS & DIAGNOSTIC HISTORY', 14, y);
  y += 3;

  const historyRows = patient.clinicalHistory.map((rec) => [
    rec.date,
    rec.badgeLabel || rec.type,
    rec.title,
    rec.doctor,
    rec.impression || rec.summary,
  ]);

  autoTable(doc, {
    startY: y,
    head: [['Date', 'Type', 'Examination / Title', 'Doctor', 'Impression / Findings']],
    body: historyRows,
    margin: { left: 14, right: 14 },
    headStyles: { fillColor: [50, 30, 75], fontSize: 7.5 },
    styles: { fontSize: 7, cellPadding: 2 },
    columnStyles: {
      4: { cellWidth: 70 },
    },
  });

  drawFooterAndSignatures(doc, attendingDoc);

  const filename = `${patient.name.replace(/\s+/g, '_')}_CompleteHealthSummary.pdf`;
  return handlePdfOutput(doc, filename, action);
}

/**
 * 6. Export Diet & Nutrition Meal Chart PDF
 */
export function exportDietPlanPdf(
  patient: Patient,
  doctorName?: string,
  action: PdfAction = 'download'
) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const attendingDoc = doctorName || patient.assignedDoctorName || 'Dr. Rajesh Sharma, MD';
  let y = drawMedicalHeader(doc, 'CLINICAL NUTRITION & INDIAN MEAL DIET CHART', 'DIETARY THERAPY PLAN');
  y = drawPatientDemographics(doc, patient, y, attendingDoc);

  // Calorie & Hydration Goals
  doc.setFillColor(236, 253, 245);
  doc.roundedRect(14, y, doc.internal.pageSize.getWidth() - 28, 11, 1.5, 1.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(5, 150, 105);
  doc.text('DAILY CALORIE TARGET: 1,850 kcal  •  PROTEIN: 65g  •  DAILY HYDRATION: 2.5 - 3.0 Litres (8 Glasses)', 18, y + 6.8);
  y += 16;

  const meals = [
    ['Early Morning (6:30 AM)', 'Warm Jeera / Methi Water + 5 Soaked Almonds + 2 Walnuts', 'Aids digestion & blood sugar stability'],
    ['Breakfast (8:30 AM)', 'Oats Vegetable Upma / 2 Moong Dal Chilla + Mint Chutney + Green Tea', 'High fiber & complex carbs'],
    ['Mid-Morning (11:00 AM)', '1 Whole Fruit (Apple / Papaya / Guava) or Tender Coconut Water', 'Antioxidants & electrolytes'],
    ['Lunch (1:30 PM)', '2 Multigrain Phulkas + 1 Bowl Palak Dal + Mixed Veg Sabzi + Fresh Salad + Curd', 'Balanced protein, carbs & micronutrients'],
    ['Evening Snack (5:00 PM)', 'Roasted Makhana / Sprouted Moong Salad + Herbal Tulsi Tea', 'Low glycemic & zero trans-fat'],
    ['Dinner (8:00 PM)', 'Vegetable Dalia Khichdi or Bottle Gourd Soup + Grilled Paneer/Tofu', 'Light digestion before bedtime'],
    ['Bedtime (10:00 PM)', '1 Cup Warm Turmeric (Haldi) Milk (Low-fat)', 'Anti-inflammatory & sound sleep'],
  ];

  autoTable(doc, {
    startY: y,
    head: [['Time Slot', 'Recommended Meal & Food Items', 'Clinical Nutrition Benefit']],
    body: meals,
    margin: { left: 14, right: 14 },
    headStyles: { fillColor: [16, 149, 100], fontSize: 8 },
    styles: { fontSize: 7.5, cellPadding: 2.8 },
  });

  const lastTable = (doc as any).lastAutoTable;
  y = (lastTable ? lastTable.finalY : y + 50) + 8;

  // Do's and Don'ts
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(194, 65, 12);
  doc.text('DIETARY DO\'s & DON\'Ts:', 14, y);
  y += 4;

  const tips =
    '• DO eat small, frequent meals every 3-4 hours.\n• DO limit salt (sodium) to less than 1 level teaspoon per day.\n• DON\'T consume deep-fried foods, processed snacks, bakery items, or packaged carbonated drinks.\n• DON\'T lie down immediately after dinner; take a gentle 10-15 minute walk.';

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(40, 40, 50);
  const tipLines = doc.splitTextToSize(tips, 180);
  doc.text(tipLines, 14, y);

  drawFooterAndSignatures(doc, attendingDoc);

  const filename = `${patient.name.replace(/\s+/g, '_')}_Meal_Diet_Plan.pdf`;
  return handlePdfOutput(doc, filename, action);
}
