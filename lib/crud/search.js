var debug = require('debug')('search')
var _ = require('lodash')
var async = require('async-q')

var es = require('../es')
var configs = require('../../../configs/index')
var fieldsToFetch = require('./fieldsToFetch')
var sanitize = require('./sanitizeEsResponse')

module.exports = function(params) {

  debug('queryParams', JSON.stringify(query(params)))
  return es.search(query(params))
    .then(function(res) {

      return async.each(res.hits.hits, function(doc) {
        sanitize(doc, params.lang)
        return require('./resolveJoins')(doc, params.lang, params.context)
      })
    })
}


function query(params) {

  var index
  var type = params.type
  var fields = params.fields

  if (!type) {

    index = configs.entityTypes.map(function(entityType) {
      return entityType + 's'
    })

    type = configs.entityTypes
  } else if (!_.isArray(params.type)) {

    params.type = [params.type]
  }

  if (params.suggest) {

    var fieldsToQuery = toQueryFields(params.type, params.lang)
    var multiMatch = {
      multi_match: {
        query: params.q,
        fields: fieldsToQuery
      }
    }

    debug(params.q, toFetchEntityFields)

    return {
      index: index,
      type: type,
      body: {
        query: multiMatch
      }
    }

  } else {

    var toFetchFields = fieldsToFetch.forEntities(configs.entityTypes, params.context, params.lang)
    var mustClauses = params.filters || []

    if (params.q) {
      mustClauses.push({
        query_string: {
          query: params.q
        }
      })
    }

    return {

      index: index,
      type: type,
      fields: fields || toFetchFields,
      from: params.from || 0,
      size: params.size || 20,
      body: {
        query: {
          bool: {
            must: mustClauses
          }
        }
      }

    }
  }
}

function toQueryFields(entityType, lang) {

  var entitySchema = configs.schema[entityType]

  var fields = _.filter(_.keys(entitySchema), function(field) {

    return entitySchema[field]['autoSuggestion']
  })

  return _.map(fields, function(field) {

    if (entitySchema[field].multiLingual) {

      return lang + '.' + field + '.' + 'suggest'

    } else {

      return field + 'suggest'

    }

  })

}


if (require.main === module) {

  module.exports({
      q: 'franco',
      lang: 'english',
      context: 'web.search'
    })
    .then(function(res) {
      debug(JSON.stringify(res))
    })
    .catch(debug)
}
