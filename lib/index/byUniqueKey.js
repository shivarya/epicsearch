
/**
 * Dedups and saves doc based on supplied key/val pair
 *@param doc the doc to be saved
 *@param key the unique key by which to save. Its value must be present in the doc, else may throw error or give unexpected behavior
 *@param sort Optional. In case duplicates exist, the one to be on top of sort result will be overwritten.
 *@param type Optional. The ES type of document to be inserted. Default is config.doc_type
 *@param index Optional. The index to insert in. Default is config.doc_index
 */

var debug = require('debug')('IndexByUnique'),
_ = require('underscore')


function IndexByUnique(es){
  this.es = es
}

IndexByUnique.prototype.gobble = function(params){
  return this.swallow(this.chew(params))
}

IndexByUnique.prototype.chew = function(params){
  return params
}

IndexByUnique.prototype.swallow = function(params){
  var docs = params.docs || params.doc
  if(!docs){
    throw new Error('docs or doc not passed for indexing')
  } else if(!_.isArray(docs)){
    docs = [docs]
  } 

  
  params.val = _.pluck(docs,params.key)
  params.fields = [params.key]
  return this.es.get_first(params)
  .then(function(es_docs){
    es_docs = _.pluck(es_docs,'doc') 
    //Set the _id in docs
    es_docs.forEach(function(es_doc,i){
      if(es_doc){
        docs[i]._id = es_doc._id
      }
    }) 
    
    return es.bulk_insert({
      docs: docs, 
      type: params.type || es.config.doc_type,
      index: params.index || es.config.doc_index
    })
    .then(function(es_res){
      return _.pluck(es_res,'index') 
    })  
  }) 
} 

module.exports = IndexByUnique

if (require.main === module) {
  var EpicSearch = require('../../index')
  var config = require('../../config')
  var es = new EpicSearch(config)

  es.index_by_unique({
    key:'url',
    docs:[{url:13,ts:new Date().getTime()},{url:12}]
  })
  .then(function(res){
    debug('indexed by uniqueness', res)
    es.get_first({index:'test',type:'test',key:'url',val:12, sort:{ts:'desc'}}).
    then(debug)
    es.get_first({index:'test',type:'test',key:'url',val:13, sort:{ts:'desc'}}).
    then(debug)
  })
}
