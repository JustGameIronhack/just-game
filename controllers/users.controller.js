const mongoose = require('mongoose');
const User = require('../models/user.model');
const httpError = require('http-errors');
const mailer = require('../configs/mailer.config');
const passport = require('passport');
const Game = require('../models/game.model');
const Rating = require('../models/rating.model');

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

    const { password, passwordMatch} = req.body;
    if (password && password !== passwordMatch) {
        renderWithErrors({passwordMatch: 'The password do not match!'});
    }else {
        User.findOne({ $or: [{ email: req.body.email }, { name: req.body.name }]})
        .then((user) => {
            if (user) {
                renderWithErrors({ email: 'Email or Name already registered', name: 'Name or Email already registered' });
            } else { 
               return User.create(req.body).then((user) => {
                mailer.sendValidationEmail(user.email, user.verified.token, user.name);
                req.flash('data', JSON.stringify({ verification: true }))
                res.redirect('/login');
               });
            }
        })
        .catch((error) => {
            if (error instanceof mongoose.Error.ValidationError) {
                renderWithErrors(error.errors);
            } else {
                next(error);
            }
        });
    }
};

module.exports.activate = (req, res, next) => {
    User.findOneAndUpdate(
        { 'verified.token': req.query.token },
        { $set: { verified: { date: new Date(), token: null } } },
        { runValidators: true }
    ).then( user => {
        if (!user) {
            next(httpError(404, 'Invalid activation token'));
        } else {
            res.redirect('/login');
        }
    }).catch(next);
};

module.exports.login = (req, res, next) => {
    res.render('users/login');
};

module.exports.doLogin = (req, res, next) => {
    passport.authenticate('local-auth', (error, user, validations) => {
        if (error) {
            next(error);
        } else if (!user) {
            res.status(400).render('users/login', { user: req.body, errors: validations });
        } else {
            req.login(user, error => {
                if (error) next(error);
                else res.redirect('/games?page=1'); 
            });
        }
    }) (req, res, next);
};


module.exports.loginWithIDP = (strategy) => {
    return (req, res, next) => {
        passport.authenticate(strategy, (error, user, validations) => {
            if (error) {
                next(error);
            } else if (!user) {
                res.status(400).render('users/login', { user: req.body, errors: validations });
            } else {
                req.login(user, error => {
                    if (error) next(error);
                    else res.redirect('/games?page=1');
                });
            }
        }) (req, res, next);
    };
};



module.exports.profile = (req, res, next) => {
    User.findById(req.user.id)
        .then((user) => {
            res.render('users/profile', { user });
        })
        .catch(next);
};

module.exports.doProfile = (req, res, next) => {
    function renderWithErrors(errors) {
        Object.assign(req.user, req.body);
        res.status(400).render('users/profile', {
            user: req.user,
            errors: errors,
        });
    }
    const { password, passwordMatch, email, name, location} = req.body;
    if (password && password !== passwordMatch) {
        renderWithErrors({ passwordMatch: 'The password do not match!'});
    }else {
        const updateFields = {};
        if (name) {
            updateFields.name = name;
        }
        if (req.file) {
            updateFields.avatar = req.file.path;
        }
        if (password) {
            updateFields.password = password;
        }
        if (email) {
            updateFields.email = email;
        }
        if (location) {
            updateFields.location = location;
        }
        Object.assign(req.user, updateFields);
        req.user.save()
            .then((user) => {
                req.login(user, error => {
                    if (error) next(error);
                    else res.redirect('/profile');
                });
            })
            .catch(error => {
                if (error instanceof mongoose.Error.ValidationError) {
                    renderWithErrors(error.errors);
                }else {
                    next(error);
                }
            });
    }
};

module.exports.logout = (req, res, next) => {
    req.logout();
    res.redirect('/login');
};

module.exports.list = (req, res, next) => {
    User.find()
        .then(users => res.render('users/list', { users }))
        .catch(next);
};

/* module.exports.userInfo = (req, res, next) => {
    const { userName } = req.params;
    User.findOne({ name: userName })
        .populate({
            path: 'ratings',
            populate: {
                path: 'user',
                model: 'User'
            }
        })
        .sort({ createdAt: - 1 })
        .then(user => {
            res.render('users/sellerProfile', { user });
        })
        .catch(next);
}; */


module.exports.userInfo = (req, res, next) => {
    const { userName } = req.params;
    const { page } = req.query;
    let limit = 3;
    User.findOne({ name: userName })
        .then(user => {
            Promise.all([
                Rating.find({ seller: user.id }).limit(limit * 1).skip((page - 1) * limit).populate('user seller ratings').sort({ createdAt: - 1 }),
                Rating.countDocuments({ seller: user.id })
            ])
            .then(([ratings, count]) => {
                console.log(count)
                res.render('users/sellerProfile', { user, ratings, count });
            })
            .catch(next);
        });
};

