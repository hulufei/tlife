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

module.exports = mongoose.model('Task', taskSchema);
