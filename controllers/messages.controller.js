const createError = require('http-errors');
const mongoose = require('mongoose');
const Game = require('../models/game.model');
const Message = require('../models/message.model');
const mailer = require('../configs/mailer.config');
const { messages } = require('./games.controller');

module.exports.create = (req, res, next) => {
  const { gameId } = req.params;
  const { text } = req.body;
  let messageGame;
  Game.findById(gameId)
    .populate('user')
    .then(game => {
        messageGame =  game;
      if (!game) {
        next(createError(404, 'Game not found'));
      } else {
        const message = new Message ({
          text: text,
          from: req.user.id,
          to: game.user.id,
          game: game.id
        });
        return message.save()
          .then(message => {
            mailer.incomingMessage(game.user.email, req.user.name, game.user.name, game.title, text);
            res.redirect(`/messages`);
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
        const conversations = acc.map(x => x.conversation);
        if (conversations.includes(el.conversation)) {
          return acc;
        }
        return [...acc, el];
      }, []);

      res.render('users/messages', { messages });
    })
    .catch(next);
};

module.exports.conversation = (req, res, next) => {
  const { conversationId } = req.params;
  const { page } = req.query;
  let limit = 6;
  Promise.all([
    Message.find( {conversation: conversationId}).limit(limit * 1).skip((page - 1) * limit).sort({ createdAt: -1 }).populate('game from to'),
    Message.countDocuments({conversation: conversationId})
  ])
    .then(([messages, count]) => {
     let to = messages.find(message => message.from.id !== req.user.id); 
     if (!to) {
       to = messages[0].game.user  
     } else {
       to = to.from._id
     }
      res.render('games/conversation', { messages, to, conversationId, count });
    })
    .catch(next);
};


module.exports.answer = (req, res, next) => {
  const { text, toId } = req.body;
  const { conversationId } = req.params;
  let previousMessages;
  Message.find({conversation: conversationId})
    .populate('game from to')
    .then(messages => {
      previousMessages = messages;
        const newMessage = new Message ({
          text: text,
          from: req.user.id,
          to: toId,
          game: messages[0].game.id,
        });
         return newMessage.save()
          .then(message => {
            res.redirect(`/conversation/${conversationId}?page=1`)  
          }); 
    })
    .catch(error => {
        if (error instanceof mongoose.Error.ValidationError) {
          res.render('games/conversation', {
            message: req.body,
            conversationId,
            messages: previousMessages.sort((a, b) => b.createdAt - a.createdAt),
            errors: error.errors
          });
        } else {
          next(error);
        }
    });
};

module.exports.delete = (req, res, next) => {
  Message.findByIdAndDelete(req.params.id)
      .then((message) => {
          if (message) {
              res.redirect(`/conversation/${message.conversation}?page=1`);
          }else {
              next(createError(404, 'The message does not exist!'));
          }
      })
      .catch(next);
};
