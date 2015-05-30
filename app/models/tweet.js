var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var TweetSchema = new Schema({

    user_id: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },

    date:{
        type: Date,
        required:true
    }

});

module.exports = mongoose.model('Word', WordSchema);