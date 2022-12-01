const mongoose = require('mongoose')

const ReadingSchema = new mongoose.Schema({
    device_id: {
        type: String,
        required: true
    },
    Rate: {
        type: Number,
        required: true
    },
    Oxy: {
        type: Number,
        required: true
    },
    Time: {
        type: String,
        required: true
    },
    Date: {
        type: String,
        required: true
    },

})

module.exports = mongoose.model('Readings', ReadingSchema)