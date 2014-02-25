var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var User = require('../models/User');

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function (err, user) {
    done(err, user);
  });
});

passport.use(new LocalStrategy({ usernameField: 'email' }, function(email, password, done) {
  User.findOne({ email: email }, function(err, user) {
    if (!user) return done(null, false, { message: 'Email ' + email + ' not found'});
    user.comparePassword(password, function(err, isMatch) {
      if (isMatch) {
        return done(null, user);
      } else {
        return done(null, false, { message: 'Invalid email or password.' });
      }
    });
  });
}));

exports.isAuthenticated = function(req, res, next) {
  var token = req.get('x-auth-token');
  if (token) {
    // Authenticated by token
    User.findById(token, function(err, user) {
      if (err) return res.send(401);
      req.user = user;
      next();
    });
  }
  else if (req.isAuthenticated()) {
    next();
  }
  else {
    res.redirect('/login');
  }
};