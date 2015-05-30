var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var TweetContentSchema = new Schema({

    tweet_id: {
        type: Schema.Types.ObjectId,
        ref: 'Tweet'
    },

    word_id:{
        type: Schema.Types.ObjectId,
        ref: 'Tweet'
    }

});

module.exports = mongoose.model('Word', WordSchema);