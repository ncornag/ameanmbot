var config = require('./config')
   ,logger = require('./logger')
   ,easyrequest = require('easy-request')

unshorten = {
  expand: function (url, cb) {
    if (url.lastIndexOf('&')>-1) return cb(null, url)
    if (url.lastIndexOf('?')>-1) return cb(null, url)
    if (url.match(/\//g).length>3) return cb(null, url)
    var u = 'http://api.unshorten.it?responseFormat=json&apiKey=' + config.unshorten.key + '&shortURL=' + url
    easyrequest.get(u, 'json').then(function(data) {
      if (data.error && data.error!=3) {logger.error('[unshorten] error ' + data); return cb(data.error)}
      if (data.error && data.error==3) return cb(null, url)
      logger.info('[unshorten] expanded [%s] -> [%s]', url, data.fullurl)
      cb(null, data.fullurl)
    }, function(err){
      logger.error('[unshorten] error ' + err)
      cb(err)
    })
  }
}

module.exports = unshorten
