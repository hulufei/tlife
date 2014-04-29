module.exports = {
  db: process.env.MONGODB || 'mongodb://localhost/tlife-dev',
  sessionSecret: process.env.SESSION_SECRET || 'Your Session Secret goes here'
};
