const mongoose = require('mongoose');
//use mongoose schema
const Schema = mongoose.Schema;
//define the schema
const CommentSchema = new Schema({
    
    user: {

        type: Schema.Types.ObjectId,
        ref: 'users',
        required: true

    },

    body: {
          
        type: String,
        required: true
    },

    approveComment:{
        type: Boolean,
        default: false
    },

    date: {
        type: Date,
        default: Date.now()
    }
    
});

module.exports = mongoose.model('comments', CommentSchema);