const express = require('express')
const router = express.Router()
const Patient_controller = require('../controllers/patientController')
const { protect, role } = require('../middleware/auth')




router.post('/create', Patient_controller.create)

router.get('/dashboard', protect, role('patient'), Patient_controller.dashboard)

//device info endpoints
router.get('/device-list', protect, role('patient'), Patient_controller.deviceList)
router.get('/physician-list', protect, role('patient'), Patient_controller.physicianList)
router.post('/add-device', protect, role('patient'), Patient_controller.addDevice)
router.delete('/remove-device/:device_id', protect, role('patient'), Patient_controller.removeDevice)
    //user update info endpoints
router.put('/update-physician', protect, role('patient'), Patient_controller.updatePhysician)
    //router.put('/update-password', protect, role('patient'), Patient_controller.passwordReset)
    //router.put('/update-particle-token', protect, role('patient'), Patient_controller.updateParticleToken)
router.put('/update-user-info', protect, role('patient'), Patient_controller.updateUserInfo)


module.exports = router;