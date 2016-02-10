var debug = require('debug')('test getRoleCheck')
var _ = require('lodash')

var EpicSearch = require('./../index')
var configs = require('./configs')

var es = new EpicSearch(configs)

es.get.agg({
    index: 'events',
    type: 'event',
    id: '2',
    role: 1
  })
  .then(function(r) {
    debug('res', JSON.stringify(r))
  })
  .catch(function(err) {
    error('erroed out', err)
  })

/*
{
    body: {
      docs: [{
        _index: 'events',
        _type: 'event',
        _id: '2',
        role: 1
      }, {
        _index: 'indexB',
        _type: 'typeB',
        _id: '1'
      }]
    }
  }

*/
