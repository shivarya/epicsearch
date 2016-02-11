var debug = require('debug')('READ')
var _ = require('lodash')


// var fieldsToFetch = require('./utils/fieldsToFetch')
// var sanitize = require('./utils/sanitizeEsResponse')


module.exports = function(params) {
  debug('params', params)

  // var toFetchFields = params.fields || fieldsToFetch.forEntity(params.type, params.context, params.lang, params.configs)
  /*
  return es.get.agg({
    index: params.index || params.type + 's',
    type: params.type,
    id: params._id,
    role: params.role
  }).then(function(esDoc) {
    return esDoc
  })*/
}


if (require.main === module) {

  var EpicSearch = require('./../../index')
  var config = require('./../../tests/configs')
  var es = new EpicSearch(config)


  es.read({
      index: 'events',
      type: 'event',
      _id: '2',
      role: 1
    }).then(function(r) {
      debug('res', JSON.stringify(r))
    })
    .catch(function(err) {
      error('errored out', err)
    })
}
