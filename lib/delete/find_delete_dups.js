/**
 * Group the document set in given index/type by values of 'key' field, for keys on which atleast one duplicate has occured.
 * For each such value, get all the (duplicate) docs, ordered by sort (if provided) 
 * Apart from the first doc in sorted list, delete all the others.
 *
 * The above process is repeated for batch_size number of values every time, till no duplicates are left
 *
 * @param key The key by which the duplicates have to be found (aggregated), searched and deleted
 * @param source_key The key which will be available in doc._source, in the multi_field scenario. Default is key
 * @param del_sort The sort (in es format) by which to sort the duplicates, and delete from second one onwards, for every unique key
 * @param batch_size the batch size of unique key values to dedup every time. Default value is 1000. Value to the tune of 10000 slows down a lot.
 * @param index default is config.doc_index  
 * @param type the type of documents to be deduped on, default is epicdoc 
 * @return the values for which duplicates were deleted
 */

var debug = require('debug')('FindDeleteDups'),
_ = require('underscore'),
Q = require('q')

function FindDeleteDups(es){
  this.es = es
}

FindDeleteDups.prototype.gobble = function(params){
  return this.swallow(this.chew(params))
}

FindDeleteDups.prototype.chew = function(params){
  return params
}

FindDeleteDups.prototype.swallow = function(params){
  var that = this
  return delete_dups.apply(this,arguments).
  then(function(res){
    if(res){//some dups were deleted
      debug('deduped',res.length, res)
      return that.gobble(params)
    }
    else {
      return 'deleted all dups'
    }
  })
}

module.exports = FindDeleteDups

var delete_dups = function(params) {
  var batch_size = params.batch_size || params.size || 1000,
  sort = params.del_sort,
  key = params.key,
  source_key = params.source_key || key,
  index = params.index || es.config.doc_index,
  type = params.type || es.config.doc_type,
  es = this.es,
  fields = [source_key],//For efficiency reasons, we want only the source_key in objects sent in response
  result //what will be finally returned

  return es.get_dups(params)
  .then(function(dup_vals){
    debug('Values which have dups ',dup_vals) 
    if(dup_vals.length) {
      result = dup_vals = _.pluck(dup_vals,'key')
      return es.get_first({key:key, val:dup_vals, index: index, type: type, sort: sort, fields:fields}) //The docs returned by get_first will not be deleted. All except them will be deleted. Hence sort is useful to determine which doc you want to save
      .then(function(first_docs){
        debug('About to dedup ',first_docs)
        return _.pluck(first_docs,'doc') //get_first returns [{doc:<doc>,total:<num_dups+1>}] where num_dups is numbr of other dups
      })
    }
  })
  .then(function(docs_to_dedup){//delete other docs for each duped value
    if(docs_to_dedup){
      params.docs = docs_to_dedup
      return es.delete_dups(params)//Return same doc objects which were deduped
    }
  })
}

if(require.main === module){
  var EpicSearch = require('../../index')
  
  var config = require('../../config.js')
  var es = new EpicSearch(config)
  es.find_and_delete_dups({key:"url",del_sort:{fetch_time:"desc"},index:"test",type:"test"}).
  then(function(res){
    debug(res)
  })
}