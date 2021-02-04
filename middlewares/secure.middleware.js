const createError = require('http-errors');

module.exports.isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        next();
    } else {
        res.status(401).redirect('/login');
    }
};

module.exports.checkRole = (role) => {
    return (req, res, next) => {
        if (req.user.role === role) {
            next();
        } else {
            res.status(403).render('errors/403');
        };
    };
};