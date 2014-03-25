var app = app || {};

(function() {
  // Task collection
  var Tasks = Backbone.Collection.extend({
    model: app.Task,

    localStorage: new Backbone.LocalStorage('tlife'),

    // Uniform time string format to HH:MM
    format: function(time) {
      var parts = time.split(':')
        , h = parts[0]
        , m = parts[1];

      return [
        +h > 9 ? h : '0' + (+h),
        +m > 9 ? m : '0' + (+m)
      ].join(':');
    },

    // Filter tasks daily, date should be parsed by `Date`, like `yyyy-m-d`
    filterDaily: function(date) {
      var d = new Date(date);

      if (d.valueOf()) {
        return this.filter(function(task) {
          var taskDate = new Date(task.get('date'));
          return taskDate.getTime() === d.getTime();
        });
      }

      throw new Error('Invalid Date: ' + date);
    }
  });

  // Create global collection of **Tasks**
  app.tasks = new Tasks();
})();
