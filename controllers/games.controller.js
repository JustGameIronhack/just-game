const mongoose = require('mongoose');
const Game = require('../models/game.model');
const createError = require('http-errors');
const Review = require('../models/review.model');

module.exports.list = (req, res, next) => {
    const { page } = req.query;
    const limit = 6;
    const skip = (page -1) * limit;
        
    Promise.all([
        Game.find().populate({path: 'user', select: '_id name'}).limit(limit * 1).skip((page - 1) * limit),
        Game.estimatedDocumentCount()
        ])
        .then(([games, count]) => res.render('games/list', {games, count}))
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

module.exports.messages = (req, res, next) => {
    Game.findById(req.params.id)
        .populate('user')
        .populate('messages')
        .then((game) => {
            console.log('GAMEMESSAGE', game);
            res.render('games/messages', { game })
        })
        .catch(next);
};