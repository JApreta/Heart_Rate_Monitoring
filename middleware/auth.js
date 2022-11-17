const jwt = require('jsonwebtoken')
const asyncHandler = require('express-async-handler')
const User = require('../models/user')
const secret = "abchowiqgcq123"

exports.protect = asyncHandler(async(req, res, next) => {
    let token

    if (
        (req.headers.authorization || req.headers.Authorization) &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            // Get token from header
            token = req.headers.authorization.split(' ')[1]

            // Verify token
            decoded = jwt.verify(token, secret)

            // Get user from the token

            req.user = await User.findOne({ "email": decoded.email }).select('-password')

            console.log(decoded)
            next()
        } catch (error) {
            console.log(error)
            res.status(401).json({ error: 'Not authorized' })
                //throw new Error('Not authorized')
        }
    }

    if (!token) {
        res.status(401).json({ error: 'Not authorized, no token' })
            //throw new Error('Not authorized, no token')
    }

})

exports.role = (userRole) => {
    return asyncHandler(async(req, res, next) => {
        const user = await User.findOne({ "email": req.user.email }).select('-password')
        if (user.userType == userRole) {
            next()
        } else {
            res.status(401).json({ error: 'Not authorized...' })
                //throw new Error('Not authorized...')
        }
    })
}