var request = require('supertest');
var app = require('../app');
var should = require('should');

var mongoose = require('mongoose');
var User = mongoose.model('User');

var user = { email: 'dummy@test.com', password: 'dummypass' };

describe('Auth Token', function() {
  after(function(done) {
    User.find().remove(done);
  });

  it('should register the user and fetch the token', function(done) {
    request(app)
      .post('/auth/token')
      .send(user)
      .expect(200)
      .end(function(err, res) {
        User.find({ email: user.email }, function(err, users) {
          should.not.exist(err);
          users.should.have.length(1);
          res.body.should.have.property('token', users[0].id);
          done();
        });
      });
  });

  it('should fetch the token when authenticated', function(done) {
    request(app)
      .post('/auth/token')
      .send(user)
      .expect(200)
      .end(function(err, res) {
        User.find({ email: user.email }, function(err, users) {
          should.not.exist(err);
          users.should.have.length(1);
          res.body.should.have.property('token', users[0].id);
          done();
        });
      });
  });

  it('should notified when password incorrect with no token returned', function(done) {
    user.password = 'wrongpass';

    request(app)
      .post('/auth/token')
      .send(user)
      .expect(401)
      .end(function(err, res) {
        res.body.should.have.property('message', 'Password incorrect!');
        res.body.should.not.have.property('token');
        User.find({ email: user.email }, function(err, users) {
          should.not.exist(err);
          users.should.have.length(1);
          done();
        });
      });
  });
});
