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

  save: (e) =>
    e.preventDefault()
    # Reset error
    @$('.error').removeClass('error')
    @stack.el.siblings('.conflict').removeClass('conflict')
    # Update model
    attrs =
      start: Task.formatTime(@el.find('[name=start]').val())
      end: Task.formatTime(@el.find('[name=end]').val())
      text: @el.find('[name=text]').val()
      metas: {}
    @el.find('.task-meta').each ->
      _this = $(this)
      key = $.trim _this.find('[name=metaKey]').val()
      value = $.trim _this.find('[name=metaValue]').val()
      # Ignore meta if key or value is empty
      attrs.metas[key] = value if key and value
    @item.load(attrs)
    @stack.show.active() if @item.save() and @stack.daily.validate(@item)

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
    @listenTo(@item, 'error', @popError)
    @listenTo(@item, 'conflict', @markConflict)
    @listenTo(@item, 'update', @show.render)

  popError: (task, err) =>
    @log('Task validation failed')
    @log(err)
    @$('[name=' + k + ']').addClass('error') for k of err when err[k]
    @

  markConflict: =>
    @el.addClass('conflict')

(exports ? this).TaskItem = TaskItem;
