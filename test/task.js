var request = require('supertest');
var app = require('../app');
var should = require('should');

var mongoose = require('mongoose');
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

  it.skip('should reject with invalid tasks', function() {
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

  it('should upload a task file', function() {
    request(app)
      .post('/api/tasks')
      .set('x-auth-token', token)
      .attach('t', __dirname + '/tasks/basic.t')
      .expect(200)
      .end(function(err, res) {
        Task.find({}, function(err, items) {
          items.should.have.length(3);
          items.should.matchEach(function(it) {
            it.should.have.property('start');
            it.should.have.property('text');
            it.should.have.property('end');
            it.should.have.property('date');
            it.should.have.property('user');
            it.should.containEql({ 'metas': { tag: 'test' } });
          });
          done();
        });
      });
  });

});
