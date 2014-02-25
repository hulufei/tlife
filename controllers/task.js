var multiparty = require('multiparty');
var T = require('t');
var Task = require('../models/Task');

exports.postTask = function(req, res, next) {
  // Remove multipart middleware to handle upload files
  // @see http://goo.gl/LC21f9
  if (req.is('multipart/form-data')) {
    var form = new multiparty.Form();
    form.parse(req);

    form.on('error', function() {
      res.send(500, { message: 'Invalid tasks!' });
    });

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
    res.send(500, { message: 'Invalid tasks!' });
  }
};
