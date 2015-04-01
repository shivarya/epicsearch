var es = require('../../index.js'),
  get = es.get_first

/**
 * Dedups and saves doc based on supplied key/val pair
 *@param doc the doc to be saved
 *@param key The property on which to do match_phrase query
 *@param val The value to match for given key
 *@param type The ES type of document to be inserted
 *@param index The index to insert in. Default is config.doc_index
 */
module.exports = function(params,config){
  return get(params,config).
  then(function(doc){
   return es.index({
    type: params.type,
    id: (doc && doc._id),//If we found a document that exists for given key:val pair
    index: params.index || config.doc_index,
    body: params.doc 
   }).then(function(es_res){
    return {
      _id: es_res._id,
      version : es_res._version,
      created: es_res.created
    } 
   })  
  }) 
} 
