/******************************************************************************************************
 * Data Server
 * Chris Biedermann
 * V1.0
 * November 2025
 * 
 * 
 * ROUTES SERVED
 * 
 * 
 * 
 *******************************************************************************************************/

// Docker or Development mode
var mode = process.env.NODE_MODE;
console.log("[SERVER] mode: %s", mode);


var logger = require("morgan");
var cookieParser = require("cookie-parser");
var bodyParser = require("body-parser");
var mongoose = require("mongoose"); // mongoose for mongodb
var morgan = require("morgan");
var passport = require("passport");
var LocalStrategy = require("passport-local").Strategy;


var usersRoute = require("./routes/users");
var bookRoute = require("./routes/bookRouter");

// Use Express for routing of REST calls
const express = require("express");
const app = express()

var cors = require("cors");
app.use(cors());

var ip = require("ip");
console.log("[SERVER] IP address is", ip.address());

var bodyParser = require("body-parser");
app.use(morgan("common")); // log every request to the console
app.use(logger("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

// Configure signed cookie-based sessions so Passport can persist user logins.
const session = require('express-session');
app.use(session({
  secret: process.env.SECRET_KEY,
  resave: false,
  saveUninitialized: false
}));
app.use(passport.session());


// passport config
var User = require("./models/user");
app.use(passport.initialize());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


// URL of MongoDB server
var db = process.env.MONGO_URI;
console.log("[SERVER] Mongo URI: ", db);

app.use("/api/users", usersRoute);
app.use("/api/books", bookRoute);


//Helper for database transactions with MongoDB    



// Library for MongoDB
var mongoose = require("mongoose");
//Connect to Mongoose
mongoose
    .connect(db, { serverSelectionTimeoutMS: 10000 })  // add timeout without deprecated opts
    .then(() => {
        console.log("[SERVER] Connected to MongoDB");

    })
    .catch((err) => {
        console.log(
            "[SERVER] Error:  Unable to connect to MongDB - make sure Mongo Docker is running"
        );
        process.exit();
    })



//Define routes





module.exports = app;
