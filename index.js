var debug = require('debug')('EpicSearch/Index')
var elasticsearch = require('elasticsearch')
var _ = require('lodash')

var nativeEsFns = {
  get: './lib/get/index',
  mget: './lib/mget/index',
  // Todo: roleCheck 
  search: './lib/search/index',
  msearch: './lib/search/multi_search',
  bulk: './lib/bulk',
  index: './lib/index/index'
}

var utilityFns = {
  mpu: './lib/percolate/mpu',
  get_first: './lib/get/first',
  get_dups: './lib/get/dups',
  delete_dups: './lib/delete/delete_dups',
  find_and_delete_dups: './lib/delete/find_delete_dups',
  index_by_unique: './lib/index/byUniqueKey',
  bulk_index: './lib/index/bulk'
    // Todo: add CRUD utils
}

var EpicSearch = function(config) {


  if (typeof config === 'string') { //it is path to config
    config = require(config)
  }

  this.es = new elasticsearch.Client(_.clone(config.clientParams))

  //this.es.native = {}

  if (config.cloneClientParams) {
    this.es.cloneClient = new elasticsearch.Client(_.clone(config.cloneClientParams))
  }

  this.es.config = config

  wrappedEsFns(nativeEsFns, this.es, this.es.config)
  wrappedUtilityFns(utilityFns, this.es, this.es.config)

}


function wrappedEsFns(fns, es, config) {

  var Aggregator = require('./lib/aggregator')
  var aggregator = new Aggregator(config)

  _.keys(fns)
    .forEach(function(fnName) {


      // Wrap for native ES function
      var nativeEsFunction = es[fnName]

      es[fnName] = function() { // with whatever arguments

        // do entity level role check
        var originalArguments = arguments
        var roleCheck = require('./lib/' + fnName + '/roleCheck')
        var preWithConfig = roleCheck.pre.bind(null, config)
        var postWithConfig = roleCheck.post.bind(null, config)
        var docs

        return preWithConfig.apply(null, originalArguments)
          .then(function(docsToResolve) {

            docs = docsToResolve

            return nativeEsFunction.apply(es, originalArguments)
          })
          .then(function(res) {

            return postWithConfig.apply(null, [res, docs])
          })
          .catch(function(err) {
            return err
          })

      }

      // Wrapp for collect functions
      var AggregatingFunction = require(fns[fnName])
      var fn = new AggregatingFunction(es)

      var aggregatedFn = function() {
        return aggregator.agg(fnName, fn, arguments)
      }

      es[fnName].collect = aggregatedFn

    })

}

function wrappedUtilityFns(fns, es, config) {

  var Aggregator = require('./lib/aggregator')
  var aggregator = new Aggregator(config)

  _.keys(fns)
    .forEach(function(fnName) {

      var AggregatingFunction = require(fns[fnName])
      var fn = new AggregatingFunction(es)

      var aggregatedFn = function() {
        return aggregator.agg(fnName, fn, arguments)
      }

      es[fnName] = aggregatedFn

    })
}

module.exports = function(config) {
  return new EpicSearch(config).es
}
