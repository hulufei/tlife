var app = app || {}
  , ENTER_KEY = 13
  , ESC_KEY = 27;

$(function() {
  // Last 3 days since 2014/3/7
  var days = 3
    , start = new Date()
    , dailyView;

  // Fetch tasks from LocalStorage, if no data exists, set some faked
  // tasks and save back
  app.tasks.once('sync', function() {
    console.log('synced');
    var appView = new app.AppView();
    var dailyTasks = _.uniq(app.tasks.models, true, function(item) {
      return item.date;
    });

    _.each(dailyTasks, function(item) {
      dailyView = new app.DailyView({
        date: new Date(item.get('date'))
      });
      appView.render(dailyView);
    });
  });
  app.tasks.fetch();
});
