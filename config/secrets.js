module.exports = {
  'development': {
    url: 'mongodb://localhost/tlife-dev',
    localAuth: true,
    sessionSecret: 'Your Session Secret goes here'
  },
  'test': {
    url: 'mongodb://localhost/tlife-test',
    sessionSecret: 'Your Session Secret goes here'
  }
};
