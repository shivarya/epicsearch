var 
  _ = require('underscore'),
  Q = require('q'),
  bulkSizes = require('../config').bulk_params,
  fns_states = {}

_.keys(bulkSizes).forEach(function(fnName){
  fns_states[fnName] = {request_args:[],defers:[]}
})



module.exports = function(fnName, fn, args) {
  if(!bulkSizes[fnName])
    return fn.apply(null,args)
  var fnState = fns_states[fnName]
  var deferred = Q.defer()
  fnState.defers.push(deferred)
  fnState.request_args.push(args)

  if(bulkSizes[fnName] <= fns_states[fnName].request_args.length) {//bulk limit crossed
    //Clear the state
    fns_states[fnName] = {request_args:[],defers:[]}
    //Now process all the request_args together in a single call
    fn.process_bulk.apply(null, fnState.request_args)
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
