var debug = require('debug')('resolveJoins')
var _ = require('lodash')
var async = require('async-q')
var Q = require('q')

var es = require('../es')
var configs = require('../../../configs')
var fieldsToFetch = require('./fieldsToFetch')
module.exports = function(esDoc, lang, context, joins) {
  
  var data = esDoc._source || esDoc.fields
  var joins = joins || _.get(configs, context)[esDoc._type].joins
  var schema = configs['schema'][esDoc._type]
  return joins && async.each(joins, function(joinField) {
      var config = _.get(configs, context)
      var toJoinFieldName = joinField.fieldName
      var fieldSchema = schema[toJoinFieldName].type
      var fieldType = _.isArray(fieldSchema) && fieldSchema[0] || fieldSchema

      var toJoinIds = data[toJoinFieldName]
      if (!toJoinIds) {
        return Q()
      }
      toJoinIds = (_.isArray(toJoinIds) && toJoinIds) || [toJoinIds]

      //Resetting the joinField value doc
      if (_.isArray(fieldSchema)) {
        data[toJoinFieldName] = []
      } //Else let it be. It will be replaced with joined Doc
      //we will replace array of ids with their respective documents
      return async.each(toJoinIds, function(id) {
          return require('./read')({
            type: fieldType,
            _id: id,
            fields: fieldsToFetch.forEntity(fieldType, joinField, lang),
            joins: joinField.joins,
            lang: lang
          })
        })
        .then(function(toJoinDocs) {
          data[toJoinFieldName] = toJoinDocs
            /**debug(_.isArray(fieldSchema.type), fieldSchema)
            if (_.isArray(fieldSchema.type)) {
              _.each(toJoinDocs, function(toJoinDoc) {
                data[toJoinFieldName].push(toJoinDoc)
              })
            } else {
              data[toJoinFieldName] = toJoinDocs[0]
            }**/
        })
    })
    .then(function() {
      return esDoc
    }) || Q(esDoc)
}
