const createError = require('http-errors');
const mongoose = require('mongoose');
const Game = require('../models/game.model');
const Message = require('../models/message.model');
const User = require('../models/user.model');

module.exports.create = (req, res, next) => {
  const { gameId } = req.params;
  const { text } = req.body;
  console.log('GAME', text)
  let messageGame;
  Game.findById(gameId)
    .then(game => {
        messageGame =  game;
      if (!game) {
        next(createError(404, 'Game not found'));
      } else {
        const message = new Message ({
          text: text,
          from: req.user.id,
          to: game.user,
          game: game.id
        });

        message.save()
          .then(message => {
            res.redirect(`/game/${game.id}/message`);
          });
      }
    }).catch(error => {
      if (error instanceof mongoose.Error.ValidationError) {
        res.render('games/messages', {
          game: messageGame,
          errors: error.errors
        });
      } else {
        next(error);
      }
    });
};

module.exports.list = (req, res, next) => {
  Promise.all([
    Message.find({ from: req.params.id }).populate('game to from'),
    Message.find({ to: req.params.id }).populate('game to from')
  ])
  .then(([buyMessages, sellMessages]) => res.render('users/messages', { buyMessages, sellMessages }))
  .catch(next);
}