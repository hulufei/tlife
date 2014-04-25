#= require ../lib/jquery/dist/jquery
#= require ../lib/spine/src/spine
#= require ../lib/spine/src/ajax
#= require models/task

class App extends Spine.Controller
  constructor: ->
    super
    Task.fetch()
    @log('Initialized')

app = new App
