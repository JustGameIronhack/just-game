const mongoose = require('mongoose');
const Game = require('../models/game.model');
const Review = require('../models/review.model');
require('../configs/db.config');
const gamesData = require('../data/games.json');


mongoose.connection.once('open', () => {
    console.info(`Connected to the database ${mongoose.connection.db.databaseName}`);
    mongoose.connection.db.dropDatabase()
        .then(() => console.log(`Database dropped`))
        .then(() => Game.create(gamesData))
        .then(games => {
            console.info(`Added ${games.length} games`);
            const gamesReview = games.map(game => {
                const reviews = gamesData.find(g => g.title === game.title)
                .reviews
                .map(review => {
                    review.game = game.id;
                    return review;
                });
                return Review.create(reviews)
                .then(reviews => console.info(`Added ${reviews ? reviews.length : 0} reviews to game ${game.title}`))
            });
            return Promise.all(gamesReview);
        })
        .then(() => console.info(`All data created!`))
        .catch(error => console.error(error))
        .then(() => process.exit(0))
})