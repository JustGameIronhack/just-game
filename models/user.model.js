const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt');
const Game = require('./game.model');
const Rating = require('./rating.model');
const Message = require('./message.model');
const EMAIL_PATTERN = /^(([^<>()[\]\\.,;:\s@']+(\.[^<>()[\]\\.,;:\s@']+)*)|('.+'))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
const PASSWORD_PATTERN = /^.{8,}$/;
const admins = (process.env.ADMINS_EMAIL || '')
    .split(',')
    .map(admin => admin.trim());

const userSchema = new Schema({
    name: {
        type: String,
        required: 'User name is mandatory',
        trim: true,
        unique: true
    },
    email: {
        type: String,
        required: 'Email is required',
        unique: true,
        lowercase: true,
        trim: true,
        match: [EMAIL_PATTERN, 'Invalid email'],
    },
    password: {
        type: String,
        required: 'Password is required',
        match: [PASSWORD_PATTERN, 'Password needs at least 8 chars'],
    },
    avatar: {
        type: String,
        default: function () {
            return 'https://res.cloudinary.com/djrv6yqfc/image/upload/v1612468494/default_avatar_qvlfsx.png';
        }
    },
    location: {
        type: String,
        required: 'We need your city name',
        default: 'World'
    },
    role: {
        type: String,
        enum: ['admin', 'guest'],
        default: 'guest'
    },
    verified: {
        date: Date,
        token: {
            type: String,
            default: () => Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
        },
    },
    social: {
        google: String,
        steam: String
    },
}, {
    timestamps: true
});

userSchema.virtual('messages', {
    ref: Message.modelName,
    localField: '_id',
    foreignField: 'user',
    options: {
        sort: { createdAt: -1 },
        limit: 10
    }
});

userSchema.virtual('ratings', {
    ref: Rating.modelName,
    localField: '_id',
    foreignField: 'seller',
    options: {
        sort: { createdAt: -1 },
        limit: 10
    }
});

userSchema.pre('save', function (next) {
    if (admins.includes(this.email)) {
        this.role = 'admin';
    }
    if (this.isModified('password')) {
        bcrypt.hash(this.password, 10).then((hash) => {
            this.password = hash,
                next();
        });
    } else {
        next();
    }
});

userSchema.methods.checkPassword = function (passwordToCheck) {
    return bcrypt.compare(passwordToCheck, this.password);
};

const User = mongoose.model('User', userSchema);
module.exports = User;
