const createError = require('http-errors');
const mongoose = require('mongoose');
const User = require('../models/user.model');
const Rating = require('../models/rating.model');

module.exports.create = (req, res, next) => {
  function renderWithErrors(errors) {
    res.status(403).render('users/sellerProfile', {
        rating: req.body,
        user: ratingUser,
        errors: errors,
    });
}
  const { userName } = req.params;
  const { title, rate, text } = req.body;
  
  let ratingUser;
  User.findOne({ name: userName })
    .populate({
      path: 'ratings',
      populate: {
        path: 'user',
        model: 'User'
      }
    })
    .then(user => {
      ratingUser =  user;
      const idchecked = user.ratings.find(rating => rating.user.id === req.user.id)
      if (!user) {
        next(createError(404, 'User not found'));
      } else if (idchecked) {
        renderWithErrors( { text: `You have already rated ${user.name}` }, { rating: req.body }, { user: ratingUser })
      } else {
        const rating = new Rating({
          title: title,
          rate: rate,
          text: text,
          user: req.user.id,
          seller: ratingUser._id
        });
        return rating.save()
          .then(rating => res.redirect(`/userInfo/${ratingUser.name}`));
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

module.exports.delete = (req, res, next) => {
  Rating.findByIdAndDelete(req.params.id)
      .populate({
        path: 'seller',
        model: 'User'
      })
      .then((rating) => {
          if (rating) {
              res.redirect(`/userInfo/${rating.seller.name}?page=1`);
          }else {
              next(createError(404, 'The rating does not exist!'));
          }
      })
      .catch(next);
};