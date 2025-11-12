var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Books = mongoose.model('Books', {
    "author": String,
    "comments": String,
    "dateread" : Number,
    "dateunix" : Number,
    "image": String,
    "rating": Number,
    'review' : String,
    'title' : String,
    'type' : String
});

module.exports = Books;
