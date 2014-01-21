var request = require('supertest');
var app = require('../app');
var should = require('should');

var mongoose = require('mongoose');
var Task = mongoose.model('Task');
var User = mongoose.model('User');

var user = { email: 'dummy@test.com', password: 'dummypass' };

function register(user) {
  return function(done) {
    User.create(user, done);
  };
}
// agent = request.agent(app);
function login(agent, user) {
	return function(done) {
		agent
			.post('/signin')
			.send(user)
			.expect('Location', /\//)
			.expect(302, done);
	};
}

describe('App', function() {
  describe('Auth', function() {
    after(function(done) {
      User.find().remove(done);
    });

    describe('Sign Up', function() {
      it('should register a new user', function(done) {
        request(app)
          .post('/signup')
          .send(user)
          .expect('Location', /\//)
          .expect(302)
          .expect(/Moved Temporarily/)
          .end(function() {
            User.count({ email: user.email }, function(err, count) {
              should.not.exist(err);
              count.should.eql(1);
              done();
            });
          });
      });

      it('should reject if the user existed', function(done) {
        request(app)
          .post('/signup')
          .send(user)
          .expect(200)
          .expect(/existed/)
          .end(function() {
            User.count({ email: user.email }, function(err, count) {
              should.not.exist(err);
              count.should.eql(1);
              done();
            });
          });
      });
    });

    describe('Sign In', function() {
      it('should login failed with wrong password', function(done) {
        request(app)
          .post('/signin')
          .send({ email: user.email, password: 'wrongpass' })
          .expect('Location', /\/signin/)
          .expect(302, done);
      });

      var agent = request.agent(app);
      it('should login in', login(agent, user));
      it('should create user session', function(done) {
        agent
          .get('/signin')
          .expect('Location', /\//)
          .expect(302, done);
      });
    });

    describe('Sign Out', function() {
      var agent = request.agent(app);

      before(login(agent, user));

      it('should sign the user out', function(done) {
        agent
          .get('/signout')
          .expect('Location', /\/signin/)
          .expect(302, done);
      });
      it('should destroy the user session', function(done) {
        // Respond with login page
        agent
          .get('/signin')
          .expect(200)
          .expect(/Sign In/, done);
      });
    });

    describe('/api/tasks', function() {
      it('should require authorize to upload', function(done) {
        request(app)
          .post('/api/tasks')
          .expect(401, done);
      });
    });
  });


  describe('Tasks', function() {
    var agent = request.agent(app);

    before(register(user));
    before(login(agent, user));

    afterEach(function(done) {
      // clear db
      Task.find().remove(done);
    });

    after(function(done) {
      User.find().remove(done);
    });

    it('should save the task file to db', function(done) {
      agent
        .post('/api/tasks')
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
              it.should.have.property('user');
              it.should.containEql({ 'metas': { tag: 'test' } });
            });
            done(err);
          });
        });
    });

    it.skip('should ignore empty task file', function(done) {
      agent
        .post('/api/tasks')
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
      agent
        .post('/api/tasks')
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
});
