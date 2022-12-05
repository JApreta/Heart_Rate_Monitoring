const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const asyncHandler = require('express-async-handler')
const User = require('../models/user')
const Device = require('../models/device')
const Readings = require('../models/readings')
const Particle = require('particle-api-js')
const { generateApiKey } = require('generate-api-key');
var dotenv = require('dotenv')
const axios = require('axios')
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
                    device_apiKey: generateApiKey({ //generates the API key for the device 
                        method: 'string',
                        pool: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
                    })

                });
                userDevice.save(function(err, device) { // save the device on db
                    if (err) {
                        res.status(400).send(err);
                    } else {
                        let msgStr = `patient with email(${data.email}) info has been save`;
                        res.status(201).send({
                            message: msgStr,
                            token: generateToken(data.email)
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
    const { email, password } = req.body // get the given user name and password

    // try to find the user for user email
    const user = await User.findOne({ email })

    if (user && (await bcrypt.compare(password, user.password))) { //if the user was fornd and the given password match the saved hash
        res.status(200).json({
                email: user.email,
                token: generateToken(user.email), //generates a token for the user seession
                userType: user.userType
            }) //returns the user email, user type and the auth token
    } else {
        res.status(400).json({ error: "Invalid credentials" })
            //throw new Error('Invalid credentials')
    }
})

//returns the user basic info
exports.dashboard = asyncHandler(async(req, res) => {
    res.status(200).json(req.user)
})


//this function finds and return the physician list saved on the db
exports.physicianList = asyncHandler(async(req, res) => {
    const filter = { userType: 'physician' }
        //confidential data like the physician password are not returned
    User.find(filter).select('-password -_id -particle_token -userType').exec(function(err, data) {
        if (err) {
            res.status(400).json({ error: 'Bad Request' })
        } else {
            res.status(200).json(data);
        }
    })
})

//find and return the  device list for a single user on the db
exports.deviceList = asyncHandler(async(req, res) => {
    const filter = { 'user_email': req.user.email } // get the user email of the authenticated user
    Device.find(filter).select('-user_email -_id').exec(function(err, data) {
        if (err) {
            res.status(400).json({ error: 'Bad Request' })
        } else {
            res.status(200).json(data);
        }
    })
})

//this funtion adds a new patient  device on db
exports.addDevice = asyncHandler(async(req, res) => {
    const device_id = req.body.device_id // get the given device ID
    var val = false
    const particle = new Particle()
        //make an API call to check if the given device ID is valid and claimed by the user on particle.io
    await particle.listDevices({ auth: req.user.particle_token }).then(
        function(devices) {
            for (let dev of devices.body) {
                if (dev.id == device_id) {
                    val = true
                    break
                }
            }
        },
        function(err) { val = false })

    if (val) { //if given device Id is valid
        const findDevice = await Device.findOne({ device_id }) //check if it has been claimed by another user
        if (findDevice) {
            res.status(400).json({ error: 'Device was claimed by another user' })
                //throw new Error('Device was claimed by another user')
        } else {
            const userDevice = new Device({ //create a new device obj with the given data
                device_id: device_id,
                user_email: req.user.email,
                device_apiKey: generateApiKey({
                    method: 'string',
                    pool: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
                })
            });
            await Device.updateMany({ user_email: { $eq: req.user.email } }, { status: "Deactive" }) //set all the prev saved device status to deactive
            userDevice.save(function(err, device) { //save the new device
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

//given a divice ID and the patient email,this function finds and removes a device from the user account
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
    //given a physicion email, this fuction updates the patient account with the choosen physician
exports.updatePhysician = asyncHandler(async(req, res) => {
    const filter = { email: req.user.email } //get the pattient email
    const update = { physician_email: req.body.physician_email } //get the physicsian email


    const findPhysician = await User.findOne({ email: { $eq: req.body.physician_email }, userType: { $eq: "physician" } }) //check if given email is on the db as a physician
    if (!findPhysician) {
        res.status(400).json({ error: `${req.body.physician_email} This email is not linked to a Physician Account` })
            //throw new Error('This email is not linked to a Physician Account')
    } else {
        User.findOneAndUpdate(filter, update, function(err, data) { //if the physician is registerd on db, updated the patient account
            if (err) {

                res.status(400).json({ message: "Bad Request" })
            } else {
                res.status(200).json({ message: "Physician updated successfully!" });

            }
        })
    }
})

//this function updates the patient full name
exports.updateUserInfo = asyncHandler(async(req, res) => {
    const filter = { email: req.user.email } //get the user email
    const update = { firstName: req.body.firstName, lastName: req.body.lastName } //get the user new full name
    if (!req.body.firstName || !req.body.lastName) {
        res.status(400).json({ error: 'Please add all Fields' })

    } else {
        User.findOneAndUpdate(filter, update, function(err, data) { //find and update the patient info
            if (err) {

                res.status(400).json({ message: "Bad Request" })
            } else {
                res.status(200).json({ message: "User Information updated successfully!" });

            }
        })
    }
})

//this function saves reading from the device to the db
exports.saveReading = asyncHandler(async(req, res) => {
        //check if all the required data inputs were given
        if (!req.body.day || !req.body.month || !req.body.year ||
            !req.body.hour || !req.body.minute || !req.body.coreid ||
            !req.body.rate || !req.body.oxy || !req.body.api_key) {
            res.status(400).json({ error: 'Please add all Fields' })
                //throw new Error('Please add all Fields')
        } else {
            //try to loacte the given device on db
            const findDevice = await Device.findOne({ device_id: req.body.coreid, device_apiKey: req.body.api_key })
            if (!findDevice) //if not found throw an error
                res.status(400).json({ error: 'Incorrect Device ID or API Key' })
            else { //if found
                const format = {
                    dd: formatData(req.body.day), //format the given day as dd
                    mm: formatData(req.body.month), //format the given month as mm
                    yyyy: req.body.year,
                    HH: formatData(req.body.hour), //format the given hour as hh
                    MM: formatData(req.body.minute), //format the given minute as mm

                };

                let readingDate = `${format.mm}/${format.dd}/${format.yyyy}` //format the given date as mm/dd/yyyy
                let readingTime = `${format.HH}:${format.MM}` //format the given time as hh:MM

                const newReading = new Readings({ //create a new Reading obj with the given data
                    device_id: req.body.coreid,
                    Rate: req.body.rate,
                    Oxy: req.body.oxy,
                    Date: readingDate,
                    Time: readingTime,
                    sortDate: new Date(readingDate)
                });

                newReading.save(function(err, device) { //save the reading data on the db
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
    // this function calculates and returns the min max and avg heart rate of the user for the past 7days
exports.weeklySummary = asyncHandler(async(req, res) => {
    //get active device ID
    const findDevice = await Device.findOne({ user_email: req.user.email, status: 'Active' })

    const today = new Date()
    const Startday = new Date(today.getTime())
    const sevenDaysAgo = new Date(today.getTime())
    Startday.setDate(today.getDate()) //get the 7th day
    sevenDaysAgo.setDate(today.getDate() - 7) // get the 1st day

    if (findDevice) { // if device was found
        Readings.find({ // get its readings from the past 7 days
            device_id: findDevice.device_id,
            sortDate: {
                $gte: new Date(sevenDaysAgo),
                $lte: new Date(Startday)
            }
        }, function(err, data) {
            if (err) {
                res.status(400).json({ error: 'Bad Request' })
            } else {
                if (data.length > 0) { // calculates the max min and avg if readings have been recorded
                    let avg = 0,
                        min = data[0].Rate,
                        max = data[0].Rate
                    for (let i = 0; i < data.length; i++) {
                        avg += data[i].Rate
                        if (data[i].Rate <= min)
                            min = data[i].Rate
                        else if (data[i].Rate >= max)
                            max = data[i].Rate
                    }
                    avg = avg / data.length
                    res.status(200).json({ device: findDevice.device_id, avg: avg, min: min, max: max }) // return the results
                } else
                    res.status(400).json({ error: "NO READINGS HAVE BEEN RECORDED" });
            }
        })
    } else
        res.status(400).json({ error: 'No ACtive Device Registred for this user' })

})

//this function finds and return the heart rate and O2 reading from the user's active device to be graphed 
exports.dailySummary = asyncHandler(async(req, res) => {

    //get active device ID
    const findDevice = await Device.findOne({ user_email: req.query.email, status: 'Active' })

    const selectedDate = new Date(req.query.selectedDate); //get selected date

    const formatD = {
        dd: formatData(selectedDate.getDate()), //make day dd
        mm: formatData(selectedDate.getMonth() + 1), //make month mm
        yyyy: selectedDate.getFullYear()

    };

    let readingDate = `${formatD.mm}/${formatD.dd}/${formatD.yyyy}` //format given date as mm/dd/yyyy

    if (findDevice) {
        Readings.find({ //find and return the data from the given device and time, order by time desc
            device_id: findDevice.device_id,
            Date: { $eq: readingDate }
        }).sort('-Time').exec((err, data) => {
            if (err) {
                res.status(400).json({ error: 'Bad Request' })
            } else {

                if (data.length > 0) {
                    let rate = [],
                        oxy = [],
                        labels = [],
                        rates = [],
                        oxys = [] // vars that hold the graphing data
                    for (let i = 0; i < data.length; i++) {
                        rate.push({
                            t: data[i].Time,
                            y: Number(data[i].Rate)
                        })
                        oxy.push({
                            t: data[i].Time,
                            y: Number(data[i].Oxy)
                        })
                        labels.push(data[i].Time)
                        rates.push(Number(data[i].Rate))
                        oxys.push(Number(data[i].Oxy))
                    }
                    //return the graphing data
                    res.status(200).json({ rate: rate, oxy: oxy, barLabel: labels.reverse(), barRates: rates.reverse(), barOxy: oxys.reverse() })
                } else
                    res.status(400).json({ error: "NO READINGS HAVE BEEN RECORDED" });
            }
        })
    } else
        res.status(400).json({ error: 'No ACtive Device Registred for this user' })

})

//this function updates the device measurment freq on particle.io
exports.updateMeasurmentFreq = asyncHandler(async(req, res) => {
    //check if input are valid
    if (!req.body.email || !req.body.arg) {
        res.status(400).json({ error: 'Please add all Fields with valid values' })

    } else {
        // try tofind patient with given email
        const findUser = await User.findOne({ email: req.body.email })
        if (findUser) { //if found
            //try to find the patient active device
            const findDevice = await Device.findOne({ user_email: req.body.email, status: 'Active' })
            if (findDevice) { //if found
                const particle_token = findUser.particle_token //get the user particle.io token
                const deviceID = findDevice.device_id // get the user active device ID
                    //make an API call to particle IO to update the valiable using axios
                axios.post(`https://api.particle.io/v1/devices/${deviceID}/setBetweenUpdate`, { arg: req.body.arg }, { headers: { 'Authorization': `Bearer ${particle_token}` } }

                ).then(function(response) {

                    res.status(200).json({ message: "Measurment Frequncy was updated" })
                }).catch(err => { res.status(400).json({ error: 'something went wrong...' }) })
            } else {
                res.status(400).json({ error: 'No active device found for this patient' })
            }

        } else {
            res.status(400).json({ error: 'Patient not found' })

        }
    }

})

//this function uses jwt to generate the user auth token given the email
const generateToken = (email) => {
    return jwt.sign({ email: email }, secret, { expiresIn: '90d' })
}

//this function formats the Data to have a xx-xx format
const formatData = (input) => {
    if (input > 9 || input == 0) {
        return input;
    } else return `0${input}`;
};