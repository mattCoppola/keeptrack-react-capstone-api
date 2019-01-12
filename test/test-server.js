const chai = require('chai');
const chaiHttp = require('chai-http');

const { app, runServer, closeServer } = require("../server");
const { JWT_SECRET, TEST_DATABASE_URL } = require("../config");
const mongoose = require('mongoose');

const {
  User,
  Workorder,
  Inventory
} = require('../models/user');

const jwt = require('jsonwebtoken');

const expect = chai.expect;
const should = chai.should();
chai.use(chaiHttp);

// tearDownDb
function tearDownDb() {
    console.warn('Deleting database');
    return mongoose.connection.dropDatabase();
}

// Generate results data
function generateWorkOrderResults() {
    return {
        username: "faker",
        caseNumber: "SC1234567",
        customerName: "Customer",
        serialNumber: "SN987654321",
        partReplaced: "Screen",
        notes: "Some notes here"
    };
};

// Seed Results DB
function seedResultsDb() {
    const seedData = [];

    for (let i = 1; i <= 10; i++) {
        seedData.push(generateWorkOrderResults());
    }

    return Workorder.insertMany(seedData);
}

//TESTS
// build one at a time, test and comment after complete

describe('Workorders API resource', function () {
    const username = 'testUser';
    const password = 'testPass';

    before(function () {
        return runServer(TEST_DATABASE_URL);
    });

    after(function () {
        return closeServer();
    });

    beforeEach(function () {
        return seedResultsDb();
    });

    afterEach(function () {
        return tearDownDb();
    });

///////////////////////
// CREATE A NEW USER //
///////////////////////

  describe('POST: Create a new user', function () {
      it('Should create a new user', function () {
          return chai
              .request(app)
              .post('/api/users')
              .send({
                  username,
                  password
              })
              .then(res => {
                  expect(res).to.have.status(200);
              });
      });
  });
});



describe('api/users', function() {

   it('should get 200 on GET requests', function() {
     return chai.request(app)
       .get('/api/users')
       .then(function(res) {
         res.should.have.status(200);
         res.should.be.json;
       });
   });
});

describe('api/auth', function() {

   it('should get 200 on GET requests', function() {
     return chai.request(app)
       .get('/api/auth')
       .then(function(res) {
         res.should.have.status(200);
         res.should.be.json;
       });
   });
});
