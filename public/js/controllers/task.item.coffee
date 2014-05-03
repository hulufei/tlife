class TaskItemBase extends Spine.Controller
  render: (item) =>
    @item = item if item
    @html(@template(@item))
    @

  template: (item) ->
    item.metasToArray()
    Mustache.render(@tpl, item)

class TaskItemShow extends TaskItemBase
  tag: 'div'
  className: 'task-static'

  constructor: ->
    super
    # throw '@item required' unless @item
    @tpl = $('#task-template').html()
    # Speed up future uses
    Mustache.parse(@tpl)

    # @item.bind('update', @render)
    # @item.bind('destroy', @remove)

class TaskItemEdit extends TaskItemBase
  tag: 'div'
  className: 'task-edit'

  constructor: ->
    super
    # throw '@item required' unless @item
    @tpl = $('#task-edit-template').html()
    # Speed up future uses
    Mustache.parse(@tpl)

class TaskItem extends Spine.Stack
  tag: 'li'
  className: 'task-item'

  controllers:
    show: TaskItemShow
    edit: TaskItemEdit

  default: 'show'

  constructor: ->
    super
    @append(@show.render(@item))
    @append(@edit.render(@item))

(exports ? this).TaskItem = TaskItem;
