const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const messageSchema = new Schema(
    {
        text: {
            type: String,
            required: 'A text is required for your message',
            minlength: [5, 'Write at least 5 chars']
        },
        from: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        to: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        game: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Game'
        },
        conversation: {
            type: String,
        }
    }, { timestamps: true }
);

messageSchema.pre('save', function (next) {
    this.conversation = [this.from, this.to, this.game].map(x => x.toString()).sort().join("");
    next();
});

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;