var es = require('../../../es')
var match_phrases = require('./match_phrases')
var config = require('../../../config')
var Q = require('q')
module.exports.execute = function(params){
    if(!params.num_children)
        params.num_children = 5
    params.search_field = params.tax_field || params.search_field || 'text'
    params.sub_tree =[] 
    var treePromise = 
        fill_sub_tree(params).
        then(function(){
            return params.sub_tree;//params.sub_tree
        })
    return treePromise
}

/**
* {
    "lineage":[],
    "terms": ["marketing"],
    "search_field":"text",
    "agg_field":"hashtags",
    "agg": "significant_terms",
    "depth": 2,
    "num_children" : 10,
    "corpus_query" : {
        "term":{
            "_type": "tweet"
        }
    }
} 
*  
* params: index, lineage, terms, sub_tree, search_field, agg_field, corpus_query, agg, depth, num_children
* optional field: if agg_field is not defined, search_field is the one on which
* the aggregation is made
**/
var fill_sub_tree = function(params){
    var common_st = params.sub_tree
    var promises = params.terms.map(function(term){
        var termParams = JSON.parse(JSON.stringify(params))
        termParams.term = term
        termParams.sub_tree = common_st
        return sTerms(termParams)
    })
    var p = Q.all(promises)
    return p
}


/**
*  
* params: index, lineage, term, sub_tree, search_field, agg_field, corpus_query, agg, depth, num_children
* optional field: if agg_field is not defined, search_field is the one on which
* the aggregation is made
**/
var sTerms = function(params) {
  console.log(JSON.stringify(make_body(params)))
    var p = es.search({
        index: params.index || config.taxonomy.docIndex,
        body: make_body(params)
    }).then(
        function(resp) {
            var termNodeData = {//fill the current depth's subtree with this node's response
                term: params.term,
                total_count: resp.hits.total
            }
            params.sub_tree.push(termNodeData)
            params.termEsResp = resp
            //console.log(JSON.stringify(termNodeData))
            return params
        }
    ).then(//for children of this term, fill their subtree
        function(params){
            if(params.depth === 0) {//For the end of the tree depth. very leaf nodes
                //fill the responses for leafs for child and return 
                //Though this may be inaccurate              
                var termData = find(params.sub_tree,'term',params.term)
                //Now fill the child data
                termData.sub_tree = sub_tree_from_agg(params.agg,params.termEsResp)
                //console.log(params.lineage,params.term, JSON.stringify(termData),JSON.stringify(params.termEsResp))
                
                return params
            } else {
                //clone params and do BFS for sub_tree
                var newParams = JSON.parse(JSON.stringify(params))
                newParams.depth-=1
                newParams.terms = extract_agg_terms(params.termEsResp)
                newParams.lineage.push(newParams.term)
                newParams.sub_tree =[] 
                //Set the subtree of the term to the child subTrees
                find(params.sub_tree,'term',params.term).sub_tree = newParams.sub_tree
                return fill_sub_tree(newParams)
            }
        }
    )
    return p
}
var find = function(sub_tree,field,term) {
    for(var i=0;i<sub_tree.length;i++){
        if(sub_tree[i][field] == term)
            return sub_tree[i]
    }
}

var extract_agg_terms = function(esResp){
    var buckets = esResp.aggregations.agg_result.buckets
    return buckets.map(function(bucket){
       return bucket.key 
    })
}

/**
* returns array of counts per term
**/
var sub_tree_from_agg = function(aggType,esResp){
    var buckets = esResp.aggregations.agg_result.buckets
    var sub_tree = []
    for(var i=0;i<buckets.length;i++){
        //fill the current depth's subtree with this node's response
        var termNodeData = {
            term: buckets[i].key
        }
        if(aggType == "significant_terms") {
            termNodeData.total_count = buckets[i].bg_count
            termNodeData.count = buckets[i].doc_count
        } else {//aggType == terms
            termNodeData.total_count = buckets[i].doc_count
        }
        
        sub_tree.push(termNodeData)
    }
    return sub_tree
}
var make_body = function(params) {
    var path
    if(params.lineage){
        path = params.lineage.slice(0)//clone the array
        path.push(params.term)
    } else 
        path = [params.term]
    var body = {
        query : match_phrases.make(path,params.search_field,"must"),
        filter: params.corpus_query,
        size:0,
        aggs  : {
            agg_result: {//Aggregations will be under this name in EsResponse
            }
        }
    }
    var aggType = params.agg? params.agg:"significant_terms"
    var agg_field = params.agg_field? params.agg_field: params.search_field
    body.aggs.agg_result[aggType] = {
                            field: agg_field,
                            size: params.num_children,
                            shard_size: params.num_children.length*3 >= 51?params.num_children.length*3:51,
                            exclude: make_excludes(path)     
                        }
    return body;
}

