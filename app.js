const express = require('express');
const path = require('path');
const logger = require('morgan');
const createError = require('http-errors');
const passport = require('passport');
require('dotenv').config();
const session = require('./configs/session.config');
require('./configs/hbs.config');
require('./configs/db.config');
require('./configs/passport.config');
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(logger('dev'));
app.use(session);
app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
    res.locals.path = req.path;
    res.locals.currentUser = req.user;
    next();
});



app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

const router = require('./configs/routes.config');
app.use('/', router);


app.use((req, res, next) => {
    next(createError(404, `Page not found`));
});

app.use((error, req, res, next) => {
    console.error(error);
    let status = error.status || 500;

    res.status(status).render('error', {
        message: error.message,
        error: req.app.get('env') === 'development' ? error : {},
    });
});

const port = Number(process.env.PORT || 3000);
app.listen(port, () => {
    console.log(`Ready! Listening on port ${port}`);
});