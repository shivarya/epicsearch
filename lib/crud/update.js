var _ = require('lodash')
var updater = require('js-object-updater')
var es = require('../es')


module.exports = function(params, socket) {
  var missingArgumentMessage
  if (!params._id) {
    missingArgumentMessage = "_id missing"
  } else if (!params.type) {
    missingArgumentMessage = "type missing"
  }
  if (missingArgumentMessage) {
    socket.emit('u-entity.error', {
      message: "Illegal Argument Exception: " + missingArgumentMessage,
      code: 400
    })
  }

  return es.get({
      index: params.type + "s",
      type: params.type,
      id: params._id
    })
    .then(function(res) {
      console.log("1", res._source)
      updater({
        doc: res._source,
        update: params.update,
        force: true
      })
      return es.index({
        index: params.type + "s",
        type: params.type,
        id: params._id,
        body: res._source
      })
    })
    .then(function(res) {
      console.log(res)
      socket.emit("u-entity.done", {
        message: "Successfully updated " + params.type,
        code: res.status || 204,
        params: params
      })
    })
    .catch(function(err) {
      console.log(err)
      socket.emit("u-entity.error", {
        message: "Error in updating " + params.type,
        code: err.status || 500,
        error: err,
        params: params
      })
    })
}
