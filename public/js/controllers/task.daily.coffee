class DailyTasks extends Spine.Controller
  addOne: (item) =>
    task = new TaskItem(item: item)
    @append(task.render())

  append: (task) ->
    @$el.append(task.el)
