module.exports = {
  'development': {
    db: 'mongodb://localhost/tlife-dev',
    localAuth: true,
    sessionSecret: 'Your Session Secret goes here'
  },
  'test': {
    db: 'mongodb://localhost/tlife-test',
    sessionSecret: 'Your Session Secret goes here'
  }
};
