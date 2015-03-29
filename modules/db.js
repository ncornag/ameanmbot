var config = require('./config')
   ,logger = require('./logger')
   ,mongodb = require('mongodb')

db = {
  col:null,

  connect: function () {
    var MongoClient = mongodb.MongoClient
    var me = this
    logger.info('[db] initialized [%s]', config.db.url.replace(/\/.*@/, "//"))
    MongoClient.connect(config.db.url, function(err, db) {
      if(err) throw err
      config.db.engine = db
      me.col = db.collection(config.twitter.name);
      config.eventEmitter.emit('dbconnected', db);
    })
  },

  saveurl: function(url, text, data) {
    logger.info('[db] saving [%s]', url)
    this.col.insert({
      url:   url
      ,ts:   data.created_at
      ,user: data.user.screen_name
      ,id:   ''+data.id_str
      ,text: text
    }, function(err, docs) {
      if(err) return logger.error('[db] error '+ err)
      config.eventEmitter.emit('urlsaved', url, text, data);
    })

  }
}

config.eventEmitter.on('newurl', function(url, text, data){
  db.saveurl.call(db, url, text, data)
});

db.connect()

module.exports = db
