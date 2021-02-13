const mongoose = require('mongoose');
const Game = require('../models/game.model');
const createError = require('http-errors');
const Review = require('../models/review.model');

module.exports.list = (req, res, next) => {
    const { page } = req.query;
    const limit = 6;
    console.log('PAGE', page)
    const skip = (page -1) * limit
    console.log('SKIP', skip)    
    Game.aggregate( [
        { $facet: {
            totalCount: [{ $count:"total" }],
            pagination: [{ $skip: skip }, { $limit: limit }]
        }}
     ])
     .then((games) => {
         const arrGames = games[0].pagination;
         const count = games[0].totalCount[0].total;
         console.log('GAMES', games)
        res.render('games/list', { count, arrGames });
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
        .then((game) => res.redirect(`/details/${game.id}`))
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
        .populate({
            path: "reviews",
            populate: {
                path: "user"
            }
        })
        .then((game) => {
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
                next(createError(404, 'The game doesn´t exist!'));
            }
        })
        .catch(next);
};

module.exports.edit = (req, res, next) => {
    Game.findById(req.params.id)  
        .then((game) => {
            if (game) {
                res.render('games/edit', { game });
            } else {
                next(createError(404, 'Game does not exist'));
            }
        }).catch(next);
};

module.exports.doEdit = (req, res, next) => {
    Game.findByIdAndUpdate(req.params.id, { $set: req.body }, { runValidators: true })
        .then((game) => {
            if (game) {
                res.render('games/details', { game });
            } else {
                next(createError(404, 'Game does not exist'));
            }
        })
        .catch((error) => {
            if (error instanceof mongoose.Error.ValidationError) {
                const game = req.body;
                game.id = req.params.id;
                res.render('games/edit', {
                    errors: error.errors,
                    game: game
                });
            } else {
                next(error);
            }
        });
};