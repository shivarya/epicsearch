var 
  _ = require('underscore'),
  Q = require('q'),
  utils = require('./utils'),
  debug = require('debug')('aggregator')

var Aggregator = function(config){
  this.config = config
  this.fns_states = {}
}

Aggregator.prototype.agg = function(fnName, fn, args) {
  var bulkSizes = this.config.batch_sizes,
  timeouts = this.config.timeouts
  
  if(!bulkSizes[fnName] && !timeouts[fnName])
    return fn.gobble.apply(fn,args)
  
  if(!this.fns_states[fnName])//initialize the state
    this.fns_states[fnName] = {request_args:[],defers:[]}
  
  var fnState = this.fns_states[fnName],
  deferred = Q.defer()
  fnState.defers.push(deferred)
  fnState.request_args.push(args)

  if(bulkSizes[fnName] && (bulkSizes[fnName] <= fnState.request_args.length)) {//bulk limit crossed
    this.flush(fnName,fn)
  } else if(fnState.request_args.length == 1 && timeouts[fnName]){//This is first request being queued
    var that = this
    fnState.flush_timeout = setTimeout(function(){
        clearTimeout(fnState.flush_timeout)
        delete fnState.flush_timeout
        debug('firing functions after timeout ', fnName)
        that.flush(fnName,fn)
      },
      timeouts[fnName]
    )
  }
  
  return deferred.promise
}

Aggregator.prototype.flush = function(fnName, fn){
  var fnState = this.fns_states[fnName]
  if(fnState.flush_timeout){ //clear it
    clearTimeout(fnState.flush_timeout)
    delete fnState.flush_timeout
  }
  //Clear the state
  this.fns_states[fnName] = {request_args:[],defers:[]}
  //Now process all the request_args together in a single call
  this.process_bulk(fn, fnState.request_args)
  .then(function(results){//Results must be resolved in same order as request_args
    
    debug('processed and split', results)
    results.forEach(function(res,i){
      if(res && res.error){
        fnState.defers[i].reject(res.error)       
      } else {
        fnState.defers[i].resolve(res)       
      }
    })
  })
  .catch(function(err){
    fnState.defers.forEach(function(defer){
      defer.reject(err)
    })
  }) 
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
