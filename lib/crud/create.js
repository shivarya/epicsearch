var es = require('../es')

module.exports = function(params, socket) {
  console.log('params', params);
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

  es.index({
    index: params.type + 's',
    type: params.type,
    body: params.body
  }).then(function(res) {
    // emit the Successful messages for creation of entiy.
    socket.emit('c-entity.done', {
      message: params.type + ' created successfully!',
      status: 201,
      response: res
    });
  }).catch(function(err) {
    console.log(err)
      // emit error in creating entity in database
    socket.emit('c-entity.error', {
      message: 'Error in creating ' + params.index + ' in database',
      code: 500,
      error: err
    })
  })

  .done()

}

if (require.main === module) {
  module.exports({
    foo: 'bar'
  })
}
