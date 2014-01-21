var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var taskSchema = new Schema({
  start: String,
  text: String,
  metas: {},
  end: String,
  date: { type: Date, default: Date.now },
  user: { type: Schema.Types.ObjectId, ref: 'User' }
});

mongoose.model('Task', taskSchema);
