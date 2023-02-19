module.exports = {
    env: process.env.NODE_ENV || 'local',
    hostname: process.env.HOST_NAME || 'localhost',
    port: process.env.PORT || 4001,
    configdir: process.env.NODE_ENV || '.',
}
  