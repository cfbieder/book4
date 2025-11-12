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
console.log("[DA] mode: %s", mode);

// Use Express for routing of REST calls
const express = require("express");
const app = express()

var cors = require("cors");
app.use(cors());

var ip = require("ip");
console.log("[DS] IP address is", ip.address());

var bodyParser = require("body-parser");



// URL of MongoDB server
var db = process.env.MONGO_URI;
console.log("[DA] Mongo URI: ", db);


//Routes


//Helper for database transactions with MongoDB    



// Library for MongoDB
var mongoose = require("mongoose");
//Connect to Mongoose
mongoose
    .connect(db, { serverSelectionTimeoutMS: 1000 })  // add timeout without deprecated opts
    .then(() => {
        console.log("[DA] Connected to MongoDB");

    })
    .catch((err) => {
        console.log(
            "[DA] Error:  Unable to connect to MongDB - make sure Mongo Docker is running"
        );
        process.exit();
    })



app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));


//Define routes



module.exports = app;
