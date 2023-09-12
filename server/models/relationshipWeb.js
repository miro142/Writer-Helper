const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const relationshipWebSchema = new Schema({
    creator: { 
        type: mongoose.Types.ObjectId, 
        required: true,
        ref: 'User',
        unique: true
    },
    data:{
        type: Object,
        required: true
    }
});

module.exports = mongoose.model('Relationship Web', relationshipWebSchema);