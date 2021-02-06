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