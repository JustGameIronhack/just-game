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
  Message.find({ $or: [{ from: req.user.id }, { to: req.user.id }]})
    .populate('game from to')
    .sort({ createdAt: -1 })
    .then(messages => {
      messages = messages.reduce((acc, el) => {
        const conversations = acc.map(x => x.conversation)

        if (conversations.includes(el.conversation)) {
          return acc
        }

        return [...acc, el]
      }, [])

      res.render('users/messages', { messages });
    })
    .catch(next)
};

module.exports.conversation = (req, res, next) => {
  const { conversationId } = req.params;
  Message.find( {conversation: conversationId})
    .sort({ createdAt: -1 })
    .populate('game from to')
    .then(messages => {
     const to = messages.find(message => message.from.id !== req.user.id)
      res.render('games/conversation', { messages, to, conversationId })
    })
    .catch(next);
};


module.exports.answer = (req, res, next) => {
  const { text, toId, gameId } = req.body;
  const { conversationId } = req.params;
      const newMessage = new Message ({
        text: text,
        from: req.user.id,
        to: toId,
        game: gameId,
      });
      newMessage.save()
        .then(message => {
          res.redirect(`/conversation/${conversationId}`);
        })
        .catch(error => {
          if (error instanceof mongoose.Error.ValidationError) {
            res.render('games/conversation', {
              message: text,
              errors: error.errors
            });
          } else {
            next(error);
          }
        });
}