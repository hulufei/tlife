var mongoose = require('mongoose');
var crypto = require('crypto');
var Schema = mongoose.Schema;

var userSchema = new Schema({
  email: { type: String, unique: true },
  hashedPassword: String,
  salt: String
});

userSchema
	.virtual('password')
	.get(function() { return this._password; })
	.set(function(password) {
		this._password = password;
		this.salt = this.makeSalt();
		this.hashedPassword = this.hash(password);
	});

/**
 * Instances methods
 */
userSchema.methods = {
	authenticate: function(password) {
		return this.hash(password) === this.hashedPassword;
	},
	makeSalt: function() {
		return Math.round((new Date().valueOf() * Math.random())) + '';
	},
	hash: function(password) {
		if (!password) return '';
		return crypto.createHmac('sha1', this.salt).update(password).digest('hex');
	}
};

mongoose.model('User', userSchema);
