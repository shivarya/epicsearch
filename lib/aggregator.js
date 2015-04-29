var 
  _ = require('underscore'),
  Q = require('q'),
  utils = require('./utils'),
  debug = require('debug')('aggregator')

var Aggregator = function(config){
  this.config = config
  this.fnsStates = {}
}

Aggregator.prototype.agg = function(fnName, fn, args) {
  var bulkSizes = this.config.batch_sizes,
  timeouts = this.config.timeouts
  
  if(!bulkSizes[fnName] && !timeouts[fnName])
    return fn.gobble.apply(fn,args)
  
  if(!this.fnsStates[fnName])//initialize the state
    this.fnsStates[fnName] = {requestArgs:[],defers:[]}
  
  var fnState = this.fnsStates[fnName],
  deferred = Q.defer()
  fnState.defers.push(deferred)
  fnState.requestArgs.push(args)

  if(bulkSizes[fnName] && (bulkSizes[fnName] <= fnState.requestArgs.length)) {//bulk limit crossed
    this.flush(fnName,fn)
  } else if(fnState.requestArgs.length == 1 && timeouts[fnName]){//This is first request being queued
    var that = this
    fnState.flushTimeout = setTimeout(function(){
        clearTimeout(fnState.flushTimeout)
        delete fnState.flushTimeout
        //debug('firing functions after timeout ', fnName)
        that.flush(fnName,fn)
      },
      timeouts[fnName]
    )
  }
  
  return deferred.promise
}

Aggregator.prototype.flush = function(fnName, fn){
  var fnState = this.fnsStates[fnName]
  if(fnState.flushTimeout){ //clear it
    clearTimeout(fnState.flushTimeout)
    delete fnState.flushTimeout
  }
  //Clear the state
  this.fnsStates[fnName] = {requestArgs:[],defers:[]}
  //Now process all the requestArgs together in a single call
  this.process_bulk(fn, fnState.requestArgs)
  .then(function(results){//Results must be resolved in same order as requestArgs
    
    //debug('processed and split', results)
    _.values(results).forEach(function(res,i){
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

Aggregator.prototype.process_bulk = function(fn,reqsArgs){
  var bulkInstructions = {}
  var responseSizes = {} 
  var finalResults = {}
  
  var promises = reqsArgs.map(function(requestArgs,i){
      return Q.fcall(function(){
        return fn.chew.apply(fn,requestArgs)
      })
      .then(function(chewed){
        if(_.isArray(chewed)) {
          responseSizes[i] = chewed.length/2
          bulkInstructions[i] = chewed
        } else if(chewed){
          responseSizes[i] = chewed.response_size
          bulkInstructions[i] = chewed.instructions
        } else {
          throw new Error('empty response from chew in ',fn, requestArgs)
        }
      })
      .catch(function(err){
        finalResults[i] = { error: err }
      })
    })
  return Q.allSettled(promises)
  .then(function(){
    //Make bulk_instiructions
    return _.flatten(_.values(bulkInstructions))
  }) 
  .then(function(){return fn.swallow.apply(fn,arguments)})
  .then(function(results) {
    results = utils.split_by_counts(results,responseSizes)
    var j = 0
    _.keys(bulkInstructions)
    .forEach(function(i){
      finalResults[i] = results[j++] 
    })
    return finalResults
  })
}
module.exports = Aggregator
