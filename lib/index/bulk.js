
/**
 * @param docs to be inserted. Can be a single doc or an array of docs
 * @param index the index in which to insert 
 * @param type of documents
 */

var utils = require('../utils'),
  _  = require('underscore'),
  debug = require('debug')('IndexBulk')

function IndexBulk(es){
  this.es = es
}

IndexBulk.prototype.gobble = function(params){
  return this.swallow(this.chew(params))
}

IndexBulk.prototype.chew = function(params){
  var docs = params.docs,
  index = params.index || this.es.config.default_index,
  type = params.type || this.es.config.default_type
  
  if (!Array.isArray(docs)) {
    docs = [docs]
  }

  return _.chain(docs)
    .map(function(doc) {

      var commands = [ 
        {index:  { _index: index, _type : type, _id : doc._id} },
        doc
      ]
      delete doc._id //The _id is specified in header already
      return commands
    })
    .flatten()
    .value()
}

IndexBulk.prototype.swallow = function(commands){
  var that = this 
  return this.es.bulk({body:commands})
  .then(function(res){
    if(res.error)
      throw new Error(res.error)
    if(that.es.cloneClient) {//Copy the _ids from response into the bulk insert command for the clone index. We want to reuse the same _ids on both
      res.items.forEach(function(item,i){
        commands.body[2*i].index._id = utils.only_value(item)._id  
      })
      that.es.cloneClient.bulk(commands)
    }
    return res.items
  })
}

module.exports = IndexBulk

if(require.main === module){
  var EpicSearch = require('../../index')
  var config = require('../../config')
  var es = new EpicSearch(config)
  es.bulk_index({docs:[{url:13},{url:12,_id:1}]})
  .then(debug)
}

