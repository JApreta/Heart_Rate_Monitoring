const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const asyncHandler = require('express-async-handler')
const User = require('../models/user')
const Device = require('../models/device')
const Particle = require('particle-api-js')
var dotenv = require('dotenv')
dotenv.config({ path: '../config/config.env' }) //load config file

//const secret = process.env.JWT
const secret = "abchowiqgcq123"

//create and save new phsician
exports.create = asyncHandler(async(req, res) => {

    const { firstName, lastName, email, password } = req.body

    //check if all the required inputs are given
    if (!firstName || !lastName || !email || !password) {
        res.status(400)
        throw new Error('Please add all Fields')
    }
    //look for user in the db
    const findUser = await User.findOne({ email })

    //if user already on db... trow an error
    if (findUser) {
        res.status(400)
        throw new Error('User Already exist')
    }


    //hashing the password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    const newPhysician = new User({
        firstName: firstName,
        lastName: lastName,
        email: email,
        password: hashedPassword,
        userType: "physician"

    });
    await newPhysician.save(function(err, data) {
        if (err) {
            res.status(400).send(err);
        } else {
            let msgStr = `physician with email(${data.email}) info has been save`;
            res.status(201).json({
                message: msgStr,
                token: generateToken(data.email, data.userType)
            });
        }
    })


})

//physicianlogin
exports.login = asyncHandler(async(req, res) => {
    const { email, password } = req.body

    // Check for user email
    const user = await User.findOne({ email })

    if (user && (await bcrypt.compare(password, user.password))) {
        res.json({
            email: user.email,
            token: generateToken(user.email, user.userType),
        })
    } else {
        res.status(400)
        throw new Error('Invalid credentials')
    }
})
exports.dashboard = asyncHandler(async(req, res) => {
    res.status(200).send({ message: req.user })
})
const generateToken = (email, userType) => {
    return jwt.sign({
            email: email
        },
        secret, { expiresIn: '90d' })
}