var 
  _ = require('underscore'),
  Q = require('q'),
  utils = require('./utils')

var Aggregator = function(bulk_sizes){
  this.bulkSizes = bulk_sizes
  this.fns_states = {}
}

Aggregator.prototype.agg = function(fnName, fn, args) {
  var bulkSizes = this.bulkSizes,
  fns_states = this.fns_states
  if(!bulkSizes[fnName])
    return fn.gobble.apply(fn,args)
  if(!fns_states[fnName])
    fns_states[fnName] = {request_args:[],defers:[]}
  var fnState = fns_states[fnName]
  var deferred = Q.defer()
  fnState.defers.push(deferred)
  fnState.request_args.push(args)

  if(bulkSizes[fnName] <= fns_states[fnName].request_args.length) {//bulk limit crossed
    //Clear the state
    fns_states[fnName] = {request_args:[],defers:[]}
    //Now process all the request_args together in a single call
    this.process_bulk(fn, fnState.request_args)
    .then(function(results){//Results must be resolved in same order as request_args
      results.forEach(function(res,i){
        fnState.defers[i].resolve(res)       
      })
    })
    .catch(function(err){
      fnState.defers.forEach(function(defer){
        defer.reject(err)
      })
    }) 
  }
  
  return deferred.promise
}
Aggregator.prototype.process_bulk = function(fn,reqs_args){
  var responseSizes = []
  var bulk_instructions = 
    _.chain(reqs_args)
    .map(function(request){
      var chewed = fn.chew.apply(fn,request)
      if(_.isArray(chewed)) {
        responseSizes.push(chewed.length/2)
        return chewed
      } else {
        responseSizes.push(chewed.response_size)
        return chewed.instructions
      }
    })
   .flatten()
   .value()
  
  return fn.swallow(bulk_instructions)
  .then(function(results){
    return utils.split_by_counts(results,responseSizes)
  })
}
module.exports = Aggregator
