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
          user: req.user.id,
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
};



module.exports.answer = (req, res, next) => {
  const { userId,  gameId } = req.params;
  const { text } = req.body;
  Promise.all([
    User.findById(userId),
    Game.findById(gameId)
  ])
  .then(([user,  game]) => {
    messageUser = user;
    if (!user) {
      next(createError(404, 'User not found'));
    } else {
      const message = new Message ({
        text: text,
        from: req.user.id,
        to: user.id,
        game: game.id,
        user: req.user.id
      });

      message.save()
        .then(message => {
          res.redirect(`/messages/${req.user.id}`);
        });
    }
  })
  .catch(error => {
    if (error instanceof mongoose.Error.ValidationError) {
      res.render('games/messages', {
        user: messageUser,
        errors: error.errors
      });
    } else {
      next(error);
    }
  });
}