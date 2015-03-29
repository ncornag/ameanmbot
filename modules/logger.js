var config = require('./config')
   ,winston = require('winston')

module.exports = new (winston.Logger)({
  transports: [
    new (winston.transports.Console)({ level: config.logger.level, json: false, timestamp: true, colorize: true })
    // ,new winston.transports.File({ filename: __dirname + '/debug.log', json: false })
  ],
  exceptionHandlers: [
    new (winston.transports.Console)({ level: config.logger.level, json: false, timestamp: true, colorize: true, silent: false, prettyPrint: true  })
    //,new winston.transports.File({ filename: __dirname + '/exceptions.log', json: false })
  ],
  exitOnError: false
});

module.exports.info('[logger] initialized with [%s]', config.logger.level)
