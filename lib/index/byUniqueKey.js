
/**
 * Dedups and saves doc based on supplied key/val pair
 *@param doc or docs the doc(s) to be saved. Can be array or single element
 *@param key the unique key by which to save. Its value must be present in the doc, else may throw error or give unexpected behavior
 *@param sort Optional. In case duplicates exist, the one to be on top of sort result will be overwritten.
 *@param type Optional. The ES type of document to be inserted. Default is config.doc_type
 *@param index Optional. The index to insert in. Default is config.doc_index
 */

var debug = require('debug')('IndexByUnique')
var bulk_index = require('./bulk')
var _ = require('underscore')

function IndexByUnique(es){
  this.es = es
  this.bulk_index = new bulk_index(es)
}

IndexByUnique.prototype.gobble = function(params){
  return this.chew(params).then(this.swallow)
}

IndexByUnique.prototype.chew = function(params){

  var docs = params.docs || params.doc
  if(!docs){
    throw new Error('docs or doc not passed for indexing')
  } else if(!_.isArray(docs)){
    docs = [docs]
  }

  params.docs = docs
  params.val = _.pluck(docs,params.key)
  params.fields = [params.key]

  var that = this
  return this.es.get_first(params)
  .then(function(esDocs){

    esDocs = _.pluck(esDocs,'doc') 

    esDocs.forEach(function(esDoc,i){
      if(esDoc){
        docs[i]._id = esDoc._id
      }
      
    })

    return {
      instructions: that.bulk_index.chew(params),
      response_size: docs.length
    }
  })
  .catch(debug)
}

IndexByUnique.prototype.swallow = function(bulk_instructions){
  return this.es.bulk({body:bulk_instructions})
  .then(function(res){
    return res.items
  }) 
} 

module.exports = IndexByUnique

if (require.main === module) {
  var EpicSearch = require('../../index')
  var config = require('../../config')
  var es = new EpicSearch(config)

  es.index_by_unique({
    key:'url',
    docs:[{url:21},{url:13,ts:new Date().getTime()},{url:12}]
  })
  .then(function(res){
    debug('indexed by uniqueness', res)
    es.get_first({index:'test',type:'test',key:'url',val:12, sort:{ts:'desc'}}).
    then(debug)
    es.get_first({index:'test',type:'test',key:'url',val:13, sort:{ts:'desc'}}).
    then(debug)
  })
  .catch(debug)
}
