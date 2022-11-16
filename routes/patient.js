const express = require('express')
const router = express.Router()
const Patient_controller = require('../controllers/patientController')
const { protect, role } = require('../middleware/auth')





router.get('/signup', function(req, res) {
    res.render('patient/signup')

})

router.post('/api/create', Patient_controller.create)
router.post('/api/login', Patient_controller.login)
router.get('/api/dashboard', protect, role('patient'), Patient_controller.dashboard)

//device info endpoints
router.get('/api/device-list', protect, role('patient'), Patient_controller.deviceList)
router.post('/api/add-device', protect, role('patient'), Patient_controller.addDevice)
router.delete('/api/remove-device/:device_id', protect, role('patient'), Patient_controller.removeDevice)
    //user update info endpoints
router.put('/api/update-physician', protect, role('patient'), Patient_controller.updatePhysician)
    //router.put('/api/update-password', protect, role('patient'), Patient_controller.passwordReset)
    //router.put('/api/update-particle-token', protect, role('patient'), Patient_controller.updateParticleToken)
    //router.put('/api/update-user-info', protect, role('patient'), Patient_controller.updateUserInfo)


module.exports = router;