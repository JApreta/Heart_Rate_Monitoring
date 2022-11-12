const jwt = require('jsonwebtoken')
const asyncHandler = require('express-async-handler')
const User = require('../models/user')
const secret = "abchowiqgcq123"

exports.role = (userRole) => {
    return asyncHandler(async(req, res, next) => {
        if (req.user.userType = userRole) {
            next()
        } else {
            res.status(401)
            throw new Error('Not authorized')
        }
    })
}