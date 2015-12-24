var _ = require('lodash')
var es = require('../es')

/**
{
    type: "entitytype",
     _id: "id",
    fields: [
        'fieldname'
    ],
    joins: {
        "entityType": [
            "fieldname"
        ]
    }
}
**/
module.exports = function(params, socket) {
  var missingArgumentMessage
  if (!params._id) {
    missingArgumentMessage = "_id missing"
  } else if (!params.type) {
    missingArgumentMessage = "type missing"
  }
  if (missingArgumentMessage) {
    socket.emit('r-entity.error', {
      message: "Illegal Argument Exception: " + missingArgumentMessage,
      code: 400
    })
  }

  var toFetchFields = params.fields
  if (toFetchFields && !toFetchFields.length) {
    toFetchFields = toFetchFields.concat(_.keys(params.joins))
  }

  return es.get({
      index: params.type + "s",
      type: params.type,
      id: params._id,
      fields: toFetchFields
    })
    .then(function(response) {
      if (params.joins) {
        return resolveJoins(response._source || response.fields, params.joins)
      } else {
        return response._source || response.fields
      }
    })
    .then(function(res) {
      socket.emit("r-entity.done", {
        message: "Successfully read " + params.type,
        code: 200,
        body: res,
        params: params
      })
    })
    .catch(function(err) {
      socket.emit("r-entity.error", {
        message: "Error in reading " + params.type,
        code: 500,
        err: err,
        params: params
      })
    })
}

function resolveJoins(doc, joins) {
  var mgetInstructions = []
  var joinFields = _.keys(joins)

  _.each(joinFields, function(joinField) {
    console.log("joinField", joinField)
    console.log("isArray", _.isArray(doc[joinField]))
    console.log("doc", doc, "docField", doc[joinField])
    console.log((_.isArray(doc[joinField]) && doc[joinField]))

    var toJoinValues = (_.isArray(doc[joinField]) && doc[joinField]) || [doc[joinField]]

    _.each(toJoinValues, function(id) {

      mgetInstructions.push({
        _index: joinField + 's',
        _type: joinField,
        _id: id,
        fields: joins[joinField].fields
      })

    })

    doc[joinField] = []
  })

  return es.mget({
      body: {
        docs: mgetInstructions
      }
    })
    .then(function(res) {
      _.each(res.docs, function(toJoinDoc) {
        doc[toJoinDoc._type].push(toJoinDoc._source || toJoinDoc.fields)
      })
      return doc
    })
}
