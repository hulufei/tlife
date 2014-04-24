#= require ../lib/spine/src/spine

class App extends Spine.Controller
  constructor: ->
    super
    @log('Initialized')

app = new App;
