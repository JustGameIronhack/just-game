const express = require('express');
const router = express.Router();
const usersController = require('../controllers/users.controller');

router.get('/', (req, res, next) => {
    res.render('index');
})

router.get('/register', usersController.register);

module.exports = router;