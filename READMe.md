# epicsearch
Elasticsearch Nodejs client extended

require('epicsearch')

The documentations of methods exposed by index.js is in individual files at the moment. I shall soon create a wiki.

In short here is a summary of the package

**Bulk batching of queries**
You can aggregate multiple ES requests into configurable batch sizes, without writing a single line of code.
Just set bulk_params object in the schema specifying what bulk size you want to wait for, for each method, before hitting ES in a single hit. This is major performance optimization in a system which makes hundreds of independent micro hits in one second.

Methods
**mpu**
This is a significant functionality which allows you to update JSON documents with rules and update logic registered in percolate queries. Use this for rule based updates. 
Percolate multiple documents, find the queries matched and the update the documents with update instructions in those queries. 

**get_first**
src/get/index
Shorthand to get the first document matching for a given key:val pair. Users terms match.
get_first({index:'test',type:'test',key:'name',val:['master','silv3r']},'sort':{'field_name':'desc'})

**deup_save
/src/index/dedup_save
Workaround for lack of unique id limitation of Elasticsearch. This helps you index docs based on "unique ids"

**bulk_insert**
Just a short hand for ES bulk_insert.

This module is being build with <3 while making epicbeat.epictions.com

More details and updates coming soon!
