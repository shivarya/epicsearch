var 
  _ = require('underscore'),
  aggregate = require('./aggregator'),
  fns = {
    mpu : require('./src/percolate/mpu'),
    save_dedup : require('./src/index/dedup'),
    bulk_insert : require('./src/index/bulk'),
    get_first : require('./src/get')
  }


module.exports = require('./es')
_.keys(fns)
.forEach(
  function(fn){
    module.exports[fn] = function(){
      return aggregate(fn,fns[fn],arguments)
    }
  }
)

