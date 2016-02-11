var debug = require('debug')('Benchmark')
var EpicSearch = require('./../index')
var config = require('./../tests/configs')
var es = new EpicSearch(config)

var i = 0

function get() {
    for (var j = 0; j < 1000; j++) {
        es.get.agg({
            index: 'tests',
            type: 'test',
            id: 1
        })//.then(debug)
    }

    i++
944
    debug(i)

    if (i <= 300) {
      setTimeout(get, 100)
    }

}

get()
