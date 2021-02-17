const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const valorationSchema = new Schema(
    {
        title: {
            type: String,
            required: 'Title is required',
            minlength: [5, 'You need at least 5 characters'],
        },
        rate: {
            type: Number,
            required: 'Rate is required',
            enum: [1, 2, 3, 4, 5],
        },
        text: {
            type: String,
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        seller: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    }
);

const Valoration = mongoose.model('Valoration', valorationSchema);

module.exports = Valoration;