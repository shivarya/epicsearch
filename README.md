# epicsearch
Elasticsearch Nodejs client extended

npm install epicsearch

var es = require('epicsearch')

The documentations of methods exposed by index.js is in individual files at the moment. Shall soon improve it and create a wiki  

In short here is a summary of the package, as of the initial commit  

**Bulk batching of queries**
You can aggregate multiple ES requests (of same kind) into configurable batch sizes. All the queries shall be batched together into a single query to elasticsearch. The size of batch for each function can be individually set in config.json. This is a significant performance optimization when you are making hundreds of independent (but same kind of queries like "get_first") in one second. Currently supporting batching for get_first, bulk_insert and mpu

Methods exosed  

**mpu**
You can run interesting transformations, or rule based decisions, on top of a steadily flowing input stream of tweets. Allows you to update JSON documents with rules/update logic registered as percolate queries in your Elasticsearch instanced. The update logic has JSON based DSL, which is documented in percolator/mpu.js 

**get_first**  
Shorthand to get the first document matching all the supplied values for a given key, and coming top on a given sort. uses term match  
es.get_first({index:'test',type:'test',key:'name',val:['master','silv3r']},'sort':{'field_name':'desc'}).then...

**save_dedup**
Workaround for lack of unique id limitation of Elasticsearch. This helps you index (or override existing) docs based on "unique ids"  called key, and for a given value of that key
es.save_dedup({doc:{...},key:"url.unanalyzed",value:"epicbeat.epictions.com",index:"test",type:"test"})

**bulk_insert**
Shorter expression for ES bulk_insert 
es.bulk_insert([{a:2},{a:3,_id:1}],{index:'test',type:'test'})

**delete_dups**
Delete all the duplicate from an index/type, for some field  
es.delete_dups({key:"url",size:1000,del_sort:{fetch_time:"desc"},index:"test",type:"test",multi_key:"url"})

This module is being build with <3 while making epicbeat.epictions.com  

Things to do in this week and next.
A. Better documentation
B. Test cases in mocha/chai-as-promised. Current each module has console.log based checks
C. Some code refactoring 
D. Adding event emmitter based on document to query match (Percolator)
E. Add bulk batching on elasticsearch's mget method also

Keep checking out for more updates.  
