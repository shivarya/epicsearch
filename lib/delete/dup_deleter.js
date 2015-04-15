var es = require('../../index.js')


/**
 * Group the document set in given index/type by values of 'key' field, on which atleast one duplicate has occured.
 * For each such value, get all the (duplicate) docs, ordered by sort (if provided) 
 * Apart from the first doc for each value, delete all the others.
 *
 * The above process is repeated for batch_size number of values every time, till no duplicates are left
 *
 * @param key The key by which the duplicates have to be found (aggregated), searched and deleted
 * @param multi_key The key which will be available in doc._source, in the multi_field scenario. Default is key
 * @param del_sort The sort (in es format) by which to sort the duplicates, and delete from second one onwards, for every unique key
 * @param batch_size the batch size of unique key values to dedup every time. Default value is 1000. Value to the tune of 10000 slows down a lot.
 * @param index default is config.docIndex  
 * @param type the type of documents to be deduped on, default is epicdoc 
 * @return the values for which duplicates were deleted
 */
module.exports = function(params){
  return del(params).
  then(function(res){
    if(res){//some dups were deleted
      console.log('deduped',res)
      return module.exports(params)
    }
    else {
      process.exit(0)
    }
  })
}

var del = function(params) {
  var batch_size = params.batch_size || params.size || 1000,
  sort = params.del_sort,
  key = params.key,
  multi_key = params.multi_key || key,
  index = params.index || config.docIndex,
  type = params.type || 'epicdoc',
  fields = [multi_key],//We want only the multi_key in objects sent in response
  result //docs which are not deleted
  
  var aggs_query = {
   body:{   
      aggs: {
        dups: {
          terms: {
            field: key,
            size: batch_size,
            shard_size: 1000000,
            min_doc_count: 2 //There should be at least two docs by that key for it to delete
          }
        }
      },
      size: 0 
    },
    fields:fields,
    index: index,
    type: type
  }
  return es.search(aggs_query).
  then(function(res){//get the docs to retain for each duped value
    var dups = res.aggregations.dups.buckets
    if(dups.length){//the dups
      var dup_vals = dups.map(function(dup){
        return dup.key
      })
      result = dup_vals 
      return es.get_first({key:key, val:dup_vals, index: index, type: type, sort: sort, fields:fields})//These first keys will not be deleted, all except them will be deleted. Hence sort is important 
    } 
  }).then(function(res){//delete other docs for each duped value
    if(res){
      //A potentially big OR query with one clause for every unique value which has duplicates. That clause preserves the first (based on sort) document for each unique value
      return es.deleteByQuery({
        "body": {
          "query": del_query(res,key,multi_key)
         },
        "index": index,
        "type": type
      })
    }
  }).then(function(del_res){
    return result//The dup vals for which we just deduped
  })
}

var del_query = function(docs, key, multi_key){
  
  var del_instructions = 
    docs.map(function(doc){
      var key_eq_val = {}
      key_eq_val[key] = doc[multi_key][0] || doc[multi_key]//If fields is set, then ES returns array
      return {//Query for all docs with given key:val and NOT this docs _id
        "bool": {
          "must": {
            "term": key_eq_val 
          },
          "must_not": {
            "term": {
              "_id": doc._id
            }
          }
        }
      }  
    })
  var del_q = {
    "bool":{
      "should": del_instructions
    }
  }
  return del_q
} 

if(require.main === module){
  module.exports({key:"url",batch_size:1000,del_sort:{fetch_time:"desc"},index:"test",type:"test",multi_key:"url"}).
  then(function(res){
    console.log(res)
  })
}
