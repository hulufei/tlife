var app = app || {};

(function($) {
  // Delegate collection events to specified DailyView
  app.AppView = Backbone.View.extend({
    el: '#container',

    initialize: function(options) {
      this.dailyViews = {};

      this.listenTo(app.tasks, 'add', this.add);
      this.listenTo(app.tasks, 'remove', this.remove);
    },

    getKey: function(model) {
      return (new Date(model.get('date'))).getTime();
    },

    render: function(view) {
      this.dailyViews[view.date.getTime()] = view;
      this.$el.append(view.render().el);
    },

    add: function(model) {
      var k = this.getKey(model);
      this.dailyViews[k].add(model);
    },

    remove: function(model) {
      var k = this.getKey(model);
      this.dailyViews[k].render();
    }
  });
})(jQuery);
