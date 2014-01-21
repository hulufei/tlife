
/**
 * Module dependencies.
 */

var fs = require('fs');
var http = require('http');
var path = require('path');
var express = require('express');
var mongoose = require('mongoose');
var multiparty = require('multiparty');
var T = require('t');
var app = express();

var config = require('./config/' + app.get('env'));

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
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

// Bootstrap db connection
mongoose.connect(config.db);

// Bootstrap models
var modelsPath = __dirname + '/models';
fs.readdirSync(modelsPath).forEach(function(file) {
	require(modelsPath + '/' + file);
});

var Task = mongoose.model('Task');

// TODO: remove
app.get('/tasks', function(req, res) {
  res.render('form');
});

// Routes
app.post('/tasks', function(req, res, next) {
  // Remove multipart middleware to handle upload files
  // @see http://goo.gl/LC21f9
  // maxFiledsSize set to 2kb
  if (req.is('multipart/form-data')) {
    var form = new multiparty.Form();
    form.parse(req);

    form.on('error', next);

    form.on('part', function(part) {
      // part is a readable stream
      var t = new T(part);
      t.parser.on('end', function(err) {
        if (err) return next(err);

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
});

app.post('/signup', function(req, res, next) {
  res.send(req.body.email);
});

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
