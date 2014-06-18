#= require ../lib/jquery/dist/jquery
#= require ../lib/spine/src/spine
#= require ../lib/spine/src/ajax
#= require ../lib/spine/src/manager
#= require ../lib/mustache/mustache
#= require models/task
#= require controllers/task.item
#= require controllers/task.daily

class App extends Spine.Controller
  el: '#container'

  constructor: ->
    super
    @daily = {}
    @dailyTpl = $('#daily-template').html()
    # Speed up future uses
    Mustache.parse(@dailyTpl)

    # Setup whole view only at beginning
    Task.one('refresh', @setup)
    Task.bind('ajaxError', @ajaxError)

    # Fetch a week's tasks by default
    Task.fetch(data: 'days=7')
    @log('App Initialized')

  setup: (tasks) =>
    @log('Refresh tasks and update whole view')
    @log(tasks)

    # Group by date first
    Task.each (task) =>
      stamp = (new Date task.date).getTime()
      (@daily[stamp] = @daily[stamp] or []).push(task)

    for stamp, tasks of @daily
      dailyContainer = $(@template(task))
      dailyTasks = new DailyTasks(el: dailyContainer.find('.task-list'))
      for task in tasks.sort(DailyTasks.sortByTime)
        dailyTasks.addOne(task)
      @daily[stamp] = dailyTasks
      @el.append(dailyContainer)

  template: (task) ->
    task.getDay()
    task.getFormatDate()
    Mustache.render(@dailyTpl, task)

  ajaxError: (record, xhr, settings, error) =>
    # TODO: error status tips
    @log('Ajax Error:')
    @log(error)
    @log(record)

window.onbeforeunload = ->
  if Spine.Ajax.pending
    alert '''Data is still being sent to the server;
       you may lose unsaved changes if you close the page.'''

$ ->
  app = new App()
