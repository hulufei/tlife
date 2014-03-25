var app = app || {};

(function() {
  // Task Model
  app.Task = Backbone.Model.extend({
    defaults: {
      start: '',
      text: '',
      metas: {},
      end: '',
      date: null
    },

    validate: function(attrs) {
      var start = attrs.start
        , end = attrs.end
        , text = attrs.text
        , timePattern = /^([0-9]|0[0-9]|1[0-9]|2[0-3]):([0-9]|[0-5][0-9])$/
        , error = {};
      if (!timePattern.test(start)) {
        error.start = 'Invalid start time';
      }
      if (!timePattern.test(end)) {
        error.end = 'Invalid end time';
      }
      if (!text.trim()) {
        error.cnt = 'Task should not be empty';
      }
      // Start-end time should not overlap with other tasks in the same day
      _.every(this.collection.filterDaily(this.get('date')), function(task) {
        var isValid;
        if (end <= start) {
          error.start = error.end = 'Start time should before end';
          return false;
        }
        if (this.id === task.id) return true;
        // Times are based on a 24 hour clock (and they should be if there's no AM/PM)
        // and provided they are always in the format HH:MM:SS you can do a direct
        // string comparison.
        // @see http://stackoverflow.com/questions/6212305/how-can-i-compare-two-time-strings-in-the-format-hhmmss
        isValid = end <= task.get('start') || start >= task.get('end');
        if (!isValid) {
          error.conflictTask = task;
        }
        return isValid;
      }, this);

      if (!_.isEmpty(error)) return error;
    }
  });
})();
