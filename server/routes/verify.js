var User = require('../models/user');
var jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens

var secretKey = process.env.SECRET_KEY;

exports.getToken = function (user) {
    return jwt.sign( {data: user}, secretKey, {
        expiresIn: 3600
    });
};


exports.checkUserStatus = function(req,res) {
   
    var status = "none"
    var token = req.headers['x-access-token'] || req.body.token || req.query.token;
    
        if (token) {
            // verifies secret and checks exp
            jwt.verify(token, secretKey, function (err, decoded) {
                if (err) {
                    status =  "Error";
                } else {
                    status = "OK";
                }
            });
        } else {
            status = "Not found";
        }
    return status;
}

exports.verifyOrdinaryUser = function (req, res, next) {
    // check header or url parameters or post parameters for token
    var token = req.headers['x-access-token'] || req.body.token || req.query.token;
    // decode token
    if (token) {
        // verifies secret and checks exp
        jwt.verify(token, secretKey, function (err, decoded) {
            if (err) {
                var err = new Error('You are not authenticated!');
                err.status = 401;
                return next(err);
            } else {
                // if everything is good, save to request for use in other routes
                req.decoded = decoded;
                next();
            }
        });
    } else {
        // if there is no token
        // return an error
        var err = new Error('No token provided***!');
        console.log("No token provided!");
        err.status = 403;
        return next(err);
    }
};

exports.verifyAdmin = function(req,res,next){

    var admin = req.decoded._doc.admin;
    if (admin)
    {
        next();
    }
    else
    {
        var err = new Error('You are not authorized!');
        err.status = 403;
        return next(err);     
    }
};