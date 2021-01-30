const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const gameSchema = new Schema(
    {
        name: {
            type: String,
            required: 'Game name is mandatory',
            trim: true
        },
        genre: {
            type: String,
            required: 'At least one game genre is required',
            enum: ['Action', 'Action-adventure', 'Adventure', 'Role-playing', 'Simulation', 'Strategy', 'Sports', 'MMO', 'Shooter', 'Sandbox', 'Horror', 'Fight', 'Hack "n" Slash'],
        },
        platform: {
            type: String,
            required: 'Platform is required',
            enum: [ 'PS1' ,'PS2', 'PS3' ,'PS4', 'PS5', 'XBOX', 'XBOX 360', 'XBOX One', 'XBOX Series', 'Nintendo64', 'Nintendo GameCube', 'Game Boy', 'Nintendo DS', 'Nintendo Wii', 'Nintendo 2DS', 'Nintendo 3DS', 'Nintendo Wii U', 'Nintendo Switch', 'PC', 'Other']
        },
        image: {
            type: String,
            required: 'A image of your video-game is required'
        },
        price: {
            type: Number,
            required: 'A Game price is required'
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }

        
    }, { timestamps: true });

    gameSchema.virtual('reviews', {
        ref: 'Review',
        localField: '_id',
        foreignField: 'game'
    })


    const Game = mongoose.model('Game', gameSchema);

    module.exports = Game;