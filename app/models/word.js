var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var WordSchema = new Schema({

    text: {
        type: String,
        unique: true,
        required: true
    },

    feeling: {
        type: Number,
        required: true
    },

    enabled: {
        type: Boolean,
        required: true
    },

    last_user_id: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },

    word_type:{
        type:String,
        required:true
    }

});

module.exports = mongoose.model('Word', WordSchema);