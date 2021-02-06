const mongoose = require('mongoose');
const Game = require('../models/game.model');
const createError = require('http-errors');

module.exports.list = (req, res, next) => {
    Game.find()
        .then((games) => {
            res.render('games/list', { games });
        })
        .catch(next);
};

module.exports.create = (req, res, next) => {
    res.render('games/new');
};

module.exports.doCreate = (req, res, next) => {
    Game.create(req.body)
        .then((game) => res.redirect(`/game/${game.id}`))
        .catch((error) => {
            console.log(req.body)
            console.error(error)
            if (error instanceof mongoose.Error.ValidationError) {
                res.render('games/new', {
                    errors: error.errors,
                    game: req.body
                });
            }else {
                next(error);
            }
        });
};