var app = app || {}
  , ENTER_KEY = 13
  , ESC_KEY = 27;

// Fake data
var tasks = [
  // 2014/3/7
  {
    start: '00:00',
    text: 'First task on 3/7',
    end: '00:10',
    date: new Date('2014/3/7'),
    metas: { tag: 'test' }
  },
  {
    start: '01:00',
    text: 'Second task on 3/7',
    end: '01:30',
    date: new Date('2014/3/7'),
    metas: { tag: 'test' }
  },
  // 2014/3/8
  {
    start: '00:00',
    text: 'First task on 3/8',
    end: '00:10',
    date: new Date('2014/3/8'),
    metas: { tag: 'test' }
  },
  {
    start: '01:00',
    text: 'Second task on 3/8',
    end: '01:30',
    date: new Date('2014/3/8'),
    metas: { tag: 'test' }
  },
  // 2014/3/9
  {
    start: '00:00',
    text: 'First task on 3/9',
    end: '00:10',
    date: new Date('2014/3/9'),
    metas: { tag: 'test' }
  },
  {
    start: '01:00',
    text: 'Second task on 3/9',
    end: '01:30',
    date: new Date('2014/3/9'),
    metas: { tag: 'test' }
  }
];

$(function() {
  // Last 3 days since 2014/3/7
  var days = 3
    , start = new Date('2014/3/10')
    , dailyView;

  // Fetch tasks from LocalStorage, if no data exists, set some faked
  // tasks and save back
  app.tasks.once('sync', function() {
    if (app.tasks.length === 0) {
      app.tasks.add(tasks);
      app.tasks.each(function(task) { task.save(); });
    }

    var appView = new app.AppView();

    while(days--) {
      // Previous days
      start.setDate(start.getDate() - 1);
      var cloneDate = new Date(start.getTime());
      dailyView = new app.DailyView({
        date: cloneDate
      });
      appView.render(dailyView);
    }
  });
  app.tasks.fetch();
});
