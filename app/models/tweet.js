var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var TweetSchema = new Schema({

    user_id: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },

    content: {
        type: String,
        required: true
    },

    /*
    words_ids: [{
        type: Schema.Types.ObjectId,
        ref: 'Word'
    }],
    */

    date:{
        type: Date,
        required: true
    }

});

module.exports = mongoose.model('Tweet', TweetSchema);