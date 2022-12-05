const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const asyncHandler = require('express-async-handler')
const User = require('../models/user')
const Readings = require('../models/readings')
const Device = require('../models/device')
const Particle = require('particle-api-js')
var dotenv = require('dotenv')
const axios = require('axios')
dotenv.config({ path: '../config/config.env' }) // load config file

const secret = process.env.JWT

// create and save new phsician
exports.create = asyncHandler(async(req, res) => {

    const { firstName, lastName, email, password } = req.body

    // check if all the required inputs are given
    if (!firstName || !lastName || !email || !password) {
        res.status(400).json({ error: 'Please add all Fields' })
            // throw new Error('Please add all Fields')
    }
    // look for user in the db
    const findUser = await User.findOne({ email })

    // if user already on db... trow an error
    if (findUser) {
        res.status(400).json({ error: 'User Already exist' })
            // throw new Error('User Already exist')
    }

    // hashing the password
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

// physicianlogin
exports.login = asyncHandler(async(req, res) => {
    const { email, password } = req.body

    // check for user email
    const user = await User.findOne({ email })

    if (user && (await bcrypt.compare(password, user.password))) {
        res.json({
            email: user.email,
            token: generateToken(user.email, user.userType),
        })
    } else {
        res.status(400).json({ error: 'Invalid credentials' })
            // throw new Error('Invalid credentials')
    }
})

exports.dashboard = asyncHandler(async(req, res) => {
    res.status(200).json(req.user)
})

// this funcion finds and returns all of the physician's patients
exports.getPatientList = asyncHandler(async(req, res) => {
    User.find({ physician_email: req.user.email }, function(err, data) {
        if (err) {
            res.status(400).json({ message: "Bad Request" })
        } else {
            res.status(200).json(data)
        }
    })
})

// this funcion finds and returns all of the devices for a specified patient
exports.getPatientDevice = asyncHandler(async(req, res) => {
    Device.find({ user_email: req.params.email }, function(err, data) {
        if (err) {
            res.status(400).json({ message: "Bad Request" })
        } else {
            res.status(200).json(data)
        }
    })
})

// this funcion finds and returns all of a patient's readings for a specified device
exports.getPatientReading = asyncHandler(async(req, res) => {
    Readings.find({ device_id: req.params.device }, function(err, data) {
        if (err) {
            res.status(400).json({ message: "Bad Request" })
        } else {
            res.status(200).json(data)
        }
    })
})

// this function returns the summary of the patient's readings from the last 7 days (average rate, max rate, min rate) 
exports.weeklySummary = asyncHandler(async(req, res) => {
    //get active device ID
    const findDevice = await Device.findOne({ user_email: req.query.email, status: 'Active' })
    const patient = await User.findOne({ email: req.query.email })

    const today = new Date()
    const Startday = new Date(today.getTime())
    const sevenDaysAgo = new Date(today.getTime())
    Startday.setDate(today.getDate())
    sevenDaysAgo.setDate(today.getDate() - 7)

    if (findDevice) {
        Readings.find({
            device_id: findDevice.device_id,
            sortDate: {
                $gte: new Date(sevenDaysAgo),
                $lte: new Date(Startday)
            }
        }, function(err, data) {
            if (err) {
                res.status(400).json({ error: 'Bad Request' })
            } else {
                if (data.length > 0) {
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
                    let patientName = patient.firstName + " " + patient.lastName;
                    res.status(200).json({ device: findDevice.device_id, avg: avg, min: min, max: max, name: patientName })
                } else
                    res.status(400).json({ error: "NO READINGS HAVE BEEN RECORDED" });
            }
        })
    } else
        res.status(400).json({ error: 'No Active Device Registred for this user' })
})

// this function finds and return the heart rate and O2 reading from the user's active device to be graphed 
exports.dailySummary = asyncHandler(async(req, res) => {
    //get active device ID
    const findDevice = await Device.findOne({ user_email: req.query.email, status: 'Active' })
    const patient = await User.findOne({ email: req.query.email })
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
                    let patientName = patient.firstName + " " + patient.lastName;

                    res.status(200).json({ rate: rate, oxy: oxy, barLabel: labels.reverse(), barRates: rates.reverse(), barOxy: oxys.reverse(), name: patientName })
                } else
                    res.status(400).json({ error: "NO READINGS HAVE BEEN RECORDED" });
            }
        })
    } else
        res.status(400).json({ error: 'No Active Device Registred for this user' })
})

// this function updates the device measurment freq on particle.io
exports.updateMeasurmentFreq = asyncHandler(async(req, res) => {
    // check if input are valid
    if (!req.body.email || !req.body.arg) {
        res.status(400).json({ error: 'Please add all Fields with valid values' })
    } else {
        // try to find patient with given email
        const findUser = await User.findOne({ email: req.body.email })
        if (findUser) { // if found
            // try to find the patient active device
            const findDevice = await Device.findOne({ user_email: req.body.email, status: 'Active' })
            if (findDevice) { // if found
                const particle_token = findUser.particle_token // get the user particle.io token
                const deviceID = findDevice.device_id // get the user active device ID
                    // make an API call to particle IO to update the valiable using axios
                axios.post(`https://api.particle.io/v1/devices/e00fce684b9c2c1fbe4d6ae9/setBetweenUpdate`, {
                    arg: req.body.arg
                }, {
                    headers: {
                        'Authorization': `Bearer 2ba55849ee70571a5bc63956942e66a009d6c0c3`
                    }
                }).then(function(response) {
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

// this function uses jwt to generate the user auth token given the email
const generateToken = (email, userType) => {
    return jwt.sign({
            email: email
        },
        secret, { expiresIn: '90d' })
}

//this function formats the Data to have a xx-xx format
const formatData = (input) => {
    if (input > 9 || input == 0) {
        return input;
    } else return `0${input}`;
};