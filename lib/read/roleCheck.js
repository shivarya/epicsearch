var debug = require('debug')('READ roleCheck')
var Q = require('q')


function pre(configs, params) {
  debug('READ roleCheck', params)
  return Q(params)
}

function post(configs, response) {
  debug(params)
  return Q(response)
}

module.exports.pre = pre
module.exports.post = post
