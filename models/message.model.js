const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const messageSchema = new Schema(
    {
        text: {
            type: String,
            required: 'A text is required for your message',
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        game: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Game'
        }
    }
);

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;