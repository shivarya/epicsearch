var 
  elasticsearch = require('elasticsearch'),
  _ = require('underscore'),
  fns = {
    //mpu : require('./lib/percolate/mpu'),
    //save_dedup : require('./lib/index/dedup'),
    //bulk_insert : require('./lib/index/bulk'),
    get_first : './lib/get'
    //delete_dups : require('./lib/delete/dup_deleter')
  }

var EpicSearch = function(config){
  if(typeof config === 'string'){//it is path to config
    config = require(config)
  }
  
  this.es = new elasticsearch.Client(config.clientParams)
  
  if(config.cloneClientParams) {
    this.es.cloneClient = new elasticsearch.Client(config.cloneClientParams)
  }
  
  this.es.config = config
 
  var Aggregator = require('./lib/aggregator'),
  aggregator = new Aggregator(config.bulk_params),
  es = this.es

  _.keys(fns)
  .forEach(function(fn){
    var f = require(fns[fn]),
    g = new f(es)
    es[fn] = function(){
      return aggregator.agg(fn,g,arguments)
    }
  })
}

module.exports = function(config){
  return new EpicSearch(config).es
}

