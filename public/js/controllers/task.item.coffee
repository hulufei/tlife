class TaskItem extends Spine.Controller
  tag: 'li'
  className: 'task-item'

  constructor: ->
    super
    throw '@item required' unless @item
    @tpl = $('#task-template').html()
    # Speed up future uses
    Mustache.parse(@tpl)

    @item.bind('update', @render)
    @item.bind('destroy', @remove)

  render: (item) =>
    @item = item if item
    @html(@template(@item))
    @

  template: (item) ->
    item.metasToArray()
    Mustache.render(@tpl, item)

(exports ? this).TaskItem = TaskItem;
