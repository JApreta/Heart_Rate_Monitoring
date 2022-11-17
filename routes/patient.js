const express = require('express')
const router = express.Router()
const Patient_controller = require('../controllers/patientController')
const { protect, role } = require('../middleware/auth')




router.post('/create', Patient_controller.create)
    //router.post('/login', Patient_controller.login)
router.get('/dashboard', protect, role('patient'), Patient_controller.dashboard)

//device info endpoints
router.get('/device-list', protect, role('patient'), Patient_controller.deviceList)
router.post('/add-device', protect, role('patient'), Patient_controller.addDevice)
router.delete('/remove-device/:device_id', protect, role('patient'), Patient_controller.removeDevice)
    //user update info endpoints
router.put('/update-physician', protect, role('patient'), Patient_controller.updatePhysician)
    //router.put('/api/update-password', protect, role('patient'), Patient_controller.passwordReset)
    //router.put('/api/update-particle-token', protect, role('patient'), Patient_controller.updateParticleToken)
    //router.put('/api/update-user-info', protect, role('patient'), Patient_controller.updateUserInfo)


module.exports = router;