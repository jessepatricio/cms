const mongoose = require('mongoose');
const URLSlugs = require('mongoose-url-slugs');
//use mongoose schema
const Schema = mongoose.Schema;
//define the schema
const PostSchema = new Schema({

    //relationships
    category: {
        type: Schema.Types.ObjectId,
        ref: 'categories'
    },

    user: {
        type: Schema.Types.ObjectId,
        ref: 'users'
    },

    comments: [{
        type: Schema.Types.ObjectId,
        ref: 'comments'
    }],

   //fields

    title: {
        type: String,
        required: true,

    },

    status: {
        type: String,
        default: 'public',
        
    },

    allowComments: {
        type: Boolean,
        required: true,
        
    },

    body: {
        type: String,
        required: true,
        
    },

    file: {
        type: String   
        
    },

    date: {
        type: Date,
        default: Date.now()
    },

    slug: {

        type: String
    }
    

}, { usePushEach: true });


PostSchema.plugin(URLSlugs('title', {field: 'slug'}));


module.exports = mongoose.model('posts', PostSchema);

