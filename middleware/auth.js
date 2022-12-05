//this file contains the middleware functions to protect the routes 
const jwt = require('jsonwebtoken')
const asyncHandler = require('express-async-handler')
const User = require('../models/user')
const secret = "abchowiqgcq123"

//check if the user is authenticated and if the given token is valid--this function is used to retrict access to non auth users to the routes
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

//this function check if the user is patient or physician- it is used on routes to restrict access by user type
exports.role = (userRole) => {
    return asyncHandler(async(req, res, next) => {
        //find the user on db
        const user = await User.findOne({ "email": req.user.email }).select('-password')
            //check if it has correct userType to accss the route
        if (user.userType == userRole) {
            next()
        } else {
            res.status(401).json({ error: 'Not authorized...' })
                //throw new Error('Not authorized...')
        }
    })
}