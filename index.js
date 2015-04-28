var 
  debug = require('debug')('IndexByUnique'),
  elasticsearch = require('elasticsearch'),
  _ = require('underscore'),
  fns = {
    get: './lib/get/index',
    mget: './lib/get/mget',
    search: './lib/search/index',
    msearch: './lib/search/multi_search',
    mpu : './lib/percolate/mpu',
    get_first : './lib/get/first',
    get_dups : './lib/get/dups',
    delete_dups : './lib/delete/delete_dups',
    find_and_delete_dups : './lib/delete/find_delete_dups',
    index_by_unique: './lib/index/byUniqueKey',
    bulk_index : './lib/index/bulk'
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
  aggregator = new Aggregator(config),
  es = this.es

  _.keys(fns)
  .forEach(function(fnName){
    if(es[fnName]){
      es.native[fnName] = es[fnName].bind(es)
    }  
    
    var f = require(fns[fnName])
    f = new f(es)
    var aggregated = function(){
      return aggregator.agg(fnName,f,arguments)
    }
    es[fnName] = aggregated
    es[fnName].native = f
  })
}

module.exports = function(config){
  return new EpicSearch(config).es
}

