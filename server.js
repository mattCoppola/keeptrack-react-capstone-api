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
    User,
    Workorder,
    Inventory
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

Use cors since this is being served on Heroku
app.use(
    cors({
        origin: CLIENT_ORIGIN
    })
);

///////////////////////
//Workorder Endpoints//
///////////////////////

// Create New Workorder //

app.post('/api/auth/dashboard', jwtAuth, (req, res) => {
    console.log('POSTing new Workorder');
    let newWorkorder = req.body;
    console.log(newWorkorder);
    Workorder.create(newWorkorder)
    .then(created => {
        res.status(201).json(created);
    })
    .catch(err => {
        console.log('Error: ', err);
        return res.status(500).json({
            error: 'internal server error'
        });
    });
});

// Retrieve Workorders //

app.get('/api/auth/dashboard', jwtAuth, (req, res) => {
    console.log('GETting Workorders');
    Workorder.find()
        .sort(
            "created"
        )
        .then(function (results) {
            let resultsOutput = [];
            results.map(function (result) {
                resultsOutput.push(result);
            });
            res.json({
                resultsOutput
            });
        })
        .catch(function (err) {
            console.error(err);
            res.status(500).json({
                message: 'Internal server error'
            });
        });
});

// PUT (update) Workorder //

app.put('/api/auth/workorder/:id', (req, res) => {
    console.log('Updating Workorder', req.body);
    Workorder.findByIdAndUpdate(req.params.id, {
        $set: {
            "username": req.body.username,
            "caseNumber": req.body.caseNumber,
            "customerName": req.body.customerName,
            "serialNumber": req.body.serialNumber,
            "partReplaced": req.body.partReplaced,
            "notes": req.body.notes
        }
    })
    .then(function (result) {
        return res.status(204).end();
    }).catch(function (err) {
        return res.status(500).json({
            message: 'Internal Server error'
        });
    });
});


// Delete Workorders //

app.delete('/api/auth/workorder/:id', jwtAuth, (req, res) => {
    console.log('Deleting ID: ', req.params.id);
    Workorder.findByIdAndRemove(req.params.id)
    .then(function (workorder) {
        return res.status(200).end();
    }).catch(function (err) {
        return res.status(500).json({
            message: 'Internal Server Error'
        });
    });
});

///////////////////////
//Inventory Endpoints//
///////////////////////

// Create New Inventory //

app.post('/api/auth/inventory', (req, res) => {
    console.log('POSTing new Inventory');
    let newInventory = req.body;
    console.log(newInventory);
    Inventory.create(newInventory)
    .then(created => {
        res.status(201).json(created);
    })
    .catch(err => {
        console.log('Error: ', err);
        return res.status(500).json({
            error: 'internal server error'
        });
    });
});


// Retrieve Inventory //

app.get('/api/auth/inventory', jwtAuth, (req, res) => {
    console.log('GETting Inventory');
    Inventory.find()
        .then(function (inventory) {
            let inventoryItems = [];
            inventory.map(function (item) {
                inventoryItems.push(item);
            });
            res.json({
                inventoryItems
            });
        })
        .catch(function (err) {
            console.error(err);
            res.status(500).json({
                message: 'Internal server error'
            });
        });
});

// PUT (update) Inventory //

app.put('/api/auth/inventory/:id', (req, res) => {
    console.log('Updating Inventory', req.body);
    Inventory.findByIdAndUpdate(req.params.id, {
        $inc: {
            "qty": -1
        }
    })
    .then(function (result) {
        return res.status(204).end();
    }).catch(function (err) {
        return res.status(500).json({
            message: 'Internal Server error'
        });
    });
});

// Delete Inventory //

app.delete('/api/auth/inventory/:id', jwtAuth, (req, res) => {
    console.log('Deleting ID: ', req.params.id);
    Inventory.findByIdAndRemove(req.params.id)
    .then(function (item) {
        return res.status(200).end();
    }).catch(function (err) {
        return res.status(500).json({
            message: 'Internal Server Error'
        });
    });
});

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