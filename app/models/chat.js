var mongoose = require('mongoose'),
	crypto = require("crypto"),
    Schema = mongoose.Schema;

var ChatSchema = new Schema({

	room : {
		type: String,
		unique: true
	},

	user1: {
		type: String,
		unique: true,
		required: true
	},

	user2: {
		type: String,
		unique: true,
		required: true
	},

	messages: [{
		type : Schema.Types.ObjectId,
		ref : 'Message'
	}],

	isActive: Boolean


},{

toObject: {
		virtuals: true
	}, toJSON: {
		virtuals: true
	}
});

ChatSchema.post('save', function (doc) {
    var chat = this;
    var concat = 'chat' + chat.user1 + chat.user2;
    console.log(concat);
	var hash = crypto.createHash('md5').update(concat).digest('hex');

	chat.room = hash;

});

module.exports = mongoose.model('Chat', ChatSchema);