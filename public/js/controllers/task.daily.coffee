class DailyTasks extends Spine.Controller
  tasks: []

  addOne: (item) ->
    task = new TaskItem(item: item)
    @tasks.push(item)
    @append(task)

  validate: (item) ->
    error = {}
    if item.end <= item.start
      error.start = error.end = 'Start time should before'
      return error
    for task in @tasks
      if item.id isnt task.id and
        item.end <= task.get('start') or item.start >= task.get('end')
          error.conflictTask = task
          return error
    return true

(exports ? this).DailyTasks = DailyTasks;
