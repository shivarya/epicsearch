var 
  _ = require('underscore'),
  aggregate = require('./aggregator'),
  fns = {
    mpu : require('./lib/percolate/mpu'),
    save_dedup : require('./lib/index/dedup'),
    bulk_insert : require('./lib/index/bulk'),
    get_first : require('./lib/get'),
    delete_dups : require('./lib/delete/dup_deleter')
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

