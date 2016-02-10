var debug = require('debug')('test getRoleCheck')
var _ = require('lodash')

var EpicSearch = require('./../index')
var configs = require('./configs')

var es = new EpicSearch(configs)

es.mget({
    body: {
      docs: [{
        _id: 2,
        _index: 'events',
        _type: 'event'
      }]
    }
  })
  .then(debug)
  .catch(debug)