var make_excludes = function(path) {
    var ex = ""
    for(var i =0;i<path.length;i++){
        ex += path[i]
        ex += '|'
    }
    return ex + exclude_agg_terms 
}
var exclude_agg_terms = "secondly|all|consider|whoever|four|edu|go|causes|seemed|rd|certainly|vs|to|asking|th|under|sorry|sent|far|every|yourselves|went|did|forth|try|p|says|yourself|likely|further|even|what|appear|brief|goes|sup|new|ever|whose|respectively|never|here|let|others|alone|along|quite|k|allows|howbeit|usually|whereupon|changes|thats|hither|via|followed|merely|while|viz|everybody|use|from|would|contains|two|next|few|therefore|taken|themselves|thru|tell|more|knows|becomes|hereby|herein|everywhere|particular|known|must|me|none|f|this|getting|anywhere|nine|can|theirs|following|my|example|indicated|indicates|something|want|needs|rather|meanwhile|how|instead|okay|tried|may|after|different|hereupon|such|a|third|whenever|maybe|appreciate|q|ones|so|specifying|allow|keeps|six|help|indeed|over|mainly|soon|course|through|looks|still|its|before|thank|thence|selves|inward|actually|better|willing|thanx|ours|might|then|non|someone|somebody|thereby|they|not|now|nor|several|hereafter|always|reasonably|whither|l|each|entirely|mean|everyone|doing|eg|ex|our|beyond|out|them|furthermore|since|looking|re|seriously|got|cause|thereupon|given|like|que|besides|ask|anyhow|g|could|tries|keep|w|ltd|hence|onto|think|first|already|seeming|thereafter|one|done|another|awfully|little|their|accordingly|least|name|anyone|indicate|too|gives|mostly|behind|nobody|took|immediate|regards|somewhat|off|believe|herself|than|specify|b|unfortunately|gotten|second|i|r|were|toward|are|and|beforehand|say|unlikely|have|need|seen|seem|saw|any|relatively|zero|thoroughly|latter|that|downwards|aside|thorough|also|take|which|exactly|unless|shall|who|most|eight|but|nothing|why|sub|especially|noone|later|m|yours|definitely|normally|came|saying|particularly|anyway|fifth|outside|should|only|going|do|his|above|get|between|overall|truly|cannot|nearly|despite|during|him|regarding|qv|h|twice|she|contain|x|where|thanks|ignored|namely|anyways|best|wonder|said|away|currently|please|enough|various|hopefully|probably|neither|across|available|we|useful|however|come|both|c|last|many|whereafter|according|against|etc|s|became|com|comes|otherwise|among|presumably|co|afterwards|seems|whatever|hers|moreover|throughout|considering|sensible|described|three|been|whom|much|wherein|hardly|wants|corresponding|latterly|concerning|else|former|those|myself|novel|look|these|value|n|will|near|theres|seven|almost|wherever|is|thus|it|cant|itself|in|ie|y|if|containing|perhaps|insofar|same|clearly|beside|when|gets|used|see|somewhere|upon|uses|kept|whereby|nevertheless|whole|well|anybody|obviously|without|very|the|self|lest|just|less|being|able|liked|greetings|regardless|yes|yet|unto|had|except|has|ought|around|possible|five|know|using|apart|necessary|d|follows|either|become|towards|therein|because|old|often|some|somehow|sure|specified|ourselves|happens|for|though|per|everything|does|provides|tends|t|be|nowhere|although|by|on|about|ok|anything|oh|of|v|o|whence|plus|consequently|or|seeing|own|formerly|into|within|down|appropriate|right|your|her|there|inasmuch|inner|way|was|himself|elsewhere|becoming|amongst|hi|trying|with|he|whether|wish|j|up|us|until|placed|below|un|z|gone|sometimes|associated|certain|am|an|as|sometime|at|et|inc|again|uucp|no|whereas|nd|lately|other|you|really|welcome|e|together|having|u|serious|hello|once|http|t.co"
