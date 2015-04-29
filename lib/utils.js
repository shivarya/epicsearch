var _ = require('underscore')
module.exports.split_by_counts = function(arr,counts){
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
