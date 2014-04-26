#= require ../lib/jquery/dist/jquery
#= require ../lib/spine/src/spine
#= require ../lib/spine/src/ajax
#= require models/task
#= require controllers/task.item
#= require controllers/task.daily

class App extends Spine.Controller
  el: '#container'

  constructor: ->
    super
    @dailyTpl = $('#daily-template')

    Task.bind('refresh', @setup)
    Task.fetch()
    @log('App Initialized')

  setup: =>
    @log('Refresh tasks and update whole view')
    @log(Task.all())

    daily = {}
    Task.each (task) =>
      stamp = (new Date task.date).getTime()
      dailyTasks = daily[stamp]
      if not dailyTasks
        dailyContainer = $(@template(task))
        @el.append(dailyContainer)
        dailyTasks = daily[stamp] = new DailyTasks(el: dailyContainer.find('.task-list'))
      dailyTasks.addOne(task)

  template: (task) ->
    @dailyTpl

app = new App
