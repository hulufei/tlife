class DailyTasks extends Spine.Controller
  addOne: (item) ->
    task = new TaskItem(item: item)
    # Reference to daily task
    task.daily = @
    @tasks = @tasks or []
    @tasks.push(item)
    @append(task)

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
