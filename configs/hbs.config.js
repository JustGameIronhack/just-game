const hbs = require('hbs');
const path = require('path');

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
})


hbs.registerHelper('stringSpace', (array) => {
    return array.join(", ");
})