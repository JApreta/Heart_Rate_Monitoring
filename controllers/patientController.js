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
        res.status(400).json({ error: 'Please add all Fields' })
            //throw new Error('Please add all Fields')
    }
    //look for user and device in the db
    const findUser = await User.findOne({ email })
    const findDevice = await Device.findOne({ device_id })

    //if user already on db... trow an error
    if (findUser) {
        res.status(400).json({ error: 'User Already exist' })
            //throw new Error('User Already exist')
    }

    //if device already claimed... trow an error
    if (findDevice) {
        res.status(400).json({ error: 'Device was claimed by another user' })
            // throw new Error('Device was claimed by another user')
    }

    //hashing the password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    //api call to particle.io to check if given token and/or device_id is valid
    var validate_device = false
    var validate_token = false
    const particle = new Particle()
    await particle.listDevices({ auth: particle_token }).then(
            function(devices) {
                validate_token = true
                for (let dev of devices.body) {
                    if (dev.id == device_id) {
                        validate_device = true
                        break
                    }
                }
            },
            function(err) {
                validate_device = false
                validate_token = false
            }
        )
        //if deviceID and token are valid
    if (validate_device && validate_token) {

        const newPatient = new User({
            firstName: firstName,
            lastName: lastName,
            email: email,
            password: hashedPassword,
            particle_token: particle_token,
            userType: "patient",
            physician_emai: ""

        });
        newPatient.save(function(err, data) {
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
        res.status(400).send({ error: " invalid Device ID and or Particle Token" })

})

//patient login
exports.login = asyncHandler(async(req, res) => {
    const { email, password } = req.body

    // Check for user email
    const user = await User.findOne({ email })

    if (user && (await bcrypt.compare(password, user.password))) {
        res.status(200).json({
            email: user.email,
            token: generateToken(user.email, user.userType),
        })
    } else {
        res.status(400).json({ error: "Invalid credentials" })
            //throw new Error('Invalid credentials')
    }
})
exports.dashboard = asyncHandler(async(req, res) => {
    res.status(200).send({ message: req.user })
})

//getting device list
exports.deviceList = asyncHandler(async(req, res) => {
    const filter = { 'user_email': req.user.email }
    Device.find(filter).select('-user_email -_id').exec(function(err, data) {
        if (err) {
            res.status(400).json({ message: 'Bad Request' })
        } else {
            res.status(200).json(data);
        }
    })
})

//adding device
exports.addDevice = asyncHandler(async(req, res) => {
    const device_id = req.body.device_id

    var val = false
    const particle = new Particle()
    await particle.listDevices({ auth: req.user.particle_token }).then(
        function(devices) {
            for (let dev of devices.body) {
                if (dev.id == device_id) {
                    val = true
                    break
                }
            }
        },
        function(err) {
            val = false
        }
    )

    if (val) { //if given device Id is valid
        const findDevice = await Device.findOne({ device_id }) //check if it has been claimed by another user
        if (findDevice) {
            res.status(400).json({ error: 'Device was claimed by another user' })
                //throw new Error('Device was claimed by another user')
        } else {
            const userDevice = new Device({
                device_id: device_id,
                user_email: req.user.email
            });

            userDevice.save(function(err, device) {
                if (err) {
                    res.status(400).send(err);
                } else {
                    res.status(201).json({ message: `Device with id(${device.device_id}) info has been save` });
                }
            })
        }
    } else {
        res.status(400).send({ message: " invalid Device ID" })
    }
})

exports.removeDevice = asyncHandler(async(req, res) => {

    Device.findOneAndDelete({ device_id: { $eq: req.params.device_id }, user_email: { $eq: req.user.email } }, function(err, data) {
        if (err) {
            res.status(400).json({ message: 'Bad Request' })
        } else {
            if (!data)
                res.status(400).json({ message: "Bad request" });
            else
                res.status(200).json({ message: "Device removed successfully!" });
        }
    })
})
exports.updatePhysician = asyncHandler(async(req, res) => {
    const filter = { email: req.user.email };
    const update = { physician_email: req.body.physician_email };


    const findPhysician = await User.findOne({ email: { $eq: req.body.physician_email }, userType: { $eq: "physician" } }) //check if given email is on the db as a physician
    if (!findPhysician) {
        res.status(400).json({ error: 'This email is not linked to a Physician Account' })
            //throw new Error('This email is not linked to a Physician Account')
    }
    User.findOneAndUpdate(filter, update, function(err, data) {
        if (err) {

            res.status(400).json({ message: "Bad Request" })
        } else {
            res.status(201).json({ message: "Physician updated successfully!" });

        }
    })
})

const generateToken = (email, userType) => {
    return jwt.sign({
            email: email
        },
        secret, { expiresIn: '90d' })
}