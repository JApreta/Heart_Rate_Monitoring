const express = require('express')
const router = express.Router()


router.get('/', function(req, res) {
    res.render('index')

})

router.get('/login', function(req, res) {
    res.render('login')

})

router.get('/reference', function(req, res) {
    res.render('reference')

})

module.exports = router;