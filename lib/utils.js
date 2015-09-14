var _ = require('lodash')
var error = require('debug')('util')
var debug = error
error.log = console.log.bind(console)

module.exports.split_by_counts = function(arr,counts) {

  if (!arr) {
    throw new Error('invalid results supplied for split', arr, counts)
  }

  var i = 0
  return _.values(counts).map(function(count) {

    var ret = arr.slice(i, i + count)
    i = i + count
    return ret

  })
}

module.exports.only_value = function(obj) {

  for (var key in obj) {

    if (obj.hasOwnProperty(key)) {
      return obj[key] //return the first value we find
    }

  }
}

module.exports.hasError = function(o) {
  if (_.isPlainObject(o)) {

    if (o.error) {

      return true

    }

  } else if (_.isArray(o)) {
    var erroredItem = _.find(o, function(i) {
      return i && i.error || i && i.err
    })

    if (erroredItem) {
      return true
    }
  }

  return false

}

if (require.main === module) {
  console.log(module.exports.hasError([{err:1},{}]))

}
