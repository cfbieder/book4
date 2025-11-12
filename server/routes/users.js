/******************************************************************************************************
 * Data Server  User Routes
 * Chris Biedermann
 * V1.0
 * November 2025
 * 
 * 
 * ROUTES SERVED
 * get / - get all users
 * delete /:id - delete user by id
 * put /:id - update user last name by id
 * get /valid - check if user session is valid
 * post /admin - set user admin status
 * post /update - update user info
 * post /register - register new user 
 * 
 * 
 ****************************************************************************************************/


var express = require('express');
var router = express.Router();
var passport = require('passport');
var User = require('../models/user');
var Verify    = require('./verify');

router.route('/')
  .get(Verify.verifyOrdinaryUser, async function(req, res, next) {
    try {
      const users = await User.find({}).lean();
      return res.json(users);
    } catch (err) {
      return next(err);
    }
  });

router.delete('/:id', Verify.verifyOrdinaryUser,function (req, res, next) {
    
		User.remove({
			_id: req.params.id
		}, function (err, users) {
			if (err)
				res.send(err);

			// get and return all the todos after you create another
			User.find(function (err, users) {
				if (err)
					res.send(err)
				res.json(users);
			});
		});
	});

router.put('/:id', Verify.verifyOrdinaryUser,function (req,res,next){
  User.findOneAndUpdate({_id: req.body._id}, {lastname : req.body.lastname}, {upsert:false}, function(err,users){
    if (err) return res.send(500, { error: err })
    res.json(users);
  })
})

router.get('/valid', function(req,res) {
  var sts = Verify.checkUserStatus(req,res);
  s = {'status' : sts}
  res.json(s);
})

router.post('/admin', Verify.verifyOrdinaryUser,function(req,res){

 var a = (req.body.admin == 'true');

  User.findOneAndUpdate({_id: req.body.id}, {admin : a}, {upsert:false}, function(err,users){
    if (err) return res.send(500, { error: err })
    res.json(users);

  })
});

router.post('/update', Verify.verifyOrdinaryUser,function(req,res){
  User.findOneAndUpdate({_id: req.body.id}, {username : req.body.username, lastname : req.body.lastname, firstname : req.body.firstname}, {upsert:false}, function(err,users){
    if (err) return res.send(500, { error: err })
    res.json(users);

  })
})

router.post('/register', Verify.verifyOrdinaryUser,function(req, res) {
    User.register(new User({ username : req.body.username }),
      req.body.password, function(err, user) {
        if (err) {
            return res.status(500).json({err: err});
        }
        passport.authenticate('local')(req, res, function () {
            return res.status(200).json({status: 'Registration Successful!'});
        });
    });
});

router.post('/login', function(req, res, next) {
  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({
      err: 'Username and password are required'
    });
  }

  passport.authenticate('local', function(err, user, info) {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.status(401).json({
        err: info && info.message ? info.message : 'Invalid username or password'
      });
    }

    req.login(user, function(loginErr) {
      if (loginErr) {
        return res.status(500).json({
          err: 'Could not log in user'
        });
      }

      var token = Verify.getToken(user);
      return res.status(200).json({
        status: 'Login successful!',
        success: true,
        admin: user.admin,
        token: token
      });
    });
  })(req, res, next);
});

router.get('/logout', function(req, res, next) {
  req.logout(function(err) {
    if (err) {
      return next(err);
    }

    var finish = function() {
      return res.status(200).json({
        status: 'Bye!'
      });
    };

    if (req.session) {
      req.session.destroy(function(sessionErr) {
        if (sessionErr) {
          return next(sessionErr);
        }
        res.clearCookie('connect.sid');
        return finish();
      });
    } else {
      return finish();
    }
  });
});

module.exports = router;
