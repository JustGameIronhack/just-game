const express = require('express');
const router = express.Router();
const usersController = require('../controllers/users.controller');
const gamesController = require('../controllers/games.controller');
const ratingsController = require('../controllers/ratings.controller');
const messageController = require('../controllers/messages.controller');
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
router.get('/userInfo/:userId', secure.isAuthenticated, usersController.userInfo);
router.post('/userInfo/:userId', secure.isAuthenticated, ratingsController.create);


//GAMES ROUTES

router.get('/games', gamesController.list);
router.get('/games/new', secure.isAuthenticated, gamesController.create);
router.post('/games/new', secure.isAuthenticated, storageGames.single('image'), gamesController.doCreate);
router.get('/details/:id', secure.isAuthenticated ,gamesController.details);
router.post('/games/:id/delete', secure.isAuthenticated, secure.checkGameOwner, gamesController.delete);
router.get('/games/:id/edit', secure.isAuthenticated, secure.checkGameOwner, gamesController.edit);
router.post('/games/:id/edit', secure.isAuthenticated, secure.checkGameOwner, gamesController.doEdit);
router.get('/games/locations', secure.isAuthenticated, gamesController.locations);

//MESSAGES ROUTES
router.get('/game/:id/message', secure.isAuthenticated, gamesController.messages);
router.post('/game/:gameId/message', secure.isAuthenticated, messageController.create);
router.get('/messages', secure.isAuthenticated, messageController.list);
router.get('/conversation/:conversationId', secure.isAuthenticated, messageController.conversation);
router.post('/conversation/:conversationId', secure.isAuthenticated, messageController.answer);
router.post('/conversation/:id/delete', secure.isAuthenticated, secure.checkMessageOwner, messageController.delete)


module.exports = router;