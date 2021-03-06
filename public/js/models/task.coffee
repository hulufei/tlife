class Task extends Spine.Model
  # Because in the context of a class definition,  `this` is the class object itself
  # (the constructor function), you can assign static properties by using
  # `@property: value`, and call functions defined in parent classes:
  # `@attr 'title', type: 'text'`
  @configure 'Task', 'start', 'text', 'metas', 'end', 'date'

  @extend Spine.Model.Ajax
  @url: '/api/tasks'

  constructor: ->
    super
    # Convert date string to Date Object
    @date = new Date(@date)

  days: [
    'Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'
  ]

  # Format time to hh:mm
  # Note: h -> h:00
  @formatTime: (time) ->
    [h, m] = time.split(':')
    [
      if +h > 9 then h else '0' + (+h),
      if +m > 9 then m else '0' + (+m),
    ].join(':')

  getFormatDate: ->
    @formatedDate or= @date.toLocaleDateString()

  getDay: ->
    @day or= @days[@date.getDay()]

  # For mustache render array
  metasToArray: ->
    @metaItems = (item: {k: k, v: v} for k, v of @metas)

  validate: ->
    timePattern = /^([0-9]|0[0-9]|1[0-9]|2[0-3]):([0-9]|[0-5][0-9])$/

    error =
      # More clear this way
      start: if not timePattern.test(@start) then 'Invalid start time'
      # Below is the same as above through
      end: if not timePattern.test(@end) then 'Invalid end time'
      text: if not $.trim(@text) then 'Task should not be empty'

    for k of error
      # Validate failed
      return error if error[k]
    return null

(exports ? this).Task = Task;
