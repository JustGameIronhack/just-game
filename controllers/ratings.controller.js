const createError = require('http-errors');
const mongoose = require('mongoose');
const User = require('../models/user.model');
const Rating = require('../models/rating.model');

module.exports.create = (req, res, next) => {
  const { userName } = req.params;
  const { title, rate, text } = req.body;
  
  let ratingUser;
  User.findOne({ name: userName })
    .populate('ratings')
    .then(user => {
      ratingUser =  user;
      if (!user) {
        next(createError(404, 'User not found'));
      } else {
        const rating = new Rating({
          title: title,
          rate: rate,
          text: text,
          user: req.user.id,
          seller: userId
        });
        return rating.save()
          .then(rating => res.redirect(`/userInfo/${userId}`));
      }
    }).catch(error => {
      if (error instanceof mongoose.Error.ValidationError) {
        res.render('users/sellerProfile', {
          rating: req.body, 
          user: ratingUser,
          errors: error.errors
        });
      } else {
        next(error);
      }
    });
};