var debug = require('debug')('MGet RoleCheck')
var _ = require('lodash')
var Q = require('q')

// pre should scrutiize the params and send it 
function pre(configs, params) {

  // debug(JSON.stringify(params.body), 'params')
  var docsToSend = []

  var docsToResolve = {}

  if (params.body.docs) {

    _.each(params.body.docs, function(doc, index) {

      if (_.has(doc, 'role')) {
        if (_.has(configs.roles, doc._type)) {
          if (doc.role === configs.roles[doc._type].canRead) {
            docsToSend.push(doc)
          } else {
            docsToResolve[index] = doc
            docsToResolve[index].error = {
              root_cause: [{
                type: 'role_not_allowed',
                reason: '401 Unauthorized',
                index: doc._index
              }],
              type: 'role_not_allowed',
              reason: '401 Unauthorized',
              index: doc._index
            }
          }
        }
      } else {
        docsToSend.push(doc)
      }

    })

  }

  params.body.docs = docsToSend

  return Q(docsToResolve)
}



function post(configs, response, docsToResolve) {

  _.keys(docsToResolve).forEach(function(docKey) {
    response.docs.splice(docKey, 0, docsToResolve[docKey])
  })

  return Q(response)
}

module.exports.pre = pre
module.exports.post = post
