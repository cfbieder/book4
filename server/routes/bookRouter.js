/******************************************************************************************************
 * Data Server  Book Routes
 * Chris Biedermann
 * V1.0
 * November 2025
 * 
 * 
 * ROUTES SERVED
 * get / - get all books
 * post / - add new book(s)
 * delete / - delete all books
 * 
 ****************************************************************************************************/



var express = require("express");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var passport = require("passport");
var User = require("../models/user");
var Verify = require("./verify");
var Jsonfile = require("jsonfile");
var cors = require('cors')

var router = express.Router();
router.use(bodyParser.json());

var request = require("request");

Books = require("../models/books");

router
  .route("/")
  //.get(Verify.verifyOrdinaryUser, function(req, res, next) {
  .get(function(req, res, next) { 
    Books.find(function(err, books) {
      if (err) res.send(err);
      res.json(books);
    });
  })

  .post(Verify.verifyOrdinaryUser, async function(req, res, next) {
    try {
      if (Array.isArray(req.body)) {
        await Books.insertMany(req.body);
        return res.json({ status: "done" });
      }

      await Books.create(req.body);
      const books = await Books.find();
      res.json(books);
    } catch (err) {
      next(err);
    }
  })

  .delete(Verify.verifyOrdinaryUser, function(req, res, next) {
    Books.remove(function(err) {
      if (err) res.send(err);
      Books.find(function(err, books) {
        // if there is an error retrieving, send the error. nothing after res.send(err) will execute
        if (err) res.send(err);
        res.json(books); // return all todos in JSON format
      });
    });
  });

router
  .route("/upload")
  .post(Verify.verifyOrdinaryUser, async function(req, res, next) {
    try {
      var data = require("../views/books.json");
      var l = data.length - 1;
      var payload = data.slice(0, l);
      var out = payload.map(function(entry) {
        return entry.title;
      });

      if (payload.length) {
        await Books.insertMany(payload);
      }

      res.json({ val: out });
    } catch (err) {
      next(err);
    }
  })

  .get(function(req, res, next) {
    var data = require("../views/books.json");
    var l = data.length - 1;
    var out = [];
    for (var i = 0; i < l; i++) {
      out.push(data[i].title);
      console.log(book.title);
      if (i == l - 1) {
        res.json({ val: out });
      }
    }
  });

router.route("/google/full/:query").get(function(req, res, next) {
  var ip =
    "https://www.googleapis.com/books/v1/volumes?q=" +
    req.params.query +
    "&key:AIzaSyCH3TZoLFSwPKU71OxzSBSIgTCvY0L5mgc";

  request(ip, function(err, response, body) {
    if (err) {
      console.log(err);
      res.json({ error: req.params.query });
    } else {
      res.json(JSON.parse(body));
    }
  });
});

router.route("/google/:query").get(function(req, res, next) {
  var ip =
    "https://www.googleapis.com/books/v1/volumes?q=" +
    req.params.query +
    "&key:AIzaSyCH3TZoLFSwPKU71OxzSBSIgTCvY0L5mgc";

  request(ip, function(err, response, body) {
    if (err) {
      console.log(err);
      res.json({ error: req.params.query });
    } else {
      var books = JSON.parse(body);
      books = books["items"];
      res.json(books);
    }
  });
});

router.route("/backup/:name").post(function(req, res, next) {
  var file = req.params.name + ".json";
  Books.find(function(err, books) {
    Jsonfile.writeFile(file, books, function(err) {
      if (err) {
        console.log("error: ", err);
        res.json({ error: err });
      }
      console.log(req.params.name);
      res.json({ status: "ok" });
    });
  });
});

router
.route("/find")
.get(function(req, res, next) {
  key = Object.keys(req.body)
  value = Object.values(req.body)
  var queryParam = {};
  queryParam[key] = {$regex: value};
  Books.find(queryParam, function(err, books) {
      if (err) res.send(err);
      res.json(books); // return all todos in JSON format
  });


});

router
  .route("/:id")
  .get(function(req, res, next) {
    Books.findById(req.params.id, function(err, book) {
      // if there is an error retrieving, send the error. nothing after res.send(err) will execute
      if (err) res.send(err);
      res.json(book); // return all todos in JSON format
    });
  })

  .put(Verify.verifyOrdinaryUser, function(req, res, next) {
    Books.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true },
      function(err, result) {
        if (err) res.send(err);
        res.send(result);
      }
    );
  })

  .delete(Verify.verifyOrdinaryUser, function(req, res, next) {
    Books.remove(
      {
        _id: req.params.id
      },
      function(err, book) {
        if (err) res.send(err);

        // get and return all the todos after you create another
        Books.find(function(err, books) {
          if (err) res.send(err);
          res.json(books);
        });
      }
    );
  });

module.exports = router;
