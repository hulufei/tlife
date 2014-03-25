var app = app || {};

(function($) {
  // Task item view
  app.TaskView = Backbone.View.extend({
    tagName: 'li',

    template: _.template($('#task-template').html()),

    events: {
      'click .task': 'edit',
      'click .remove': 'remove',
      'keypress .edit': 'updateOnEnter',
      'keydown .edit': 'revertOnEscape',
      'blur .edit': 'closeOnBlur',
      'focus .edit': 'focus'
    },

    initialize: function() {
      this.listenTo(this.model, 'change', this.render);
      this.listenTo(this.model, 'invalid', this.popError);
      this.listenTo(this.model, 'conflict', this.mark);
      // Prefer `listenTo`, set context to the `view`
      // this.model.on('conflict', this.mark);
    },

    // Re-render the task item.
    render: function() {
      // Backbone LocalStorage is adding `id` attribute instantly after
      // creating a model.  This causes our TodoView to render twice. Once
      // after creating a model and once on `id` change.  We want to
      // filter out the second redundant render, which is caused by this
      // `id` change.  It's known Backbone LocalStorage bug, therefore
      // we've to create a workaround.
      // https://github.com/tastejs/todomvc/issues/469
      if (this.model.changed.id !== undefined) {
        return;
      }
      // console.log('task render');
      // console.log(this.model);
      this.$el.html(this.template(this.model.toJSON()));
      this.$start = this.$el.find('[name=start]');
      this.$cnt = this.$el.find('[name=cnt]');
      this.$end = this.$el.find('[name=end]');
      return this;
    },

    // Switch this view into `editing` mode, displaying hte input field
    edit: function() {
      this.$el.addClass('editing').siblings().removeClass('editing');
      this.$start.val(this.model.get('start'));
      this.$end.val(this.model.get('end'));
      this.$cnt.val(this.model.get('text')).focus();
      this.closed = false;
    },

    // Remove the item, destroy the model from **localStorage** and deletes its
    // view
    remove: function() {
      this.model.destroy();
    },

    // Errors show up
    popError: function(model, error) {
      this.resetError();
      for (var k in error) {
        this.$el.find('[name=' + k + ']').addClass('error');
      }
      // Conflict tasks
      if (error.conflictTask) {
        error.conflictTask.trigger('conflict');
      }
    },

    // Mark as conflict
    mark: function() {
      var $el = this.$el.addClass('error');
      setTimeout(function() {
        $el.removeClass('error');
      }, 800);
    },

    // Reset error states
    resetError: function() {
      this.$el.find('.error').removeClass('error');
    },

    // Close the `editing` mode, saving changes to the task
    close: function() {
      var start = $.trim(this.$start.val())
        , end = $.trim(this.$end.val());
      this.model.save({
        start: app.tasks.format(start),
        end: app.tasks.format(end),
        text: $.trim(this.$cnt.val())
      });
      if (!this.model.validationError) {
        this.$el.removeClass('editing');
        this.resetError();
        // Prevent close on blur
        this.closed = true;
      }
    },

    // If hit `enter`, we're through editing the item
    updateOnEnter: function(e) {
      if (e.which === ENTER_KEY) {
        this.close();
      }
    },

    // If hit `escape` we revert your change by simply leaving the `editing`
    // state
    revertOnEscape: function(e) {
      if (e.which === ESC_KEY) {
        this.$el.removeClass('editing');
      }
    },

    focus: function() {
      this.focused = true;
    },

    closeOnBlur: function() {
      var that = this;
      this.focused = false;
      setTimeout(function() {
        if (!that.focused && !that.closed) {
          that.close();
        }
      }, 0);
    }
  });
})(jQuery);
