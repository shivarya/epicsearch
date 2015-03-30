# epicsearch
Elasticsearch Nodejs client extended

require('epicsearch')

The documentations of methods exposed by index.js is in individual files at the moment. Shall soon improve it and create a wiki  

In short here is a summary of the package, as of the initial commit  

**Bulk batching of queries**
You can aggregate multiple ES requests (of same kind) into configurable batch sizes. All the queries shall be batched together into a single query to elasticsearch. The size of batch for each function can be individually set in config.json. This is a significant performance optimization when you are making hundreds of independent (but same kind of queries like "get_first") in one second. Currently supporting batching for get_first, bulk_insert and mpu

Methods exosed  

**mpu**
You can run interesting transformations, or rule based decisions, on top of a steadily flowing input stream of tweets. Allows you to update JSON documents with rules/update logic registered as percolate queries in your Elasticsearch instanced. The update logic has JSON based DSL, which is documented in percolator/mpu.js 

**get_first**  
src/get/index
Shorthand to get the first document matching for a given key:val pair. Users terms match.
get_first({index:'test',type:'test',key:'name',val:['master','silv3r']},'sort':{'field_name':'desc'})

**deup_save**
/src/index/dedup_save
Workaround for lack of unique id limitation of Elasticsearch. This helps you index docs based on "unique ids"

**bulk_insert**
Just a short hand for ES bulk_insert 

This module is being build with <3 while making epicbeat.epictions.com  

More details and updates coming soon!  
