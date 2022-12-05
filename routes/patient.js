const express = require('express')
const router = express.Router()
const Patient_controller = require('../controllers/patientController')
const { protect, role } = require('../middleware/auth')




router.post('/create', Patient_controller.create) // route to create new patient account
router.post('/add-device', protect, role('patient'), Patient_controller.addDevice) //route to add a patient device
router.post('/readings', Patient_controller.saveReading) // route to save the device reading 
router.post('/measurment-frequency', protect, Patient_controller.updateMeasurmentFreq) //route to update the patient measurment fre on particle io
    //router.post('/measurment-time', protect, role('patient'), Patient_controller.updateMeasurmentTime)
router.get('/dashboard', protect, role('patient'), Patient_controller.dashboard) // route to get the user basic info
router.get('/device-list', protect, role('patient'), Patient_controller.deviceList) //route to get the patient device list
router.get('/physician-list', protect, role('patient'), Patient_controller.physicianList) //route to get the available physiscian list
router.get('/weekly-summary', protect, role('patient'), Patient_controller.weeklySummary) // route to get the weeky reading summary
router.get('/daily-summary', protect, Patient_controller.dailySummary) // route to get the daily readings summmary 
router.delete('/remove-device/:device_id', protect, role('patient'), Patient_controller.removeDevice) // route to remove a patient device
router.put('/update-physician', protect, role('patient'), Patient_controller.updatePhysician) //route to update the patient physiscian
router.put('/update-user-info', protect, role('patient'), Patient_controller.updateUserInfo) //route to update the user basic info



//router.put('/update-password', protect, role('patient'), Patient_controller.passwordReset)
//router.put('/update-particle-token', protect, role('patient'), Patient_controller.updateParticleToken)



module.exports = router;