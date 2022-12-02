const mongoose = require('mongoose')

const DeviceSchema = new mongoose.Schema({
    device_id: {
        type: String,
        required: true
    },
    user_email: {
        type: String,
        required: true
    },
    device_apiKey: {
        type: String,
        required: true
    },
    status: {
        type: String,
        default: 'Active'

    }
})

module.exports = mongoose.model('Device', DeviceSchema)