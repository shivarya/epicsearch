var debug = require('debug')('test getRoleCheck')
var _ = require('lodash')

var EpicSearch = require('./../index')
var configs = require('./configs')

var es = new EpicSearch(configs)

es.get({
    id: 2,
    index: 'events',
    type: 'event',
    role: 1
  })
  .then(function(r) {
    debug('res', JSON.stringify(r))
  })
  .catch(function(err) {
    error('errored out', err)
  })
