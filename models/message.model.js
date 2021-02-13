const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const messageSchema = new Schema(
    {
        text: {
            type: String,
            required: 'A text is required for your message',
            minlength: [5, 'Write at least 5 chars']
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        game: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Game'
        },
    }
);

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;