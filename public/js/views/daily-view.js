var app = app || {};

(function($) {
  // Daily tasks
  app.DailyView = Backbone.View.extend({
    template: _.template($('#daily-template').html()),

    events: {
      'click .add': 'showAddInputs',
      'keypress .task-inputs': 'createOnEnter',
      'keydown .task-inputs': 'revertOnEscape',
      'focus .task-inputs': 'focus',
      'blur .task-inputs': 'closeOnBlur'
    },

    // Bind to daily tasks collection
    initialize: function(options) {
      this.date = options.date;
    },

    render: function() {
      // console.log('daily view render: ' + this.date);
      var taskView;
      // Update collection before render
      this.collection = app.tasks.filterDaily(this.date);
      if (this.collection.length) {
        this.$el.html(this.template({
          date: [
            this.date.getFullYear(),
            this.date.getMonth() + 1,
            this.date.getDate()
          ].join('/')
        }));

        this.$list = this.$el.find('ul');
        this.$newInputs = this.$el.find('.task-inputs');
        this.$startInput = this.$newInputs.find('[name=start]');
        this.$endInput = this.$newInputs.find('[name=end]');
        this.$cntInput = this.$newInputs.find('[name=cnt]');

        _.each(this.collection, function(task) {
          taskView = new app.TaskView({ model: task });
          this.$list.append(taskView.render().el);
        }, this);
      }
      else {
        this.$el.html('');
      }
      return this;
    },

    // Add action
    add: function(task) {
      // console.log('daily-view add on: ' + this.date);
      var view = new app.TaskView({ model: task });
      this.$list.append(view.render().el);
    },

    // Show task create inputs
    showAddInputs: function() {
      this.$el.addClass('creating');
      this.$cntInput.focus();
    },

    createOnEnter: function(e) {
      if (e.which === ENTER_KEY) {
        var start = $.trim(this.$startInput.val())
          , end = $.trim(this.$endInput.val());
        var model = new app.Task({
          start: app.tasks.format(start),
          text: $.trim(this.$cntInput.val()),
          end: app.tasks.format(end),
          // Convert date to string before save, otherwise backbone will
          // convert automatically, and trigger `change` event twice
          // TODO: learn more about Date attributes as backbone model
          date: this.date.toString()
        }, { collection: app.tasks });

        if (model.isValid()) {
          app.tasks.create(model);
          this.$el.removeClass('creating');
          this.$newInputs.find('input').val('');
        }
        else {
          this.$newInputs.find('.error').removeClass('error');
          var error = model.validationError;
          for (var k in error) {
            this.$newInputs.find('[name=' + k + ']').addClass('error');
          }
          // Conflict tasks
          if (error.conflictTask) {
            error.conflictTask.trigger('conflict');
          }
        }
      }
    },

    revertOnEscape: function(e) {
      if (e.which === ESC_KEY) {
        this.$el.removeClass('creating');
      }
    },

    focus: function() {
      this.focused = true;
    },

    // Be sure not focused on other input
    closeOnBlur: function() {
      var that = this;
      this.focused = false;
      setTimeout(function() {
        if (!that.focused) {
          that.$el.removeClass('creating');
        }
      }, 0);
    }
  });
})(jQuery);
