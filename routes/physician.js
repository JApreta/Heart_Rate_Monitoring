const express = require('express')
const router = express.Router()
const Physician_controller = require('../controllers/physicianController')
const { protect, role } = require('../middleware/auth')



router.get('/signup', function(req, res) {
    res.render('physician/signup')

})


router.post('/api/create', Physician_controller.create)
router.post('/api/login', Physician_controller.login)
router.get('/api/dashboard', protect, role('physician'), Physician_controller.dashboard)

//patient info endpoints
router.get('/api/patient-list', protect, role('physician'), Patient_controller.patientList)
    //router.get('/api/patient-detail/:email', protect, role('physician'), Patient_controller.patientDetail)


//user update info endpoints
//router.put('/api/update-password', protect, role('physician'), Patient_controller.passwordReset)
//router.put('/api/update-user-info', protect, role('physician'), Patient_controller.updateUserInfo)



module.exports = router;