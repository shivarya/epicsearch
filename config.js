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
    bulk_params: {
      mpu:1,
      get_first:1,
      bulk_insert:1 
    }
  }
