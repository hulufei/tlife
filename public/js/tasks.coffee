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

    Task.bind('refresh', @setup)
    Task.bind('ajaxError', @ajaxError)

    # Fetch a week's tasks by default
    Task.fetch(data: 'days=7')
    @log('App Initialized')

  setup: =>
    @log('Refresh tasks and update whole view')
    @log(Task.all())

    Task.each (task) =>
      stamp = (new Date task.date).getTime()
      dailyTasks = @daily[stamp]
      if not dailyTasks
        dailyContainer = $(@template(task))
        @el.append(dailyContainer)
        dailyTasks = @daily[stamp] = new DailyTasks(el: dailyContainer.find('.task-list'))
      dailyTasks.addOne(task)

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
