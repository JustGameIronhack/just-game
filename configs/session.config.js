const expressSession = require('express-session');
const connectMongo = require('connect-mongo');
const mongoose = require('mongoose');
const MongoStore = connectMongo(expressSession);

const session = expressSession({
    secret: process.env.SESSION_SECRET || `${Math.random().toString(10)}`,
    saveUninitialized: false,
    resave: false,
    cookie: {
        secure: process.env.SESSION_SECURE || false,
        httpOnly: true,
        maxAge: process.env.SESSION_MAX_AGE,
    },
    store: new MongoStore({
        mongooseConnection: mongoose.connection,
        ttl: process.env.SESSION_MAX_AGE,
    })
});

module.exports = session;