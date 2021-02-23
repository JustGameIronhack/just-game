const mongoose = require('mongoose');
const Game = require('../models/game.model');


module.exports.index = (req, res, next) => {
    Game.find().populate('User').sort({ createdAt: -1 })
        .then(games => {
            console.log('GAMES', games[0].image);
            res.render('index', { games });
        })
        .catch(next);
};