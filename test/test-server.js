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

// Generate Workorder data
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

// Seed Workorder DB
function seedResultsDb() {
    const seedData = [];

    for (let i = 1; i <= 10; i++) {
        seedData.push(generateWorkOrderResults());
    }

    return Workorder.insertMany(seedData);
}

// Generate Inventory data
function generateInventoryData() {
  return {
    partNumber: "mainboard",
    cost: 200,
    price: 400,
    qty: 100
  };
};

// Seed Inventory data
function seedInventoryDb() {
  const seedData = [];
  for (let i = 1; i <= 10; i++) {
    seedData.push(generateInventoryData());
  }

  return Inventory.insertMany(seedData);
}


////////////////////////
// BASIC ROUTER TESTS //
////////////////////////

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


/////////////////////
// WORKORDER TESTS //
/////////////////////


describe('Workorders API resource', function () {
    const username = 'testUser';
    const password = 'testPass';

    before(function () {
        // adding time for tests to resolve without error
        this.timeout(10000);
        return runServer(TEST_DATABASE_URL);
    });

    after(function () {
      // adding time for tests to resolve without error
        this.timeout(10000);
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

  describe('GET: Retrieve Workorders', function() {
    it('Should retrieve all Workorders', function() {
      let res;
      const token = jwt.sign({
              user: {
                  username
              }
          },
          JWT_SECRET, {
              algorithm: 'HS256',
              subject: username,
              expiresIn: '7d'
          });
        return chai
          .request(app)
          .get('/api/auth/dashboard')
          .set('Authorization', `Bearer ${token}`)
                .then(function (_res) {
                    res = _res;
                    expect(res).to.have.status(200);
          });
    });
  });

  describe('DELETE: Remove an existing result from db', function () {
        it('delete an existing record', function () {
            const token = jwt.sign({
                    user: {
                        username
                    }
                },
                JWT_SECRET, {
                    algorithm: 'HS256',
                    subject: username,
                    expiresIn: '7d'
                });

            let result;

            return Workorder
                .findOne()
                .then(function (resResult) {
                    result = resResult;
                    return chai.request(app)
                        .delete(`/api/auth/workorder/${result.id}`)
                        .set('Authorization', `Bearer ${token}`)
                })
                .then(function (res) {
                    expect(res).to.have.status(200);
                });
        });
    });



});


/////////////////////
// INVENTORY TESTS //
/////////////////////


describe('Inventory API resource', function () {
    const username = 'testUser';
    const password = 'testPass';

    before(function () {
        // adding time for tests to resolve without error
        this.timeout(10000);
        return runServer(TEST_DATABASE_URL);
    });

    after(function () {
      // adding time for tests to resolve without error
        this.timeout(10000);
        return closeServer();
    });

    beforeEach(function () {
        return seedInventoryDb();
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

  describe('GET: Retrieve Inventory', function() {
    it('Should retrieve all Inventory', function() {
      let res;
      const token = jwt.sign({
              user: {
                  username
              }
          },
          JWT_SECRET, {
              algorithm: 'HS256',
              subject: username,
              expiresIn: '7d'
          });
        return chai
          .request(app)
          .get('/api/auth/inventory')
          .set('Authorization', `Bearer ${token}`)
                .then(function (_res) {
                    res = _res;
                    expect(res).to.have.status(200);
          });
    });
  });

  describe('DELETE: Remove an existing Inventory qty', function () {
        it('delete an existing inventory qty', function () {
            const token = jwt.sign({
                    user: {
                        username
                    }
                },
                JWT_SECRET, {
                    algorithm: 'HS256',
                    subject: username,
                    expiresIn: '7d'
                });

            let result;

            return Inventory
                .findOne()
                .then(function (resResult) {
                    result = resResult;
                    return chai.request(app)
                        .delete(`/api/auth/inventory/${result.id}`)
                        .set('Authorization', `Bearer ${token}`)
                })
                .then(function (res) {
                    expect(res).to.have.status(200);
                });
        });
    });
});
