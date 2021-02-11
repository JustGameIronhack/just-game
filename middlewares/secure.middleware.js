const createError = require('http-errors');
const {
    model
} = require('mongoose');
const Game = require('../models/game.model');
const mongoose = require('mongoose');

module.exports.isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        next();
    } else {
        res.status(401).redirect('/login');
    }
};

module.exports.checkRole = (role) => {
    return (req, res, next) => {
        if (req.user.role === role) {
            next();
        } else {
            res.status(403).render('errors/403');
        };
    };
};

module.exports.checkOwner = (req, res, next) => {
    if (req.user.role === 'admin') {
        return next()
    }
    Game.findById(req.params.id)
        .then((game) => {
            console.log(game.user)
            if (game.user.toString() === req.user.id.toString()) {
                next();
            } else {
                next(createError(403, 'You are not allow to delete this game'));
            }
        })
        .catch(next);
};
