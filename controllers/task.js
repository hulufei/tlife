var multiparty = require('multiparty');
var moment = require('moment');
var T = require('t-cli');
var Task = require('../models/Task');

// @refer post /t/tasks
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

        var tasks = t.collections.filter(function(c) {
          c.user = req.user;
          return c.start && c.end && c.text;
        });

        Task.create(tasks, function(err) {
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

// @refer get /api/tasks?days=1&ceiling=2013-3-3
// Get tasks based on a specfied date and limit days, default: only today
exports.getTasks = function(req, res, next) {
  var ceiling = req.query.ceiling
    , days = req.query.days || 1
    , user = req.user
    , floor;

  ceiling = ceiling ? moment(ceiling) : moment();

  if (!parseInt(days) || !ceiling.isValid()) return next('Invalid Params!');

  floor = ceiling.clone().subtract('days', days).hours(23).minutes(59).seconds(59);
  // Set ceiling to next day's 00:00
  ceiling.add('days', 1).hours(0).minutes(0).seconds(0);

  Task
    .find({ user: user })
    .where('date').lt(ceiling).gt(floor)
    .sort('-date')
    .select('-user -__v')
    .exec(function(err, tasks) {
      if (err) return next(err);

      res.send(tasks);
    });
};

// @refer post /api/tasks
// Create new task
exports.createTask = function(req, res, next) {
  var task = req.body;
  task.user = req.user;
  // Client id here is useless
  delete task.id
  Task.create(task, function(err, doc) {
    if (err) return next(err);

    res.send({
      id: doc.id,
      start: doc.start,
      text: doc.text,
      end: doc.end,
      metas: doc.metas,
      date: doc.date
    });
  })
};

// @refer put /api/tasks/:id
exports.updateTask = function(req, res, next) {
  var id = req.params.id;
  var task = req.body;
  // Spine expects a JSON representation of the record as a server response to
  // create and update requests.
  Task.findOneAndUpdate({ _id: id }, { $set: task },
      { select: '-user -__v' }, function(err, doc) {
    if (err) return next(err);
    res.send(doc);
  });
}

// @refer delete /api/tasks/:id
exports.deleteTask = function(req, res, next) {
  var id = req.params.id;
  Task.findByIdAndRemove(id, function(err) {
    if (err) return next(err);
    res.send(200);
  });
}

exports.render = function(req, res) {
  res.render('tasks');
};
