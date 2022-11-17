const express = require('express')
const router = express.Router()
const Physician_controller = require('../controllers/physicianController')
const { protect, role } = require('../middleware/auth')





router.post('/create', Physician_controller.create)

router.get('/dashboard', protect, role('physician'), Physician_controller.dashboard)

//patient info endpoints
router.get('/patient-list', protect, role('physician'), Physician_controller.patientList)
    //router.get('/patient-detail/:email', protect, role('physician'), Patient_controller.patientDetail)


//user update info endpoints
//router.put('/update-password', protect, role('physician'), Patient_controller.passwordReset)
//router.put('/update-user-info', protect, role('physician'), Patient_controller.updateUserInfo)



module.exports = router;