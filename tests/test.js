var EpicSearch = require('./index')
var config = require('./config')
var es = new EpicSearch(config)

es.crudUpdate({
    type: 'event',
    _id: 'AVHDEPUuQpxtrIE1g6xi',
    update: {
      set: {
        title_english: 'vab'
      }
    }
  })
  .then(function(res) {
    console.log(2, 'get', res)
  })
  .catch(console.log)
