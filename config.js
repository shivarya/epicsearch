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
    bulk_params: {
      mpu:2,
      get_first:2,
      bulk_insert:2 
    }
  }
