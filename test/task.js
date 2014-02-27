var request = require('supertest');
var app = require('../app');
var _ = require('lodash');

var User = require('../models/User');
var Task = require('../models/Task');

var person = { email: 'dummy@test.com', password: 'dummypass' };

describe('Upload Task', function() {
  var token;

  before(function(done) {
    // Set token
    var user = new User(person);
    token = user.id;
    user.save(done);
  });

  after(function(done) {
    User.find().remove(done);
  });

  afterEach(function(done) {
    Task.find().remove(done);
  });

  it('should reject with invalid token', function(done) {
    request(app)
      .post('/api/tasks')
      .set('X-Auth-Token', 'wrong token')
      .expect(401)
      .end(done);
  });

  it('should reject with empty tasks', function(done) {
    request(app)
      .post('/api/tasks')
      .set('X-Auth-Token', token)
      .attach('t', __dirname + '/tasks/empty.t')
      .expect(500)
      .end(function(err, res) {
        res.body.should.have.property('message', 'Invalid tasks!');
        done();
      });
  });

  it.skip('should reject with invalid tasks', function(done) {
    request(app)
      .post('/api/tasks')
      .set('x-auth-token', token)
      .attach('t', __dirname + '/tasks/invalid.t')
      .expect(500)
      .end(function(err, res) {
        res.body.should.have.property('message', 'Invalid tasks!');
        done();
      });
  });

  it('should upload a task file', function(done) {
    request(app)
      .post('/api/tasks')
      .set('x-auth-token', token)
      .attach('t', __dirname + '/tasks/basic.t')
      .expect(200)
      .end(function() {
        Task.find({}, function(err, items) {
          var today = new Date();
          items.should.have.length(3);
          items.should.matchEach(function(it) {
            it.should.have.property('start');
            it.should.have.property('text');
            it.should.have.property('end');
            it.should.have.property('date');
            it.date.toDateString().should.be.equal(today.toDateString());
            it.should.have.property('user');
            it.should.containEql({ 'metas': { tag: 'test' } });
          });
          done();
        });
      });
  });

  it('should upload a task file specify date', function(done) {
    request(app)
      .post('/api/tasks')
      .set('x-auth-token', token)
      .attach('t', __dirname + '/tasks/date-specify.t')
      .expect(200)
      .end(function() {
        Task.find({}, function(err, items) {
          var specifyDate = new Date(2014, 2-1, 9);
          items.should.have.length(3);
          items.should.matchEach(function(it) {
            it.should.have.property('start');
            it.should.have.property('text');
            it.should.have.property('end');
            it.should.have.property('date');
            it.date.toDateString().should.be.equal(specifyDate.toDateString());
            it.should.have.property('user');
            it.should.containEql({ 'metas': { tag: 'specifyDate' } });
          });
          done();
        });
      });
  });

  it('should upload multiple task files', function(done) {
    request(app)
      .post('/api/tasks')
      .set('x-auth-token', token)
      .attach('t1', __dirname + '/tasks/basic.t')
      .attach('t2', __dirname + '/tasks/date-specify.t')
      .attach('t3', __dirname + '/tasks/basic.t')
      .expect(200)
      .end(function() {
        Task.find({}, function(err, items) {
          var specifyDate = new Date(2014, 2-1, 9);
          var today = new Date();
          items.should.have.length(9);
          items.should.matchEach(function(it) {
            it.should.have.property('start');
            it.should.have.property('text');
            it.should.have.property('end');
            it.should.have.property('date');
            it.should.have.property('user');
          });

          _.filter(items, { metas: { tag: 'test' } }).should.matchEach(function(it) {
            it.date.toDateString().should.be.equal(today.toDateString());
          });

          _.filter(items, { metas: { tag: 'specifyDate' } }).should.matchEach(function(it) {
            it.date.toDateString().should.be.equal(specifyDate.toDateString());
          });

          done();
        });
      });
  });
});
