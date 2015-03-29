var config = require('./config')
   ,logger = require('./logger')
   ,http = require('http')
   ,express = require('express')
   ,rss = require('rss')

var app = express()
config.lastRetweet = new Date()

app.get('/ping', function(req, res) {
  var now = new Date()
  var elapsed = (now-config.lastRetweet)/1000
  var response = {status: 'pong', lastret: elapsed}
  if (elapsed>120) response.status = ''
  res.json(response)
  return res.end()
})

app.get('/feed/rss', function(req, res) {
  // Create rss prototype object and set some base values
  var feed = new rss({
    title: config.superfeedr.title,
    description: config.superfeedr.description,
    feed_url: 'http://' + req.headers.host + req.url,
    site_url: 'http://' + req.headers.host,
    hub: config.superfeedr.pingurl,
    author: config.superfeedr.author
  })

  // Fetch 10 published posts from data store
  // sorted by creation date.
  config.db.engine.collection('node').find({
    //state: 'published'
  }).limit(25).sort({
       ts: -1
     }).toArray(function(err, posts) {
       if (!err && posts) {
         posts.forEach(function(post) {
           feed.item({
             title: 'Tweet from ' + post.user,
             description: post.text,
             guid: post._id.toString(),
             url: 'https://twitter.com/' + post.user + '/status/' + post.id,
             author: post.user,
             date: post.ts
           })
         })
         res.type('rss')
         res.send(feed.xml())
       }
     })
})

config.eventEmitter.on('lastretweet', function(date) {
  config.lastRetweet = date
})

logger.info('[express] initialized on %s:%s', config.http.host, config.http.port)

var server = http.createServer(app)
server.listen(config.http.port, config.http.host)

module.exports = app