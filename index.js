var 
  elasticsearch = require('elasticsearch'),
  _ = require('underscore'),
  fns = {
    search: './lib/search/index',
    msearch: './lib/search/multi_search',
    mpu : './lib/percolate/mpu',
    get_first : './lib/get/first',
    get_dups : './lib/get/dups',
    delete_dups : './lib/delete/delete_dups',
    find_and_delete_dups : './lib/delete/find_delete_dups',
    index_by_unique: './lib/index/byUniqueKey',
    bulk_insert : './lib/index/bulk'
  }

var EpicSearch = function(config){
  if(typeof config === 'string'){//it is path to config
    config = require(config)
  }
  
  this.es = new elasticsearch.Client(config.clientParams)
  this.es.native = {}

  if(config.cloneClientParams) {
    this.es.cloneClient = new elasticsearch.Client(config.cloneClientParams)
  }
  
  this.es.config = config
  
  var Aggregator = require('./lib/aggregator'),
  aggregator = new Aggregator(config.bulk_params),
  es = this.es

  _.keys(fns)
  .forEach(function(fn){
    if(es[fn]){
      es.native[fn] = es[fn].bind(es)
    }  
    
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

