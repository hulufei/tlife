class TaskItem extends Spine.Controller
  tag: 'li'
  classname: 'task-item'

  constructor: ->
    # super
    throw '@item required' unless @item
    @tpl = $('#task-template').html()

    @item.bind('update', @render)
    @item.bind('destroy', @remove)

  render: (item) =>
    @item = item if item
    @html(@template(@item))
    @

  template: (item) ->
    @tpl