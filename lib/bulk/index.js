var _  = require('lodash')

var debug = require('debug')('Bulk')


/**
 * @param index the index in which to insert
 * @param type of documents
 */

function Bulk(es) {
  this.es = es
}

Bulk.prototype.gobble = function(params) {

  return this.swallow(this.chew(params))
}

Bulk.prototype.chew = function(params) {

  var instructions = params.body
  var skipNext = false
  var instructionsCount = 0
  instructions.forEach(function(instruction) {

    if (skipNext) {
      skipNext = false
      return
    }

    var key = Object.keys(instruction)[0]

    instructionsCount++

    if (key === 'delete') {
      skipNext = false
    }

    instruction[key]._index = instruction[key]._index || params.index
    instruction[key]._type = instruction[key]._type || params.type

  })

  return {
    instructions: instructions,
    response_size: instructionsCount
  }
}

Bulk.prototype.swallow = function(commands) {
  return this.es.bulk({body: commands})
}

module.exports = Bulk

if (require.main === module) {

  var EpicSearch = require('../../index')
  var config = require('../../config')
  var es = new EpicSearch(config)

  es.bulk.agg({body: [{delete: {_type: 'test2', _index: 'test2', _id: '1'}}]})
  .then(function(res) {debug(JSON.stringify(res)); return true})
  .catch(debug)

  es.bulk.agg({body: [{index: {_id: 'Wase5HP7Tb6WlLzNSSbvzA'}},{url: 14},{index: {_index: 'test2', _type: 'test2', _id: 1}},{url: 12}], index: 'test1', type: 'test1'})
  .then(function(res) {debug(JSON.stringify(res)); return true})
  .catch(debug)

  /**es.bulk_index.agg({docs:[{url:12,_id:1}]})
  .then(debug)
  es.bulk_index.agg({docs:[{url:13}]})
  .then(debug)**/
}

