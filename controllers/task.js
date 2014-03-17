var multiparty = require('multiparty');
var moment = require('moment');
var T = require('t');
var Task = require('../models/Task');

// @refer post /api/tasks
// Upload task files
exports.postTask = function(req, res, next) {
  // Remove multipart middleware to handle upload files
  // @see http://goo.gl/LC21f9
  if (req.is('multipart/form-data')) {
    var form = new multiparty.Form();
    var t = new T();

    form.parse(req);

    form.on('error', function() {
      res.send(500, { message: 'Invalid tasks!' });
    });

    form.on('part', t.parse.bind(t));

    form.on('close', function() {
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
    res.send(500, { message: 'Invalid tasks!' });
  }
};

// @refer get /api/tasks/:days/:ceiling
// Get tasks based on a specfied date and limit days, default: only today
exports.getTasks = function(req, res, next) {
  var ceiling = req.params.ceiling
    , days = req.params.days || 1
    , user = req.user
    , floor;

  ceiling = ceiling ? moment(ceiling) : moment();
  floor = ceiling.clone().subtract('days', days).hours(0).minutes(0).seconds(0);
  // Set ceiling to next day's 00:00
  ceiling.add('days', 1).hours(0).minutes(0).seconds(0);

  Task
    .find({ user: user })
    .where('date').lt(ceiling).gt(floor)
    .sort('-date')
    .exec(function(err, tasks) {
      if (err) return next(err);

      res.send(tasks);
    });
};
