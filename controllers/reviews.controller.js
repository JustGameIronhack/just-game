const createError = require('http-errors');
const mongoose = require('mongoose');
const Game = require('../models/game.model');
const Review = require('../models/review.model');

module.exports.create = (req, res, next) => {
  const { gameId } = req.params;
  const { title, rate, text } = req.body;
  
  let reviewGame;
  Game.findById(gameId)
    .populate('reviews')
    .then(game => {
      reviewGame =  game;
      if (!game) {
        next(createError(404, 'Game not found'));
      } else {
        const review = new Review({
          title: title,
          rate: rate,
          text: text,
          game: game.id
        })

        return review.save()
          .then(review => res.redirect(`/games/${game.id}`));
      }
    }).catch(error => {
      if (error instanceof mongoose.Error.ValidationError) {
        res.render('posts/detail', {
          game: reviewGame,
          errors: error.errors
        });
      } else {
        next(error);
      }
    });
}