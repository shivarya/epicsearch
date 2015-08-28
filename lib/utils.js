var _ = require('underscore')
var error = require('debug')('util')
var debug = error
error.log = console.log.bind(console)

module.exports.split_by_counts = function(arr,counts){
  

  if(!arr) {
    throw new Error('invalid results supplied for split', arr, counts)
  }
  
  var i = 0
  return _.values(counts).map(function(count){
    var ret = arr.slice(i,i+count)
    i=i+count
    return ret
  })
}

module.exports.only_value = function(obj) {
  for(var key in obj){
    if(obj.hasOwnProperty(key))
      return obj[key] //return the first value we find
  }
}
