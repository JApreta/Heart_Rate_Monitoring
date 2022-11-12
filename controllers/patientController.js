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
    //create and save new patient
exports.create = asyncHandler(async(req, res) => {

    const { firstName, lastName, email, password, device_id, particle_token } = req.body

    //check if all the required inputs are given
    if (!firstName || !lastName || !email || !password || !device_id || !particle_token) {
        res.status(400)
        throw new Error('Please add all Fields')
    }
    //look for user and device in the db
    const findUser = await User.findOne({ email })
    const findDevice = await Device.findOne({ device_id })

    //if user already on db... trow an error
    if (findUser) {
        res.status(400)
        throw new Error('User Already exist')
    }

    //if device already claimed... trow an error
    if (findDevice) {
        res.status(400)
        throw new Error('Device was claimed by another user')
    }

    //hashing the password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    //api call to particle.io to check if given token and/or device_id is valid
    const particle = new Particle()
    var validate = false
    await particle.getDevice({ deviceId: device_id, auth: particle_token }).then(
        function(data) {
            validate = true
        },
        function(err) {
            validate = false
        }
    )

    if (validate) {

        const newPatient = new User({
            firstName: firstName,
            lastName: lastName,
            email: email,
            password: hashedPassword,
            particle_token: particle_token,
            userType: "patient",
            physician_emai: ""

        });
        await newPatient.save(function(err, data) {
            if (err) {
                res.status(400).send(err);
            } else {
                //save user's first device
                const userDevice = new Device({
                    device_id: device_id,
                    user_email: email
                });
                userDevice.save(function(err, device) {
                    if (err) {
                        res.status(400).send(err);
                    } else {
                        let msgStr = `patient with email(${data.email}) info has been save`;
                        res.status(201).json({
                            message: msgStr,
                            token: generateToken(data.email, data.userType)
                        });
                    }
                })
            }
        })

    } else
        res.status(400).send({ message: " invalid Device ID and or Particle Token" })

})

//patient login
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