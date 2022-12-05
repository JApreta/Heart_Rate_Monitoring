const express = require('express')
const router = express.Router()
const Physician_controller = require('../controllers/physicianController')
const { protect, role } = require('../middleware/auth')





router.post('/create', Physician_controller.create) // route to create new patient account
router.get('/dashboard', protect, role('physician'), Physician_controller.dashboard) // route to get the physician's patients when entering the dashboard

router.get('/patient-list', protect, role('physician'), Physician_controller.getPatientList) // route to get the patient list
router.get('/patient-device/:email', protect, role('physician'), Physician_controller.getPatientDevice) // route to get a patient's device(s)
router.get('/patient-reading/:device', protect, role('physician'), Physician_controller.getPatientReading) // route to get readings from a device

router.post('/measurment-frequency', protect, Physician_controller.updateMeasurmentFreq) // route to update the patient measurment frequency on particle io
router.get('/patientSummary/:patient_email', protect, role('physician'), Patient_controller.weeklySummary) // route to get a patient's weeky reading summary
router.get('/patientDetail/:patient_email', protect, Physician_controller.dailySummary) // route to get a patient's daily readings summary 



module.exports = router;
