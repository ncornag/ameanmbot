var config = require('./config')
   ,logger = require('./logger')
   ,easyrequest = require('easy-request')

var superfeedr = {
  ping: function (url) {
    if (config.superfeedr.ping) {
      logger.info('[superfeedr] ping [%s]', url)
      easyrequest.post(config.superfeedr.pingurl, {
        'hub.mode': 'publish',
        'hub.url': config.superfeedr.rssurl
      }, 'html').then(function(data) {
        logger.info('[superfeedr] response [%s]', data)
      }, function(err){
        logger.error('[superfeedr] error ' + err)
      });
    }
  }
}

var lastping = new Date()

config.eventEmitter.on('urlsaved', function(url, text, data) {
  if ((new Date() - lastping)/1000>config.superfeedr.pingtime) {
    superfeedr.ping(url)
    lastping = new Date()
  }
});

logger.info('[superfeedr] initialized with ping=[%s]', config.superfeedr.ping)

module.exports = superfeedr