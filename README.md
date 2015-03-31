# epicsearch
Elasticsearch Nodejs client made epic!  

**npm install epicsearch**    

It is elasticsearch nodejs module (latest v4.0.2) made ++ 

Just replace require ('elasticsearch') with    
**var es = require('epicsearch')**  

And enjoy some cool functionality on top of what native elasticsearch client provides. 

**es.mpu({query_index: "queries",Docs:docs})**  
You can run interesting transformations, or rule based decisions, on top of a steadily flowing input stream of tweets. Allows you to update JSON documents with rules/update logic registered as percolate queries in your Elasticsearch instanced. The update logic has JSON based DSL, which is documented in percolator/mpu.js  


**es.get_first({index:'test',type:'test',key:'name',val:['master','silv3r']},'sort':{'field_name':'desc'}).then**  
Shorthand to get the first document matching all the supplied values for a given key, and coming top on a given sort. uses term match  


**es.save_dedup({doc:{...},key:"url.unanalyzed",value:"epicbeat.epictions.com",index:"test",type:"test"})**  
Workaround for lack of unique id limitation of Elasticsearch. This helps you index (or override existing) docs based on "unique ids"  called key, and for a given value of that key  


**es.bulk_insert([{a:2},{a:3,_id:1}],{index:'test',type:'test'})**  
Shorter expression for ES bulk_insert  


**es.delete_dups({key:"url",size:1000,del_sort:{fetch_time:"desc"},index:"test",type:"test",multi_key:"url"})**  
Delete all the duplicate from an index/type, for some field  


**Bulk batching of queries for much better performance**  
You can aggregate multiple ES requests (of same kind), from different places in your application flow, into batches, without writing any extra code. All the queries shall be batched together, as per a configuration, into a single query to elasticsearch. The size of batch for each function can be individually set in config.json. This is a significant performance optimization when you are making hundreds of independent (but same kind of queries like "get_first") in one second. Currently supporting batching for get_first, bulk_insert and mpu  

**Configuration**  
Hosts, default_index, and batch sizes can be set in config.json  

This module is being build with <3 while making epicbeat.epictions.com  

Things to do next  
A. Better documentation  
B. Test cases in mocha/chai-as-promised. Current each module has console.log based checks  
C. Some code refactoring   
D. Adding event emmitter based on document to query match (Percolator)  
E. Add bulk batching on all the elasticsearch methods  

Keep checking out for more updates.  
