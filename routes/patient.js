const express = require('express')
const router = express.Router()
const Patient_controller = require('../controllers/patientController')
const { protect } = require('../middleware/auth')





router.get('/signup', function(req, res) {
    res.render('patient/signup')

})

router.post('/create', Patient_controller.create)
router.post('/login', Patient_controller.login)
router.get('/dashboard', protect, Patient_controller.dashboard)

module.exports = router;