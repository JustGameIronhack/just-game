const express = require('express');
const router = express.Router();
const usersController = require('../controllers/users.controller');
const passport = require('passport');
const GOOGLE_SCOPES = ['https://www.googleapis.com/auth/userinfo.email', 'https://www.googleapis.com/auth/userinfo.profile'];


router.get('/', (req, res, next) => {
    res.render('index');
})

router.get('/register', usersController.register);
router.post('/register', usersController.doRegister);
router.get('/activate', usersController.activate);
router.get('/login', usersController.login);
router.post('/login', usersController.doLogin);
router.get('/authenticate/google', passport.authenticate('google-auth', {
    scope: GOOGLE_SCOPES
}))
router.get('/authenticate/google/just-game', usersController.loginWithGoogle);
router.post('/logout', usersController.logout);
router.get('/steam',
    passport.authenticate('steam-auth', {
        failureRedirect: '/login'
    }),
    (req, res) => {
        res.redirect('/');
    });
router.get('/steam/return',
    (req, res, next) => {
        req.url = req.originalUrl;
        next();
    },
    passport.authenticate('steam-auth', {
        failureRedirect: '/login'
    }),
    (req, res) => {
        res.redirect('/');
    });
module.exports = router;