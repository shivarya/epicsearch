var 
  Q = require('q'),
  es//, = require('../../index.js'),
  utils = require('../utils'),
  mem_update = require('../mem/update.js'),
  _ = require('underscore')

/**
 * This module is based on registered queries in a query_index with each query
 * having a query_type field. These queries can be used to reverse match documents
 * and apply system rules or do updates on documents based on which queries matched.
 * For any array of passed docs, a query index
 * find out which queries match each passed doc, and then update
 * corresponding doc with the update instructions provided in each matching
 * query for that doc
 */
module.exports = function(params,config){
  return mexecute(chew(params,config))
}
module.exports.process_bulk = function(){
  var responseSizes = []
  var bulk_instructions = 
    _.chain(arguments)
    .map(function(request){
      var instructions = chew.apply(null,request)
      responseSizes.push(instructions.length/2)
      return instructions
    })
   .flatten()
   .value()
  return mexecute(bulk_instructions)
  .then(function(results){
    var ret = utils.split_by_counts(results,responseSizes)
    return ret
  })

} 
var mexecute = function(instructions) {
  
  es = es || require('../../index')
  return es.mpercolate({
      body: instructions 
    }).
    then(
      function (res) {
        var docwise_query_ids = res.responses.map(function(per_doc_queries){
          return per_doc_queries.matches.map(function(query){return query._id})
        })
        var update_promises = docwise_query_ids.map(function(query_ids,i){
            if(query_ids && query_ids.length) { 
              return update_doc( instructions[2*i+1].doc, query_ids, instructions[2*i].percolate.index)
            } else
              return Q(instructions[2*i+1].doc)
        })
        return Q.all(update_promises)
      }
    )
}
/**
* Updates the given doc with update instructions in specified queries
* @param query_index = the index where queries are stored
* @param query_ids = ["competitor xyz's content","owned-content"]
* @param doc = the doc to be reverse matched and updated according to finally matched queries 
**/ 
var update_doc = function(doc, query_ids, query_index) {
    return get_queries(query_ids,query_index)
    //then(update,doc,queries)//update params.body with instructions in query fetched from ES. return doc itself
    .then(function(queries){
      //doc.matched_queries = res
      queries.forEach(function(query){
        if(query) {
          if(!query.update){
            console.log('mpu: found query without update param',JSON.stringify(query))
          } else {
            mem_update({doc:doc,update:query.update,query:query})
          }
        }
      })
      return doc
      //mem_update({doc:doc,percolate_update})    
    })
}

var get_queries = function(query_ids, query_index){
  //We will do an mget to get all queries in one go
  //Map the query ids from ["1","2"] to [{_id:"1"},{_id:"2"}]
  //query_ids = query_ids.map(function(id){return {_id:id}})
  return es.mget(
    {
      index: query_index,
      type : '.percolator',
      body: {ids: query_ids}
    }
  ).
  then(function(res){
    return res.docs.map(function(doc){
      return doc._source 
    }) 
  })
}

/*
 * params = {
 *  "docs" : [{
 *      "text" : "value"
 *     }
 *  ],
 *  "query_index":"queries"
 * },
 * config:{
 *
 * } 
 */
/*
 * @param params.query_index : The index where the queries to reverse-match are stored. 
 *   if not specified, config.percolate.query_index is used
 * @param params.docs : the array of documents to percolate and update
**/
var chew = function(params,config){
  if(!params.docs)
    throw new Error('params.docs is undefined or null')  
  var query_index = params.query_index || config.percolate.query_index,
    docs = params.docs,
    instructions = []
  docs.forEach(function(doc,i){  
    instructions.push({
      percolate: {
        index: query_index,
        type: doc._type//This is used to parse the document
      }
    })
    instructions.push({
      doc: doc
    }) 
  })
  return instructions
}
if(require.main === module){
  var docs = [
    {
      text:"marketing",
      _type: "test"
    },
    {
      text:"b2c",
      _type: "test"
    }
  ]
  var docs2 = [
    {
      text:"market",
      _type: "test"
    },
    {
      text:"b2b",
      _type: "test"
    }
  ]
    es = es || require('../../index')
    es.mpu({
      query_index: "queries",
      docs:docs
    })
    .then(function(res){
      console.log(1,res)
    })
    es.mpu({
      query_index: "queries",
      docs:docs2
    })
    .then(function(res){
      console.log(2,res)
    })
}
