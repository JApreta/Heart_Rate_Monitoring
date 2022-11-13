const express = require('express')
const router = express.Router()
const Physician_controller = require('../controllers/physicianController')
const { protect, role } = require('../middleware/auth')



router.get('/signup', function(req, res) {
    res.render('physician/signup')

})


router.post('/create', Physician_controller.create)
router.post('/login', Physician_controller.login)
router.get('/dashboard', protect, role('physician'), Physician_controller.dashboard)

//patient info endpoints
//router.get('/patient-list', protect, role('physician'), Patient_controller.patientList)
//router.get('/patient-detail/:email', protect, role('physician'), Patient_controller.patientDetail)


//user update info endpoints
//router.put('/update-password', protect, role('physician'), Patient_controller.passwordReset)
//router.put('/update-user-info', protect, role('physician'), Patient_controller.updateUserInfo)



module.exports = router;