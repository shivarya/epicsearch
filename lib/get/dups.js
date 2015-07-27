/**
 * Returns duplicate values for a given key
 *
 * @param key
 * @param source_key The key which will be available in doc._source, in the multi_field scenario. Default is key
 * @param size how many dups you want at a time
 * @param index default is config.doc_index  
 * @param type the type of documents, default is config.doc_type 
 * 
 */
var debug = require('debug')('FindDups'),
_ = require('underscore')

var defaultSize = 10

function FindDups(es){
  this.es = es
}


FindDups.prototype.gobble = function(params){
  return this.swallow(this.chew(params).instructions)
}

FindDups.prototype.chew = function(params){
  return {
    instructions: [ 
        {
          index: params.index || this.es.config.default_index ,
          type: params.type || this.es.config.default_type
        },
        {   
          aggs: {
            dups: {
              terms: {
                field: params.key,
                size: params.size || defaultSize,
                shard_size: 1000000,
                min_doc_count: 2 //There should be at least two docs by that key for it to delete
              }
            }
          },
          size: 0 
        }
      ],
    response_size: params.size || defaultSize
  }
}

FindDups.prototype.swallow = function(instructions){
  return this.es.msearch({body:instructions})
  .then(function(res){//get the docs to retain for each duped value
    if (res.error) {
      return res
    }
    var dups = res[0].aggregations.dups.buckets
    return dups
  })
}

module.exports = FindDups

if (require.main === module) {
  var EpicSearch = require('../../index')
  var config = require('../../config')
  var es = new EpicSearch(config)

  es.get_dups({key:'url'})
  .then(debug)
  .catch(debug)
}
