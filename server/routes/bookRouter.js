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
  .get(async function(req, res, next) {
    try {
      const books = await Books.find();
      res.json(books);
    } catch (err) {
      next(err);
    }
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

  .delete(Verify.verifyOrdinaryUser, async function(req, res, next) {
    try {
      await Books.deleteMany({});
      const books = await Books.find();
      res.json(books);
    } catch (err) {
      next(err);
    }
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

router.route("/backup/:name").post(async function(req, res, next) {
  try {
    var file = req.params.name + ".json";
    const books = await Books.find();
    Jsonfile.writeFile(file, books, function(err) {
      if (err) {
        console.log("error: ", err);
        return res.json({ error: err });
      }
      console.log(req.params.name);
      res.json({ status: "ok" });
    });
  } catch (err) {
    next(err);
  }
});

router
  .route("/find")
  .get(async function(req, res, next) {
    try {
      const key = Object.keys(req.body);
      const value = Object.values(req.body);
      var queryParam = {};
      queryParam[key] = { $regex: value };
      const books = await Books.find(queryParam);
      res.json(books); // return all todos in JSON format
    } catch (err) {
      next(err);
    }
  });

router
  .route("/:id")
  .get(async function(req, res, next) {
    try {
      const book = await Books.findById(req.params.id);
      res.json(book); // return all todos in JSON format
    } catch (err) {
      next(err);
    }
  })

  .put(Verify.verifyOrdinaryUser, async function(req, res, next) {
    try {
      const result = await Books.findByIdAndUpdate(
        req.params.id,
        { $set: req.body },
        { new: true }
      );
      res.send(result);
    } catch (err) {
      next(err);
    }
  })

  .delete(Verify.verifyOrdinaryUser, async function(req, res, next) {
    try {
      await Books.deleteOne({
        _id: req.params.id
      });

      // get and return all the todos after you create another
      const books = await Books.find();
      res.json(books);
    } catch (err) {
      next(err);
    }
  });

module.exports = router;
