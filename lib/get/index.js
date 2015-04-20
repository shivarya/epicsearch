
/**
 * Same format as native ES get Api
 * @param index
 * @param type
 * @param id
 */

var _ = require('underscore')
var debug = require('debug')('Get')
function Get(es){
  this.es = es
}

Get.prototype.gobble = function(query){
  debug('about to gobble',query)
  return this.swallow(this.chew(query).instructions)
}

Get.prototype.chew = function(query){
  var index = query.index || this.es.config.default_index,   
  type = query.type || this.es.config.default_type
   
  return{ 
    instructions: [{
      _index: index,
      _type: type,
      _id: query.id
    }],
    response_size: 1
  }
}

Get.prototype.swallow = function(mget_instructions){
  if(!_.isArray(mget_instructions))
    mget_instructions = [mget_instructions] 
  debug(mget_instructions)
  return this.es.mget({
    body: {
      docs: mget_instructions
    }
  })
}

module.exports = Get

if(require.main === module){

  var EpicGet = require('../../index')
  var config = require('../../config')
  var es = new EpicGet(config)
  es.get({id:1})
  .then(function(res){debug('1',JSON.stringify(res))})
  es.get({id:4})
  .then(function(res){debug('2',JSON.stringify(res))})
  es.mget({body:{ids:[13,2]}})
  .then(function(res){debug('3',JSON.stringify(res))})
}
