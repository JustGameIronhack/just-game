const nodemailer = require('nodemailer');
const user = process.env.EMAIL_USER;
const pass = process.env.EMAIL_PASSWORD;
const appUrl = 'http://localhost:3000';

const transport = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user,
        pass,
    },
});

module.exports.sendValidationEmail = (email, activationToken, name) => {
    transport
        .sendMail({
            to: email,
            from: 'Just Game Team <justgameIronHack@gmail.com>',
            subject: 'Just Game activation account',
            html: `<h1>Hi ${name}</h1> <p>Click on the button below to activate your account ❤️</p> <a href="${appUrl}/activate?token=${activationToken}" style="padding: 10px 20px; color: white; background-color: pink; border-radius: 5px;">Click here</a>`
        });
};

module.exports.incomingMessage = (email, from, name, game, text) => {
    transport
        .sendMail({
            to: email,
            from: 'Just Game Team <justgameIronHack@gmail.com>',
            subject: 'You got a Message!',
            html: `<h1>Hi ${name}</h1> <p>You got a message from ${from} for your game ${game}</p> <p>Don't make the Buyer wait and set you in contact!</p>
            <h3>Message:</h3> <p><em>${text}</em></p> <p>From: <em>${from}</em></p>`
        });
};