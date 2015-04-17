/**
 * @param index optional. Default config.default_index
 * @param type optional. Default config.defaut_type 
 * @param body the instructions in format of native es multi search
 *
 */
var _ = require('underscore')
var debug = require('debug')('MultiSearch')
function MultiSearch(es){
  this.es = es
}

MultiSearch.prototype.gobble = function(params){
  return this.swallow(this.chew(params))
}

MultiSearch.prototype.chew = function(params){
  var def_index = params.index || this.es.config.default_index,   
  def_type = params.type || this.es.config.default_type,
  instructions = params.body

  for(var i = 0; i< params.body.length; i += 2){
    if(!instructions[i].index)
      instructions[i].index = def_index 
    if(!instructions[i].type)
      instructions[i].type = def_type
  } 
  return instructions
}

MultiSearch.prototype.swallow = function(m_search_instructions){
  return this.es.native.msearch({
    body: m_search_instructions
  })
  .then(function(res){
    return res.responses
  })
}

module.exports = MultiSearch

if(require.main === module){

  var EpicSearch = require('../../index')
  var config = require('../../config')
  var es = new EpicSearch(config)
  es.msearch({
    body : [{search_type:'count'},{query:{term:{url:13}}},{},{query:{term:{url:12}}}]
  })
  .then(function(res){debug(JSON.stringify(res))})
  es.msearch({
    body : [{search_type:'count'},{query:{term:{url:1}}},{},{query:{term:{url:2}}}]
  })
  .then(function(res){debug(JSON.stringify(res))})
}
