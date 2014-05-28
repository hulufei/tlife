var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var taskSchema = new Schema({
  start: { type: String, required: true },
  text: { type: String, required: true },
  metas: {},
  end: { type: String, required: true },
  date: { type: Date, default: Date.now },
  user: { type: Schema.Types.ObjectId, ref: 'User' }
});

// Transform _id to id, match FrontEnd model schema
// Mongoose assigns each of your schemas an id virtual getter by default
// which returns the documents _id field cast to a string,
// or in the case of ObjectIds, its hexString.
// see: http://mongoosejs.com/docs/guide.html#id
//
// Ensure virtual fields are serialised
taskSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Task', taskSchema);
