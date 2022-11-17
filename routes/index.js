const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const asyncHandler = require('express-async-handler')
const User = require('../models/user')
const Device = require('../models/device')
const Particle = require('particle-api-js')
var dotenv = require('dotenv')
dotenv.config({ path: '../config/config.env' }) //load config fil
    //const secret = process.env.JWT
const secret = "abchowiqgcq123"

router.get('/', function(req, res) {
    res.render('index')

})

router.post('/login', async(req, res) => {
    const { email, password } = req.body

    // Check for user email
    const user = await User.findOne({ email })

    if (user && (await bcrypt.compare(password, user.password))) {
        res.status(200).json({
            email: user.email,
            token: generateToken(user.email, user.userType),
            userType: user.userType
        })
    } else {
        res.status(400).json({ error: "Invalid credentials" })
            //throw new Error('Invalid credentials')
    }
})
const generateToken = (email, userType) => {
    return jwt.sign({
            email: email
        },
        secret, { expiresIn: '90d' })
}
module.exports = router;