const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const moment = require('moment');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: false
    },
    password: {
        type: String,
        required: false
    }
});

const workorderSchema = new mongoose.Schema({
    username: {
        type: String,
        required: false
    },
    caseNumber: {
        type: String,
        required: false
    },
    customerName: {
        type: String,
        required: false
    },
    serialNumber: {
        type: String,
        required: false
    },
    partReplaced: {
        type: String,
        required: false
    },
    notes: {
        type: String,
        required: false
    },
    created: {
        type: Date,
        default: Date.now
    }
});

const inventorySchema = new mongoose.Schema({
    partNumber: {
        type: String,
        required: true
    },
    cost: {
        type: Number,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    qty: {
        type: Number,
        required: true
    }
});

// Returns user information without password info
userSchema.methods.serialize = function () {
    return {
        username: this.username || '',
    };
};

// Validates password using bcryptjs
userSchema.methods.validatePassword = function (password) {
    return bcrypt.compare(password, this.password);
};

userSchema.statics.hashPassword = function (password) {
    return bcrypt.hash(password, 10);
}

const User = mongoose.model('User', userSchema, 'user');
const Workorder = mongoose.model('Workorder', workorderSchema);
const Inventory = mongoose.model('Inventory', inventorySchema);

module.exports = {
    User,
    Workorder,
    Inventory
};