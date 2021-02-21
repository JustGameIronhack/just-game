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

passport.use('google-auth', new GoogleStrategy({
    clientID: process.env.G_CLIENT_ID,
    clientSecret: process.env.G_CLIENT_SECRET,
    callbackURL: process.env.G_REDIRECT_URI || '/authenticate/google/just-game',
}, (accessToken, refreshToken, profile, next) => {
    const googleId = profile.id;
    const name = profile.displayName;
    const email = profile.emails[0] ? profile.emails[0].value : undefined;
    if (googleId && name && email) {
        User.findOne({ $or: [
            { email },
            { 'social.google': googleId }
        ]})
        .then(user => {
            if (!user) {
                user = new User({
                    name,
                    email,
                    password: mongoose.Types.ObjectId(),
                    social: {
                        google: googleId
                    },
                    verified: {
                        date: new Date(),
                        token: null
                    },
                });
                return user.save()
                .then(user => next(null, user))
            } else {
                next(null, user);
            }
        }).catch(next)
    } else {
        next(null, null, { oauth: 'Invalid google oauth response' })
    }
}));


passport.use('steam-auth', new SteamStrategy({
    returnURL: process.env.STEAM_RETURN_URI,
    realm: process.env.STEAM_REALM,
    apiKey: process.env.STEAM_API_KEY,
}, (identifier, profile, next) => {
    if (profile.id && profile.displayName) {
        User.findOne({ 'social.steam': profile.id })
        .then(user => {
            if (!user) {
                const avatar =  profile.photos && profile.photos[2] ? profile.photos[2].value : undefined;
                user = new User({
                    name: profile.displayName,
                    email: `${profile.id}@justgame.com`,
                    password: mongoose.Types.ObjectId(),
                    social: {
                        steam: profile.id
                    },
                    verified: {
                        date: new Date(),
                        token: null
                    },
                    avatar
                });
                return user.save()
                .then(user => next(null, user))
            } else {
                next(null, user);
            }
        }).catch(next);
    } else {
        next(null, null, { oauth: 'Invalid steam oauth response' })
    }  
}));