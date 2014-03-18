
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
mongoose.connect(config.url);
mongoose.connection.on('error', function() {
  console.error('✗ MongoDB Connection Error. Please make sure MongoDB is running.');
});

// Bootstrap models
var Task = require('./models/Task');
var User = require('./models/User');

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
// app.use(express.bodyParser());
app.use(express.cookieParser());
app.use(express.session({
  secret: config.sessionSecret,
  store: new MongoStore({
    url: config.url,
    auto_reconnect: true
  })
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

app.post('/api/tasks', passportConf.isAuthorized, taskController.postTask);

app.get('/api/tasks', passportConf.isAuthenticated, taskController.getTasks);


// Start Express Server
app.listen(app.get('port'), function() {
  console.log("✔ Express server listening on port %d in %s mode", app.get('port'), app.settings.env);
});

exports = module.exports = app;
