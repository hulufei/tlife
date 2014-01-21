var request = require('supertest');
var app = require('../app');
var should = require('should');

var mongoose = require('mongoose');
var Task = mongoose.model('Task');

describe('App', function() {
  describe('Tasks', function() {
    afterEach(function(done) {
      // clear db
      Task.find().remove(done);
    });

    it('should save the task file to db', function(done) {
      request(app)
        .post('/tasks')
        .attach('t', __dirname + '/tasks/basic.t')
        .expect(200)
        .end(function(err) {
          should.not.exist(err);
          Task.find({}, function(err, items) {
            items.should.have.length(3);
            items.should.matchEach(function(it) {
              it.should.have.property('start');
              it.should.have.property('text');
              it.should.have.property('end');
              it.should.have.property('date');
              it.should.containEql({ 'metas': { tag: 'test' } });
            });
            done(err);
          });
        });
    });

    it.skip('should ignore empty task file', function(done) {
      request(app)
        .post('/tasks')
        .attach('t', __dirname + '/tasks/empty.t')
        .expect(500)
        .end(function(err) {
          should.not.exist(err);
          Task.find({}, function(err, items) {
            items.should.have.length(0);
            done(err);
          });
        });
    });

    it.skip('should limit uploaded task file size under 2kb', function(done) {
      request(app)
        .post('/tasks')
        .attach('t', __dirname + '/tasks/limit-size.t')
        .expect(500)
        .end(function(err) {
          should.not.exist(err);
          Task.find({}, function(err, items) {
            items.should.have.length(0);
            done(err);
          });
        });
    });
  });

  describe('Sign Up', function() {
    afterEach(function(done) {
      // clear db
      done();
    });

    it('should register user', function(done) {
      request(app)
        .post('/signup')
        .send({ email: 'test@gmail.com', password: '12345' })
        .expect('test@gmail.com', done);
    });
  });
});
