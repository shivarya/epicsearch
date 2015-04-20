# epicsearch
Elasticsearch Nodejs client made epic!  

**npm install epicsearch**    

EpicSearch is ElasticSearch in nodejs (v4.0.2) made ++ 

Just replace require ('elasticsearch') with    
**var es = require('epicsearch')**  

And enjoy some additional functionality on top of what native elasticsearch client provides.  

Just Added a major performance upgrade: bulk batching of important elasticsearch methods like get/mget/bulk_index/search/msearch
**Note: This documentation is currently outdated. Will update it soon**

**es.mpu({query_index: "queries",Docs:docs}).then**  
You can do document transformations on top of a steadily flowing input stream of tweets. Allows you to update JSON documents with rules/update logic registered as percolate queries in your Elasticsearch instanced. The update logic has JSON based DSL, which is documented in percolator/mpu.js  


**es.get_first({index:'test',type:'test',key:'name',val:['master','silv3r']},'sort':{'field_name':'desc'}).then**  
Sometims you want just one document matching a particular key:val pair (especially when you are trying to look for existing documents in elasticsearch, before deciding whether to replace them or get/transform/overwrite them) This shorthand allows you to retrieve one (top) document for each of the 'val' values for the given 'key'. It can take optional 'sort' which will decide which document of all the documents matching given key:value should be returned.  


**es.save_dedup({doc:{...},key:"url.unanalyzed",value:"epicbeat.epictions.com",index:"test",type:"test"}).then**  
Workaround for lack of unique id limitation of Elasticsearch. This helps you index (or override existing) docs based on "unique ids" stored in the key field.

**es.bulk_index([{a:2},{a:3,_id:1}],{index:'test',type:'test'}).then**  
Shorter expression for ES bulk_index  


**es.delete_dups({key:"url",size:1000,del_sort:{fetch_time:"desc"},index:"test",type:"test",multi_key:"url"}).then**  
Delete all the duplicate from an index/type, for some field  


**Bulk batching of queries for much better performance**  
You can aggregate multiple ES requests (of same kind), from different places in your application flow, into batches, without writing any extra code. All the queries shall be batched together, as per a configuration, into a single query to elasticsearch. The size of batch for each function can be individually set in config.json. This is a significant performance optimization when you are making hundreds of independent (but same kind of queries like "get_first") in one second. Currently supporting batching for get_first, bulk_index and mpu  

**Dumping data to multiple destinations**
Uncomment the cloneClientParams to also bulk index data into another destination. Useful when you want  copy of your data elsewhere.  


**Configuration**  
Hosts, default_index, and batch sizes can be set in config.json  

This module is being built with <3 while making epicbeat.epictions.com  

Things to do next  
A. Better documentation  
B. Test cases in mocha/chai-as-promised. Current each module has console.log based checks     
C. Adding event emmitter based on document to query match (Percolator)  
D. Add bulk batching on important elasticsearch methods like get/mget/bulk_index/search/msearch [DONE]
E. Add benchmark results for performance when using this module instead of pure ElasticSearch 4.0.2

Keep checking out for more updates.  
