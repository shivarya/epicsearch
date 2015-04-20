module.exports =   {
    clientParams:{
      hosts : [{'host': 'localhost', 'protocol': 'http', 'port': 9200}],
      requestTimeout: 90000,
      maxConnections: 200
    },
    /**cloneClientParams:{
      hosts : [{'host': 'ep-st1', 'protocol': 'http', 'port': 9200}],
      requestTimeout: 90000,
      maxConnections: 200
    },**/
    default_index : 'test',
    default_type: 'test',
    percolate:{
      query_index: 'queries'
    },
    batch_sizes: {
      mpu:2,
      msearch: 2, 
      mget: 2,
      get:2,
      //get_first:2,
      bulk_index:2 
    },
    timeouts: {
      get: 1000,
      mget: 1000,
      msearch: 1000
    }
  }
