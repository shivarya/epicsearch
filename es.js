var 
  config = require('./config'),
  elasticsearch = require('elasticsearch')

module.exports = new elasticsearch.Client(config.clientParams)
module.exports.config = config

if(config.cloneClientParams) {
  module.exports.cloneClient = new elasticsearch.Client(config.cloneClientParams)
}
