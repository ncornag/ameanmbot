var path = require('path')
   ,rootPath = path.normalize(__dirname + '/../..')
   ,events = require('events')

var defaults = {
  root: rootPath,
  db: {
    url: process.env.MONGO_URL,
    engine: null
  },
  http: {
    port: process.env.PORT || 3000,           // The port on which the server is to listen
    host: process.env.IP || '0.0.0.0',        // The bind on which the server is to listen
    staticCache: false,                       // Cache options for the st module
    maxSockets: 20                            // To change the default node config (5)
  },
  twitter: {
    consumer_key: process.env.TW_CONSUMER_KEY,
    consumer_secret: process.env.TW_CONSUMER_SECRET,
    access_token_key: process.env.TW_TOKEN_KEY,
    access_token_secret: process.env.TW_TOKEN_SECRET,
    name: 'node',
    filter: {'track':'node.js,nodejs,angular.js,angularjs,mongodb'},
    urlfilters: [
      /npmjs.org/,
      /stackoverflow.com/,
      /github.com/,
      /amazon.com/,
      /ucoz.ua/,
      /2fh.co/,
      /packtpub.com/,
      /newsin.tk0/,
      /newsin131.tk/,
      /tdtechnosys.com/
    ],
    userfilters: [
      'vinceyue'
    ]
  },
  superfeedr: {
    ping: process.env.SF_PING?process.env.SF_PING=='true':false,
    pingurl: process.env.SF_PING_URL,
    rssurl: process.env.SF_RSS_URL,
    pingtime: process.env.SF_PING_TIME || 600,  // seconds
    title: 'MEAN tweets',
    description: 'Tweets about MEAN',
    author: 'Nicolás Cornaglia'
  },
  logger: {
    level: 'debug'
  },
  unshorten: {
    key: process.env.UNSHORTEN_KEY
  },
  eventEmitter: new events.EventEmitter()
}

var env = process.env.NODE_ENV = process.env.NODE_ENV || 'dev';

console.log('[Config] Using [%s] ', env)
module.exports = require('./config-' + process.env.NODE_ENV + '.js')(defaults);
