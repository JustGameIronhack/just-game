const express = require('express');
const router = express.Router();
const usersController = require('../controllers/users.controller');

router.get('/', (req, res, next) => {
    res.render('index');
})

router.get('/register', usersController.register);
router.post('/register', usersController.doRegister);
router.get('/activate', usersController.activate);
router.get('/login', usersController.login);
router.post('/login', usersController.doLogin);
router.post('/logout', usersController.logout);
module.exports = router;