const mongoose = require('mongoose');
//use mongoose schema
const Schema = mongoose.Schema;
//define the schema
const CategorySchema = new Schema({

    name: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now()
    }
    
});

module.exports = mongoose.model('categories', CategorySchema);

