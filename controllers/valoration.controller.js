const createError = require('http-errors');
const mongoose = require('mongoose');
const User = require('../models/user.model');
const Valoration = require('../models/valoration.model');

module.exports.create = (req, res, next) => {
  const { userId } = req.params;
  const { title, rate, text } = req.body;
  
  let valorationUser;
  User.findById(userId)
    .populate('valorations')
    .then(user => {
      valorationUser =  user;
      if (!user) {
        next(createError(404, 'User not found'));
      } else {
        const valoration = new Valoration({
          title: title,
          rate: rate,
          text: text,
          user: req.user.id,
          seller: userId
        });
        return valoration.save()
          .then(valoration => res.redirect(`/userInfo/${userId}`));
      }
    }).catch(error => {
      if (error instanceof mongoose.Error.ValidationError) {
        res.render('users/sellerProfile', {
          valoration: req.body, 
          user: valorationUser,
          errors: error.errors
        });
      } else {
        next(error);
      }
    });
};