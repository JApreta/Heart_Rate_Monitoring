const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const User = require('../models/user')
var dotenv = require('dotenv')
dotenv.config({ path: '../config/config.env' }) //load config fil
    //const secret = process.env.JWT
const secret = "abchowiqgcq123"

router.get('/', function(req, res) {
    res.render('index')

})

//login route
router.post('/login', async(req, res) => {
        const { email, password } = req.body //get the credentials

        // Check for user email
        const user = await User.findOne({ email })

        if (user && (await bcrypt.compare(password, user.password))) { //if user was found and password match
            //return the user email, the user type and the auth token
            res.status(200).json({
                email: user.email,
                token: generateToken(user.email), //generate auth token
                userType: user.userType
            })
        } else {
            res.status(400).json({ error: "Invalid credentials" })
                //throw new Error('Invalid credentials')
        }
    })
    //this function uses jwt to generate the user auth token given the email
const generateToken = (email) => {
    return jwt.sign({ email: email }, secret, { expiresIn: '90d' })
}
module.exports = router;