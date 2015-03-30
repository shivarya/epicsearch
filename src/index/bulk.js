
var
  utils = require('../../utils'),
  esClient,
  _  = require('underscore')

module.exports = function(docs,options) {
  return index(chew(docs,options))
}
var index = function(commands){
  esClient = esClient || require('../../index.js')
  //debug('elasticsearch commands', JSON.stringify(commands.body, null, 2))
  return esClient.bulk({body:commands})
  .then(function(res){
    if(esClient.cloneClient) {//COpy the _ids from response into the bulk insert command for the clone index. We want to reuse the same _ids on both
      res.items.forEach(function(item,i){
        commands.body[2*i].index._id = utils.only_value(item)._id  
      })
      esClient.cloneClient.bulk(commands)
    }
    return res.items
  })
}

/**
 * @param docs to be inserted
 * @param options.index the index in which to insert 
 * @param options.type of documents
 */

var chew = function(docs,options){
  options = options || {}
  if (!Array.isArray(docs)) {
    docs = [docs]
  }

  return _.chain(docs)
    .map(function(doc) {

      var a = [ 
        {index:  { _index: options.index, _type : options.type || es.config.default_index, _id : doc._id} },
        doc
      ]
      delete doc._id
      return a
    })
    .flatten()
    .value()
  
}
module.exports.process_bulk = function(){
  var responseSizes = []
  var bulk_instructions = 
    _.chain(arguments)
    .map(function(request){
      console.log(request)
      var instructions = chew.apply(null,request)
      responseSizes.push(instructions.length/2)
      return instructions
    })
   .flatten()
   .value()
  return index(bulk_instructions)
  .then(function(results){
    return utils.split_by_counts(results,responseSizes)
  })
}

if(require.main === module){
  setTimeout(function(){
    var i = require('../../index.js')
    i.bulk_insert([{a:2},{a:3,_id:1}],{index:'test',type:'test'})
    .then(function(res){console.log(1,'index',res)})

    i.bulk_insert([{a:2,_id:1},{a:3}],{index:'test',type:'test'})
    .then(function(res){console.log(1,'index',res)})
},0)
  }

