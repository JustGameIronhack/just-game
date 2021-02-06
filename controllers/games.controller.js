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
    /* return res.json(req.body) */
    const image = {};
    if (req.file) {
        image.image = req.file.path
    }
    Object.assign(req.body, image)
    Game.create({
        ...req.body,
        user: req.user.id
    })
        .then((game) => res.redirect(`/games`))
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