const express = require('express');
const router = express.Router();
const usersController = require('../controllers/users.controller');
const gamesController = require('../controllers/games.controller');
const reviewController = require('../controllers/reviews.controller');
const passport = require('passport');
const GOOGLE_SCOPES = ['https://www.googleapis.com/auth/userinfo.email', 'https://www.googleapis.com/auth/userinfo.profile'];
const secure = require('../middlewares/secure.middleware');
const storageUsers = require('./storageUsers.config');
const storageGames = require('./storageGames.config');


router.get('/', (req, res, next) => {
    res.render('index');
});


//USERS ROUTES
router.get('/register', usersController.register);
router.post('/register', usersController.doRegister);
router.get('/activate', usersController.activate);
router.get('/login', usersController.login);
router.post('/login', usersController.doLogin);
router.get('/authenticate/google', passport.authenticate('google-auth', {
    scope: GOOGLE_SCOPES
}));
router.get('/authenticate/google/just-game', usersController.loginWithIDP('google-auth'));
router.get('/authenticate/steam', passport.authenticate('steam-auth'));
router.get('/steam/return', usersController.loginWithIDP('steam-auth'));
router.post('/logout', usersController.logout);
router.get('/profile', secure.isAuthenticated, usersController.profile);
router.post('/profile', secure.isAuthenticated, storageUsers.single('avatar'), usersController.doProfile);
router.get('/users', secure.isAuthenticated, secure.checkRole('admin'), usersController.list);

//GAMES ROUTES

router.get('/games', gamesController.list);
router.get('/games/new', secure.isAuthenticated, gamesController.create);
router.post('/games/new', secure.isAuthenticated, storageGames.single('image'), gamesController.doCreate);
router.get('/details/:id', secure.isAuthenticated ,gamesController.details);
router.post('/games/:gameId/reviews', secure.isAuthenticated, reviewController.create);
router.post('/games/:id/delete', secure.isAuthenticated, secure.checkRole('admin'), gamesController.delete);



module.exports = router;