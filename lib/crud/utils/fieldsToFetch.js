var debug = require('debug')('fieldsToFetch')
var _ = require('lodash')

var configs = require('../../../configs')

function forEntities(entityTypes, context, lang) {
  return _.chain(entityTypes)
    .reduce(function(soFar, entityType) {
      soFar.push(forEntity(entityType, context, lang))
      return soFar
    }, [])
    .flatten()
    .uniq()
    .value()
}

function forEntity(entityType, context, lang) {
  var contextConfig = _.isString(context) ? _.get(configs, context)[entityType] : context
  var schema = configs.schema[entityType]
  var toFetchFields = contextConfig.fields
  if (toFetchFields && contextConfig.joins) {

    //Do union of joins and fields
    var toJoinFields = _.pluck(contextConfig.joins, 'fieldName')
    toFetchFields = toFetchFields.concat(toJoinFields)
  }

  //Add language prefix to fields
  return toFetchFields.map(function(field) {
    if (!schema[field]) console.log(field, schema[field])
    if (schema[field].multiLingual) {

      return lang + '.' + field

    } else {

      return field

    }
  })
}

module.exports = {
  forEntities : forEntities,
  forEntity : forEntity
}
