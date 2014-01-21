
/**
 * Module dependencies.
 */

var fs = require('fs');
var http = require('http');
var path = require('path');
var express = require('express');
var mongoose = require('mongoose');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var multiparty = require('multiparty');
var T = require('t');
var app = express();

var config = require('./config/' + app.get('env'));

// Bootstrap db connection
mongoose.connect(config.db);

// Bootstrap models
var modelsPath = __dirname + '/models';
fs.readdirSync(modelsPath).forEach(function(file) {
	require(modelsPath + '/' + file);
});
var Task = mongoose.model('Task');
var User = mongoose.model('User');

// define passport usage
passport.use(new LocalStrategy({
		usernameField: 'email'
	},
	function(email, password, done) {
		User.findOne({ email: email }).exec(function(err, user) {
			if (err) { return done(err); }

			if (!user) {
				return done(null, false, { message: 'email not register' });
			}
			if (!user.authenticate(password)) {
				return done(null, false, { message: 'wrong password' });
			}
			return done(null, user);
		});
	}
));

passport.serializeUser(function(user, done) {
	done(null, user.id);
});

passport.deserializeUser(function(id, done) {
	User.findById(id, done);
});


// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
// app.use(express.multipart());
app.use(express.cookieParser());
app.use(express.session({ secret: 'key' }));
app.use(passport.initialize());
app.use(passport.session());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' === app.get('env')) {
  app.use(express.errorHandler());
}

// Routes
app.post('/signup', function(req, res, next) {
  var user = new User({
    email: req.body.email,
    password: req.body.password
  });
  user.save(function(err) {
    if (err) {
      if (err.code === 11000) {
        return res.send('email existed');
      }
      return next(err);
    }
    req.login(user, function(err) {
      if (err) return next(err);

      return res.redirect('/');
    });
  });
});

app.get('/signin', function(req, res) {
  if (req.user) {
    res.redirect('/');
  }
  else {
    res.send('Page Sign In');
  }
});

app.post('/signin', passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/signin'
}));

app.get('/signout', function(req, res) {
  req.logout();
  res.redirect('/signin');
});

app.post('/api/tasks',
  function(req, res, next) {
    if (req.isAuthenticated()) { return next(null); }
    res.send(401);
  },
  function(req, res, next) {
    // Remove multipart middleware to handle upload files
    // @see http://goo.gl/LC21f9
    if (req.user && req.is('multipart/form-data')) {
      var form = new multiparty.Form();
      form.parse(req);

      form.on('error', next);

      form.on('part', function(part) {
        // part is a readable stream
        var t = new T(part);
        t.parser.on('end', function(err) {
          if (err) return next(err);

          t.collections.forEach(function(c) { c.user = req.user; });

          Task.create(t.collections, function(err) {
            if (err) return next(err);

            res.send(200);
          });
        });
      });
    }
    else {
      next();
    }
  }
);


// Handle 404
app.use(function(req, res) {
  res.send('Page not found', 404);
});

// Handle 500
app.use(function(err, req, res) {
  res.send('Internal server error', 500);
});

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

exports = module.exports = app;
