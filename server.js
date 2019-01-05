const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const moment = require('moment');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const BasicStrategy = require('passport-http').BasicStrategy;

const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

// Implement routers from ./users & ./auth
const {
    router: usersRouter
} = require('./users');

const {
    router: authRouter,
    localStrategy,
    jwtStrategy
} = require('./auth');

const {PORT, CLIENT_ORIGIN, DATABASE_URL} = require('./config')

const app = express();

// import models from ./models/user
const {
    User
} = require('./models/user');

app.use(morgan('common'));
app.use(bodyParser.json());
app.use(express.json());
// app.use(express.static('public'))

//Authentication
passport.use(localStrategy);
passport.use(jwtStrategy);

//Tells our app to use users and authentication routes
app.use('/api/users/', usersRouter);
app.use('/api/auth/', authRouter);

//Middleware for authenticating users
const jwtAuth = passport.authenticate('jwt', {
    session: false
});

//Use cors since this is being served on Heroku
app.use(
    cors({
        origin: CLIENT_ORIGIN
    })
);

//////////////////
//TEST Endpoints//
//////////////////

app.get('/api/users', (req, res) => {
	res.json({ok: 'true - /users/'});
});

app.get('/api/auth', (req, res) => {
	res.json({ok: 'true - /auth/'});
});

app.post('/api/post', (req, res) => {
	res.json({ok: 'post succes'});
});

let server;

// this function connects to our database, then starts the server
function runServer(databaseUrl, port = PORT) {
    return new Promise((resolve, reject) => {
        mongoose.connect(databaseUrl, err => {
            if (err) {
                return reject(err);
            }
            server = app.listen(port, () => {
                    console.log(`Your app is listening on port ${port}`);
                    resolve();
                })
                .on('error', err => {
                    mongoose.disconnect();
                    reject(err);
                });
        });
    });
}

// this function closes the server, and returns a promise. we'll
// use it in our integration tests later.
function closeServer() {
    return mongoose.disconnect().then(() => {
        return new Promise((resolve, reject) => {
            console.log('Closing server');
            server.close(err => {
                if (err) {
                    return reject(err);
                }
                resolve();
            });
        });
    });
}

// if server.js is called directly (aka, with `node server.js`), this block
// runs. but we also export the runServer command so other code (for instance, test code) can start the server as needed.
if (require.main === module) {
    runServer(DATABASE_URL).catch(err => console.error(err));
}

module.exports = {
    runServer,
    app,
    closeServer
};