const express = require('express')
const router = express.Router()




router.get('/signup', function(req, res) {
    res.render('physician/signup')

})


module.exports = router;