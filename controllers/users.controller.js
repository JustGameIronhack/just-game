const mongoose = require('mongoose');
const User = require('../models/user.model');
const httpError = require('http-errors');
const mailer = require('../configs/mailer.config');

module.exports.register = (req, res, next) => {
    res.render('users/register');
};

module.exports.doRegister = (req, res, next) => {
    function renderWithErrors(errors) {
        res.status(400).render('users/register', {
            user: req.body,
            errors: errors,
        });
    }
    User.findOne({ email: req.body.email })
        .then((user) => {
            if (user) {
                renderWithErrors({ email: 'Email already registered' });
            }else {
               return User.create(req.body).then((user) => {
                mailer.sendValidationEmail(user.email, user.verified.token, user.name);
                res.redirect('/login');
               });
            }
        })
        .catch((error) => {
            if (error instanceof mongoose.Error.ValidationError) {
                renderWithErrors(error.errors);
            }else {
                next(error);
            }
        })
}

module.exports.activate = (req, res, next) => {
    User.findOneAndUpdate(
        { 'verified.token': req.query.token },
        { $set: { verified: { date: new Date(), token: null } } },
        { runValidators: true }
    ).then( user => {
        if (!user) {
            next(httpError(404, 'Invalid activation token'));
        }else {
            res.redirect('/login');
        }
    }).catch(next);
};