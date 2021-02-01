const passport = require('passport');
const mongoose = require('mongoose');
const createError = require('http-errors');
const User = require('../models/user.model');
const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const SteamStrategy = require('passport-steam').Strategy;

passport.serializeUser((user, next) => {
    next(null, user.id);
});

passport.deserializeUser((id, next) => {
    User.findById(id)
        .then(user => next(null, user))
        .catch(next);
});

passport.use('local-auth', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
}, (email, password, next) => {
    User.findOne({ email })
        .then(user => {
            if (!user) {
                next(null, null, { email: 'Invalid email or password' });
            } else {
                return user.checkPassword(password)
                    .then(match => {
                        if (match) {
                            if (user.verified && user.verified.date) {
                                next(null, user);
                            } else {
                                next(null, null, { email: 'Your account is not validated jet, please check your email' });
                            }
                        } else {
                            next(null, null, { email: 'Invalid email or password' });
                        }
                    })
            }
        }).catch(next)
}));