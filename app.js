
/**
 * Module dependencies.
 */

var fs = require('fs');
var path = require('path');
var express = require('express');
var flash = require('express-flash');
var expressValidator = require('express-validator');
var MongoStore = require('connect-mongo')(express);
var mongoose = require('mongoose');
var passport = require('passport');
var multiparty = require('multiparty');
var T = require('t');

var app = express();

/**
 * Load controllers.
 */

var homeController = require('./controllers/home');
var userController = require('./controllers/user');
var taskController = require('./controllers/task');

/**
 * API keys + Passport configuration.
 */

var config = require('./config/secrets')[app.get('env')];
var passportConf = require('./config/passport');

// Bootstrap db connection
mongoose.connect(config.db);
mongoose.connection.on('error', function() {
  console.error('✗ MongoDB Connection Error. Please make sure MongoDB is running.');
});

// Bootstrap models
var modelsPath = __dirname + '/models';
fs.readdirSync(modelsPath).forEach(function(file) {
	require(modelsPath + '/' + file);
});
var Task = mongoose.model('Task');
var User = mongoose.model('User');

// Express configuration.
var hour = 3600000;
var day = (hour * 24);
var week = (day * 7);
var month = (day * 30);

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(require('connect-assets')({
  src: 'public',
  helperContext: app.locals
}));
app.use(express.compress());
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(expressValidator());
// app.use(express.multipart());
app.use(express.cookieParser());
app.use(express.session({
  secret: config.sessionSecret,
  // store: new MongoStore({
  //   db: mongoose.connection.db,
  //   auto_reconnect: true
  // })
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(function(req, res, next) {
  res.locals.user = req.user;
  res.locals.secrets = config;
  next();
});
app.use(flash());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public'), { maxAge: week }));
app.use(function(req, res) {
  res.status(404);
  res.render('404');
});
app.use(express.errorHandler());

// Routes
app.get('/', homeController.index);
app.get('/login', userController.getLogin);
app.post('/login', userController.postLogin);
app.get('/signout', userController.logout);
app.get('/signup', userController.getSignup);
app.post('/signup', userController.postSignup);
app.get('/account', passportConf.isAuthenticated, userController.getAccount);
app.post('/account/profile', passportConf.isAuthenticated, userController.postUpdateProfile);
app.post('/account/password', passportConf.isAuthenticated, userController.postUpdatePassword);
app.post('/account/delete', passportConf.isAuthenticated, userController.postDeleteAccount);

app.post('/auth/token', userController.getAuthToken);

app.post('/api/tasks',
  // passport.authenticate('local', { session: false }),
  function(req, res, next) {
    console.log(req.body.email);
    console.log(req.body.password);
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


// Start Express Server
app.listen(app.get('port'), function() {
  console.log("✔ Express server listening on port %d in %s mode", app.get('port'), app.settings.env);
});

exports = module.exports = app;
