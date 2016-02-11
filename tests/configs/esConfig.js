module.exports = {
  clientParams: {
    hosts: [{
      'host': 'localhost',
      'protocol': 'http',
      'port': 9200
    }],
    requestTimeout: 90000,
    maxConnections: 200
  },
  /**cloneClientParams:{
    hosts: [{'host': 'ep-st1', 'protocol': 'http', 'port': 9200}],
    requestTimeout: 90000,
    maxConnections: 200
  },**/
  percolate: {
    query_index: 'queries'
  },
  batch_sizes: {
    mpu: 2,
    msearch: 2,
    index: 20,
    mget: 2,
    get: 500,
    bulk_index: 2,
    search: 1,
    bulk: 20 //This is required as 1, since search internally
      //uses msearch and stripArrayResponses doesn't work if timeout or size is not set
  },
  timeouts: {
    index: 1000,
    index_by_unique: 1000,
//    get_first: 2000,
    bulk_index: 1000,
    get: 100,
    bulk: 2000,
    mget: 1000,
    msearch: 1000
  }
}