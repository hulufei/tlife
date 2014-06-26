# Note: To keep consistence, use Manager(TaskItem)'s item in stacks
class TaskItemBase extends Spine.Controller
  render: () =>
    @html(@template(@stack.item))
    @

  template: (item) ->
    item.metasToArray()
    Mustache.render(@tpl, item)

  destroy: () =>
    @stack.release()
    @stack.item.destroy(ajax: !@stack.item.isNew())
    # Remove task from daily tasks
    @stack.daily.tasks =
      (task for task in @stack.daily.tasks when task.id isnt @stack.item.id)


class TaskItemShow extends TaskItemBase
  className: 'task-static'

  elements:
    '.task-metas': 'metas'

  events:
    'click': 'toggleMetas'
    'click .task-modify': 'toggleEdit'
    'click .task-delete': 'destroy'
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

  stopPropagation: (e) ->
    e.stopPropagation()

class TaskItemEdit extends TaskItemBase
  className: 'task-edit'

  events:
    'click .add-task-meta': 'addMeta'
    'click .task-save': 'save'
    'click .task-cancel': 'cancel'

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

  inputMetas: ->
    metas = {}
    @el.find('.task-meta').each ->
      _this = $(this)
      key = $.trim _this.find('[name=metaKey]').val()
      value = $.trim _this.find('[name=metaValue]').val()
      # Ignore meta if key or value is empty
      metas[key] = value if key and value
    metas

  updateDup: ->
    # Expand dup
    @stack.daily.toggleDup()
    attrs =
      text: @el.find('[name=text]').val()
      metas: @inputMetas()
    for task in Task.findAllByAttribute('text', @stack.item.text)
      task.load(attrs)
      task.save()
    # Restore to collapsed view
    @stack.daily.toggleDup()

  save: (e) =>
    e.preventDefault()
    # Reset error
    @$('.error').removeClass('error')
    @stack.el.siblings('.conflict').removeClass('conflict')

    # Update all collapsed tasks
    if @stack.daily.isUniqueView
      @updateDup()
      return

    # Update model
    attrs =
      start: Task.formatTime(@el.find('[name=start]').val())
      end: Task.formatTime(@el.find('[name=end]').val())
      text: @el.find('[name=text]').val()
      metas: @inputMetas()

    @stack.item.load(attrs)
    # Validate should before save, otherwise item validate failed but still saved
    if @stack.daily.validate(@stack.item) then @stack.item.save()

  cancel: =>
    if @stack.item.isNew() then @destroy() else @stack.show.active()

class TaskItem extends Spine.Stack
  tag: 'li'
  className: 'task-item'

  controllers:
    show: TaskItemShow
    edit: TaskItemEdit

  default: 'show'

  constructor: ->
    super
    @append(@show.render())
    @append(@edit.render())
    @listenTo(@item, 'error', @popError)
    @listenTo(@item, 'conflict', @markConflict)
    @listenTo @item, 'update', (task) =>
      # FIXME: Why @item.save not update responsed server id to @item?
      # So manually update item(use .load to alse update reference item in daily tasks)
      @item.load(task)
      @show.render()
      @show.active()

  popError: (task, err) =>
    @log('Task validation failed')
    @log(err)
    @$('[name=' + k + ']').addClass('error') for k of err when err[k]
    @

  markConflict: =>
    @el.addClass('conflict')

(exports ? this).TaskItem = TaskItem;
