const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const asyncHandler = require('express-async-handler')
const User = require('../models/user')
const Device = require('../models/device')
const Readings = require('../models/readings')
const Particle = require('particle-api-js')
const { generateApiKey } = require('generate-api-key');
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
                    user_email: email,
                    device_apiKey: generateApiKey({
                        method: 'string',
                        pool: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
                    })

                });
                userDevice.save(function(err, device) {
                    if (err) {
                        res.status(400).send(err);
                    } else {
                        let msgStr = `patient with email(${data.email}) info has been save`;
                        res.status(201).send({
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
            userType: user.userType
        })
    } else {
        res.status(400).json({ error: "Invalid credentials" })
            //throw new Error('Invalid credentials')
    }
})
exports.dashboard = asyncHandler(async(req, res) => {
    res.status(200).json(req.user)
})

//getting physician list
exports.physicianList = asyncHandler(async(req, res) => {
    const filter = { userType: 'physician' }
    User.find(filter).select('-password -_id -particle_token -userType').exec(function(err, data) {
        if (err) {
            res.status(400).json({ error: 'Bad Request' })
        } else {
            res.status(200).json(data);
        }
    })
})

//getting device list
exports.deviceList = asyncHandler(async(req, res) => {
    const filter = { 'user_email': req.user.email }
    Device.find(filter).select('-user_email -_id').exec(function(err, data) {
        if (err) {
            res.status(400).json({ error: 'Bad Request' })
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
                user_email: req.user.email,
                device_apiKey: generateApiKey({
                    method: 'string',
                    pool: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
                })
            });

            userDevice.save(function(err, device) {
                if (err) {
                    res.status(400).json({ error: 'Bad Request' });
                } else {
                    res.status(200).json({ message: `Device with id( ${device.device_id}) info has been save` });
                }
            })
        }
    } else {
        res.status(400).send({ error: " Invalid Device ID" })
    }
})

exports.removeDevice = asyncHandler(async(req, res) => {

    Device.findOneAndDelete({ device_id: { $eq: req.params.device_id }, user_email: { $eq: req.user.email } }, function(err, data) {
        if (err) {
            res.status(400).json({ error: 'Bad Request' })
        } else {
            if (!data)
                res.status(400).json({ error: "Bad request" });
            else
                res.status(200).json({ message: "Device removed successfully!" });
        }
    })
})
exports.updatePhysician = asyncHandler(async(req, res) => {
    const filter = { email: req.user.email }
    const update = { physician_email: req.body.physician_email }


    const findPhysician = await User.findOne({ email: { $eq: req.body.physician_email }, userType: { $eq: "physician" } }) //check if given email is on the db as a physician
    if (!findPhysician) {
        res.status(400).json({ error: `${req.body.physician_email} This email is not linked to a Physician Account` })
            //throw new Error('This email is not linked to a Physician Account')
    } else {
        User.findOneAndUpdate(filter, update, function(err, data) {
            if (err) {

                res.status(400).json({ message: "Bad Request" })
            } else {
                res.status(200).json({ message: "Physician updated successfully!" });

            }
        })
    }
})

exports.updateUserInfo = asyncHandler(async(req, res) => {
    const filter = { email: req.user.email }
    const update = { firstName: req.body.firstName, lastName: req.body.lastName }
    if (!req.body.firstName || !req.body.lastName) {
        res.status(400).json({ error: 'Please add all Fields' })

    } else {
        User.findOneAndUpdate(filter, update, function(err, data) {
            if (err) {

                res.status(400).json({ message: "Bad Request" })
            } else {
                res.status(200).json({ message: "User Information updated successfully!" });

            }
        })
    }
})

exports.saveReading = asyncHandler(async(req, res) => {
    //betweenMeas for tghe

    if (!req.body.day || !req.body.month || !req.body.year || !req.body.hour || !req.body.minute) {
        res.status(400).json({ error: 'Please add all Fields' })
            //throw new Error('Please add all Fields')
    } else {
        const findDevice = await Device.findOne({ device_id: req.body.coreid, device_apiKey: req.body.api_key })
        if (!findDevice)
            res.status(400).json({ error: 'Incorrect Device ID or API Key' })
        else {


            const format = {
                dd: req.body.day,
                mm: req.body.month,
                yyyy: req.body.year,
                HH: req.body.hour,
                MM: req.body.minute,

            };

            let readingDate = `${format.mm}/${format.dd}/${format.yyyy}`
            let readingTime = `${format.HH}:${format.MM}`

            const newReading = new Readings({
                device_id: req.body.coreid,
                Rate: req.body.rate,
                Oxy: req.body.oxy,
                Date: readingDate,
                Time: readingTime
            });

            newReading.save(function(err, device) {
                if (err) {

                    console.log(req.body) // Call your action on the request here
                    res.status(400).end() // Responding is important
                } else {
                    console.log(req.body) // Call your action on the request here
                    res.status(200).json({ message: "Reading has been recorded" });
                }
            })
        }
    }
})

const generateToken = (email, userType) => {
    return jwt.sign({
            email: email
        },
        secret, { expiresIn: '90d' })
}

const formatData = (input) => {
    if (input > 9) {
        return input;
    } else return `0${input}`;
};

// Function to convert
// 24 Hour to 12 Hour clock
const formatHour = (input) => {
    if (input > 12) {
        return input - 12;
    }
    return input;
};