class TaskItemBase extends Spine.Controller
  render: (item) =>
    @item = item if item
    @html(@template(@item))
    @

  template: (item) ->
    item.metasToArray()
    Mustache.render(@tpl, item)

class TaskItemShow extends TaskItemBase
  className: 'task-static'

  elements:
    '.task-metas': 'metas'

  events:
    'click': 'toggleMetas'
    'click .task-modify': 'toggleEdit'
    'click .task-metas': 'stopPropagation'

  constructor: ->
    super
    @tpl = $('#task-template').html()
    # Speed up future uses
    Mustache.parse(@tpl)

  toggleMetas: (e) =>
    @metas.toggle()

  toggleEdit: (e) =>
    @stack.edit.active()
    e.stopPropagation()

  # Stop propagation
  stopPropagation: (e) ->
    e.stopPropagation()

class TaskItemEdit extends TaskItemBase
  className: 'task-edit'

  events:
    'click .add-task-meta': 'addMeta'
    'click .task-save': 'save'

  constructor: ->
    super
    @tpl = $('#task-edit-template').html()
    @metaItemTpl = $('#task-meta-input-template').html()
    # Speed up future uses
    Mustache.parse(@tpl)

  template: (item) ->
    item.metasToArray()
    Mustache.render(@tpl, item, metaItem: @metaItemTpl)

  addMeta: (e) =>
    $(@metaItemTpl).insertBefore(e.target).find('input').val('').first().focus()

  save: =>
    @stack.show.active()

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
