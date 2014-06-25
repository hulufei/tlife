# DailyTasks Controller
# @tasks is an array of tasks in this day
class DailyTasks extends Spine.Controller
  events:
    'click .task-add': 'createOne'
    'click .view-unique': 'toggleUnique'

  @sortByTime: (a, b)->
    if a.end < b.end
      return -1
    if a.end > b.end
      return 1
    return 0

  createOne: (e) =>
    e.preventDefault()
    item = new Task(date: @date)
    @addOne(item).edit.active()

  addOne: (item) ->
    task = new TaskItem(item: item)
    # Reference to daily task
    task.daily = @
    @date = item.date
    @tasks = @tasks or []
    @tasks.push(item)
    @append(task)
    return task

  findDupTexts: ->
    counts = {}
    for task in @tasks
      text = task.text
      counts[text] = if counts[text] >= 1 then counts[text] + 1 else 1
    return (text for text of counts when counts[text] > 1)

  # Toggle tasks doing same thing, edit/delete collapsed task will
  # update to all.
  toggleUnique: =>
    for text in @findDupTexts()
      @el.find('.task-item:contains(' + text + ')')
        .first().find('.task-duration').toggle()
        .end().end()
        .slice(1)
        .toggle()

  # Return false if failed
  validate: (item) ->
    error = {}
    if item.end <= item.start
      error.start = error.end = 'Start time should before end'
      item.trigger('error', error)
      return false
    for task in @tasks
      if item.id isnt task.id and
        not (item.end <= task.start or item.start >= task.end)
          task.trigger('conflict')
          return false
    return true

(exports ? this).DailyTasks = DailyTasks;
