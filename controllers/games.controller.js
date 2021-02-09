const mongoose = require('mongoose');
const Game = require('../models/game.model');
const createError = require('http-errors');
const Review = require('../models/review.model');

module.exports.list = (req, res, next) => {
    Game.find()
        .populate('user')
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
        image.image = req.file.path;
    }
    Object.assign(req.body, image);
    Game.create({
        ...req.body,
        user: req.user, 
    })
        .then((game) => res.redirect(`/games`))
        .catch((error) => {
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

module.exports.details = (req, res, next) => {
    
    Game.findById(req.params.id)
        /* .populate('reviews') */
        .populate({
            path: "reviews",
            populate: {
                path: "user"
            }
        })
        .then((game) => {
            console.log(game)
            if (game) {
                res.render('games/details', { game });
            } else {
                res.redirect('/games');
            }
        })
        .catch(next);
};

module.exports.delete = (req, res, next) => {
    Game.findByIdAndDelete(req.params.id)
        .then((game) => {
            if (game) {
                res.redirect('/games');
            }else {
                next(createError(404, 'The game doesn´t exist!'))
            }
        })
        .catch(next);
};

