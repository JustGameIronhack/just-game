const hbs = require('hbs');
const path = require('path');
const moment = require('moment');
const Game = require('../models/game.model');

hbs.registerPartials(path.join(__dirname, '../views/partials'));

//HELPERS VALIDATIONS ERRORS

hbs.registerHelper('isInvalid', (error) => {
    return error ? 'is-invalid' : '';
});

hbs.registerHelper('formError', (error) => {
    return error ? new hbs.SafeString(`<div class="invalid-feedback">${error}</div>`) : '';
});

// HELPER CHECK ROLE IN VIEWS

hbs.registerHelper('checkRole', (user, role, options) => {
    if (user && user.role === role) {
        return options.fn();
    } else {
        return options.inverse();
    }
});


hbs.registerHelper('stringSpace', (array) => {
    return array.join(", ");
});

hbs.registerHelper('date', (date) => {
    return moment(date).startOf().fromNow();
});


hbs.registerHelper('checkOwner', function (game, user, options) {
    if ((user && user.role === 'admin') || (user && user.id.toString() === game.user.toString())) {
        return options.fn(this);
    } else {
        return options.inverse(this);
    };
});

hbs.registerHelper('previous', (page) => {
    const currentPage = Number(page);
    if (currentPage === 1) {
        return 1;
    } else {
        return currentPage - 1
    }  
});

hbs.registerHelper('next',  (page, gamesLength) => {
    const currentPage = Number(page);
            const maxPage = Math.ceil(gamesLength / 6);
            if(currentPage === maxPage) {
                return maxPage;
            } else {  
                return currentPage + 1;
            }     
});