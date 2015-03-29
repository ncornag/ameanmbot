var config = require('./config')
   ,logger = require('./logger')
   ,twitter = require('ntwitter')
   ,_ = require('underscore')
   ,unshorten = require('./unshorten')

var twit = new twitter({
  consumer_key: config.twitter.consumer_key,
  consumer_secret: config.twitter.consumer_secret,
  access_token_key: config.twitter.access_token_key,
  access_token_secret: config.twitter.access_token_secret
})

var retry = 30000
var lp = []

var twitter = {
  filter: function (name, filter) {
    logger.info('[twitter] initialized filter [%s] with [%s]', name, filter)
    var userfilters = config.twitter.userfilters

    var allow = function(data){
      if (data.entities.urls.length==0) return false        // No urls
      if (data.retweeted_status) return false               // It's a retweet
      if (data.user.screen_name=='ameanmbot') return false  // It's an own tweet (needs to verify this actually happen)
      if (!_.reduce(userfilters, function(memo, filter){ return memo && data.user.screen_name!=filter;}, true)) return false;
      if (data.entities.user_mentions.length>0 && data.entities.user_mentions[0].indices[0]==0) { // No mentions, unless it has a hashtag
        if (data.entities.hashtags.length==0) return false
      }
      return true
    }

    var col = config.db.engine.collection(name)
    var urlfilters = config.twitter.urlfilters
    col.ensureIndex({url:1}, {unique:true}, function(err, indexName) {if (err) logger.error(err)})
    twit.stream('statuses/filter', filter, function(stream) {
      stream.on('error', function(error) {
        logger.error('[twitter] error ' + error)
        config.eventEmitter.emit('reconnect');
      });
      stream.on('data', function (data) {
        config.eventEmitter.emit('lastretweet', new Date());
        logger.info('[twitter] received [%s][%s]', allow(data), data.text)
        if (allow(data)) {
          var urls = data.entities.urls
          var url = urls[0].expanded_url
          var d = data
          unshorten.expand(url, function (err, url) {
            if(err) return logger.error(err)

            var text = d.text
            for (var i= 0; i<urls.length; i++) {
              var u = urls[i]
              text = text.replace(u.url, '<a href="' + u.url + '">' + u.display_url + '</a>')
            }
            var allowed = _.reduce(urlfilters, function(memo, filter){ return memo && !url.match(filter);}, true);
            if (allowed) {
              col.find({url:url}).toArray(function(err, data){
                if (err) return logger.error(err)
                if (data.length==0) {
                  config.eventEmitter.emit('newurl', url, text, d);
                }
              })
            }
          })
        }
      })
    })
  },

  tweet: function(url, text, data) {
    twit.retweetStatus(data.id_str, function (err, data) {
      if (err) return logger.error('[twitter] error ' + err)

      lp.push(new Date())
      if (lp.length>100) lp.shift()
      var tt = (lp[lp.length-1]-lp[0])/1000

      logger.info('[twitter] retweeted [%s/h] [%s]', (lp.length/tt)*3600, url)
    })
  }
}

config.eventEmitter.on('dbconnected', function(db) {
  twitter.filter(config.twitter.name, config.twitter.filter)
});
config.eventEmitter.on('reconnect', function(db) {
  setTimeout(function(){
    retry = retry * 2
    twitter.filter(config.twitter.name, config.twitter.filter)
  }, retry)
});
config.eventEmitter.on('urlsaved', twitter.tweet);

module.exports = twitter