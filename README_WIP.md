#Elasticsearch in nodejs ++

Request batching for heavy load performance optimization and some useful utlity methods added on top of Elasticsearch's official nodejs module v ^8.0.1

Installation

npm install epicsearch

Setup

```
var epicsearch = require('epicsearch')
var es = new epicsearch(config) //These two lines replace your require('elasticsearch') and new elasticsearch.client(config) calls
```

The config will look something like this
```Javascript
  { 
    clientParams: {
      hosts: [{'host': 'localhost', 'protocol': 'http', 'port': 9200}],
      requestTimeout: 90000,
      maxConnections: 200
    },
    cloneClientParams:{ 
      hosts : [{'host': 'ep-st1', 'protocol': 'http', 'port': 9200}],
      requestTimeout: 90000,
      maxConnections: 200
    },
    percolate:{
      query_index: 'queries'
    },
    batch_sizes: {
      mpu: 2,
      msearch: 50, 
      index: 50,
      mget: 10,
      get: 10,
      bulk_index: 50,
      search: 50
    },
    timeouts: {
      index: 2000,
      index_by_unique: 2000,
      getFirst: 2000,
      bulk_index: 1000,
      get: 2000,
      mget: 2000,
      search: 2000,
      msearch: 2000
    }
  }
```
From here on, you can use the epicsearch 'es' client instance, as you would have used elasticsearch module in your code. Epicsearch is first a wrapper around Elasticsearch module and, it provides some added features on top. For all elasticsearch module supported methods, it will simply delegate the calls to embedded elasticsearch module. If you are already using elasticsearch, you will see no change anywhere, whether in code or in es requests form/flow. Once you start using any epicsearch specific features (mentioned below), then epicsearch will come into play.

###PERFORMANCE FEATURE
####Bulk batching of queries for much better performance

Aggregate multiple requests (of same kind) from different places in your application logic, for better performance under heavy search/get/index/bulk query load. The requests will be collected till either the bulk_size or timeout threshold for that request are breached. Once the threshold is crossed, the requests are flushed to Elasticsearch backend in one bulk request. The value of bulk_size or timeout can be set in passed config at client creation time. This is a significant performance optimization when you are making hundreds of independent (but same kind of ) queries in parallel.

In order to use this query aggregation, just append .agg to your existing elasticsearch-js call. 

For example, 
```
es.get.agg({index:"test", type: "test", id: "1"}).then() //Notice the .agg there? That is all you have got to do

es.{method}.agg(esMethodParams)
``` 
Request and response format is designed to be same as ES. 

Currently supporting batching for methods: index, index_by_unique, get_first, bulk_index, get, mget, search, msearch

###FUNCTIONAL FEATURES

GET_FIRST

Elasticsearch does not support uniqueness constraint. In case your store tends to accumulate duplicates over time, the primary document with field===val can be identified by applying a sort. This function returns that doc, and also the count of docs matching given key/val in the index/type supplied.

/**
 *Gives first document with field===value, and the total documents
 *matching field===value. Uses sort to determine the first document. 
 *
 *@param index The index to search on. Default is config.default_index
 *@param type The type of document to be matched. Default is config.default_type
 *@param field The field on which to do term query to get first document matching it
 *@param val The value to match for given field
 *@param match The type of match to do like match_phrase. If not specified, term match is done. 
 *@param sort How to sort the duplicates for field:  val
 *@param fields array of stored fields to fetch from ES object. Optional. If not specified the whole object is returned. 
 */
  es.getFirst({
    index: 'infinity', 
    type: 'members', 
    field: 'tags', 
    val: ['silv3r','vaibhav']},
    sort: {memberSince: 'desc'},
    fields: ['profileUrl']
  ).then(function(res) {
    console.log(res)
  })

PAUSE
Rest of the documentation is in progress..If you are curious about the below mentioned methods, read the albeit outdated description below. Real useful will be to run the tests and see the comments in each function's source file.

Ex. lib/get/first.js. DEBUG=* node lib/get/first.js

DEBUG=* node lib/{fnCategory}/{fnName}.js

Signing off for now.. 3:02 AM, 1/8/15

RESUME
es.save_dedup({doc:{...},key:"url.unanalyzed",value:"epicbeat.epictions.com",index:"test",type:"test"}).then
Workaround for lack of unique id limitation of Elasticsearch. This helps you index (or override existing) docs based on "unique ids" stored in the key field.

es.bulk_index([{a:2},{a:3,_id:1}],{index:'test',type:'test'}).then
Shorter expression for ES bulk_index

es.delete_dups({key:"url",size:1000,del_sort:{fetch_time:"desc"},index:"test",type:"test",multi_key:"url"}).then
Delete all the duplicate from an index/type, for some field

Dumping data to multiple destinations Uncomment the cloneClientParams to also bulk index data into another destination. Useful when you want copy of your data elsewhere.

es.mpu({query_index: "queries",Docs:docs}).then
You can do document transformations on top of a steadily flowing input stream of tweets. Allows you to update JSON documents with rules/update logic registered as percolate queries in your Elasticsearch instanced. The update logic has JSON based DSL, which is documented in percolator/mpu.js

This module is being built (and gifted) with <3, for epicbeat.epictions.com and epicenter.epictions.com

Things to do

Better documentation
Test cases in mocha/chai-as-promised [low-prio]
Add bulk batching for more elasticsearch methods: delete, update, bulk
Performance bechmarks [low prio]
Keep checking out for more updates.
