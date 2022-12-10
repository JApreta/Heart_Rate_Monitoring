const express = require('express')
const router = express.Router()
const Physician_controller = require('../controllers/physicianController')
const { protect, role } = require('../middleware/auth')





router.post('/create', Physician_controller.create) // route to create new patient account
router.get('/dashboard', protect, role('physician'), Physician_controller.dashboard) // route to get the physician's patients when entering the dashboard

router.get('/patient-list', protect, role('physician'), Physician_controller.getPatientList) // route to get the patient list
router.post('/measurment-frequency', protect, Physician_controller.updateMeasurmentFreq) // route to update the patient measurment frequency on particle io
router.get('/patientSummary', protect, role('physician'), Physician_controller.weeklySummary) // route to get a patient's weeky reading summary
router.get('/patientDetail', protect, Physician_controller.dailySummary) // route to get a patient's daily readings summary 
router.put('/update-user-info', protect, role('physician'), Physician_controller.updateUserInfo) //route to update the user basic info
    //router.get('/patient-device/:email', protect, role('physician'), Physician_controller.getPatientDevice) // route to get a patient's device(s)-- not in use
    //router.get('/patient-reading/:device', protect, role('physician'), Physician_controller.getPatientReading) // route to get readings from a device-- not in use




module.exports = router;