var _ = require('lodash')

var roles = require('./roles')
var esConfigs = require('./esConfig')

var configsToLoad = ['schema', 'web.read', 'web.search']
var entities = ['person', 'event', 'speaker', 'session', 'video', 'audio']
var languages = ['english', 'french']


var entityConfigs = {}

configsToLoad.forEach(function(path) {

  path = path.split('.')
  var configAtPath = entityConfigs

  path.forEach(function(key) {
    if (!configAtPath[key]) {
      configAtPath[key] = {}
    }
    configAtPath = configAtPath[key]
  })

  entities.forEach(function(entityType) {
    var configName = _.includes(['video', 'audio'], entityType) ? 'media' : entityType
    deepGet(entityConfigs, path)[entityType] = require('./' + path.join('/') + '/' + configName)
  })
})

function deepGet(o, path) {
  var nested = o
  path.forEach(function(key) {
    nested = nested && nested[key]
  })
  return nested
}


module.exports = _.merge(entityConfigs, esConfigs) // combine esConfigs
module.exports.entityTypes = entities
module.exports.entityLanguages = languages
module.exports.roles = roles
