const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema({
    device_id: {
        type: String,
        required: true,
    },
    user_email: {
        type: String,
        required: true,
    }
})

module.exports = mongoose.model('Device', UserSchema)