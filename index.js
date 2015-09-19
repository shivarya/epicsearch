var
  debug = require('debug')('EpicSearch/Index'),
  elasticsearch = require('elasticsearch'),
  _ = require('lodash'),
  fns = {
    get: './lib/get/index',
    mget: './lib/get/mget',
    search: './lib/search/index',
    msearch: './lib/search/multi_search',
    mpu: './lib/percolate/mpu',
    get_first: './lib/get/first',
    get_dups: './lib/get/dups',
    delete_dups: './lib/delete/delete_dups',
    find_and_delete_dups: './lib/delete/find_delete_dups',
    index_by_unique: './lib/index/byUniqueKey',
    bulk_index: './lib/index/bulk',
    index: './lib/index/index'
  }

var EpicSearch = function(config) {
  if (typeof config === 'string') {//it is path to config
    config = require(config)
  }

  this.es = new elasticsearch.Client(_.clone(config.clientParams))
  //this.es.native = {}

  if (config.cloneClientParams) {
    this.es.cloneClient = new elasticsearch.Client(_.clone(config.cloneClientParams))
  }

  this.es.config = config

  var Aggregator = require('./lib/aggregator')
  var aggregator = new Aggregator(config)
  var es = this.es

  _.keys(fns)
  .forEach(function(fnName) {

    var AggregatingFunction = require(fns[fnName])
    var fn = new AggregatingFunction(es)

    var aggregatedFn = function() {
      return aggregator.agg(fnName, fn, arguments)
    }

    es[fnName] = es[fnName] || aggregatedFn
    es[fnName].agg = aggregatedFn
  })
}

module.exports = function(config) {
  return new EpicSearch(config).es
}

