var request = require('supertest');
var app = require('../app');
var _ = require('lodash');

var User = require('../models/User');
var Task = require('../models/Task');

var person = { email: 'dummy@test.com', password: 'dummypass' };

describe('Task', function() {
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

  describe('Upload Task', function() {
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

  describe('Fetch Tasks', function() {
    var agent = request.agent(app);

    // login
    before(function(done) {
      agent
        .post('/login')
        .send(person)
        .expect('Location', /\//)
        .expect(302, done);
    });

    beforeEach(function(done) {
      request(app)
        .post('/api/tasks')
        .set('x-auth-token', token)
        .attach('t1', __dirname + '/tasks/basic.t')
        .attach('t', __dirname + '/tasks/2014-2-10.t')
        // date-specify -> 2014-2-9
        .attach('t2', __dirname + '/tasks/date-specify.t')
        .attach('t', __dirname + '/tasks/2014-2-8.t')
        .end(done);
    });

    it('should fetch only today\'s tasks', function(done) {
      agent
        .get('/api/tasks')
        .end(function(err, res) {
          var tasks = res.body;
          var today = new Date();
          tasks.should.have.length(3);
          tasks.should.matchEach(function(it) {
            (new Date(it.date)).toDateString().should.be.equal(today.toDateString());
            it.should.have.property('user');
            it.should.containEql({ 'metas': { tag: 'test' } });
          });
          // Orders
          tasks[0].text.trim().should.be.equal('task 1');
          tasks[1].text.trim().should.be.equal('task 2');
          tasks[2].text.trim().should.be.equal('中文');
          done();
        });
    });

    it('should fetch specified days from today', function(done) {
      agent
        .get('/api/tasks')
        .query({ days: 2 })
        .end(function(err, res) {
          var tasks = res.body;
          var today = new Date();
          tasks.should.have.length(3);
          (new Date(tasks[0].date)).toDateString().should.be.equal(today.toDateString());
          done();
        });
    });

    it('should fetch tasks from specified days and date', function(done) {
      agent
        .get('/api/tasks')
        .query({ days: 2, ceiling: '2014-2-9' })
        .end(function(err, res) {
          var tasks = res.body;
          var date0209 = new Date(2014, 1, 9);
          var date0208 = new Date(2014, 1, 8);
          tasks.should.have.length(6);
          (new Date(tasks[0].date)).toDateString().should.be.equal(date0209.toDateString());
          (new Date(tasks[2].date)).toDateString().should.be.equal(date0209.toDateString());
          (new Date(tasks[3].date)).toDateString().should.be.equal(date0208.toDateString());
          (new Date(tasks[5].date)).toDateString().should.be.equal(date0208.toDateString());
          done();
        });
    });

    it('should handle invalid params', function(done) {
      agent
        .get('/api/tasks')
        .query({ days: 'NAN', ceiling: 'NOT-VALID-DATE' })
        .end(function(err, res) {
          res.status.should.be.equal(500);
          done();
        });
    });
  });
});
