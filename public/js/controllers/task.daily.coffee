class DailyTasks extends Spine.Controller
  addOne: (item) =>
    task = new TaskItem(item: item)
    @append(task)

(exports ? this).DailyTasks = DailyTasks;
