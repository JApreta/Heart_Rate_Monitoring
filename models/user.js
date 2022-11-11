const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
    },
    lastName: {
        type: String,
        required: true,
    },
    username: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    particle_token: {
        type: String,
    },
    userType: {
        type: String,
        required: true,
        enum: ['patient', 'physician']
    },
    physician_email: {
        type: String
    }
})

module.exports = mongoose.model('User', UserSchema)