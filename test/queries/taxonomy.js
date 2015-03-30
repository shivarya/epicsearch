
var tax = require('../../src/search/queries/taxonomy')

// params: lineage, leaf_term, tax_field, agg_field, corpus_query
/**tax.sTerms({
    lineage:["podcast"],
    leaf_term:"marketing",
    tax_field:"hashtags",
    agg_field:"text",
    agg: 'terms'
})**/


tax.execute({
    lineage:[],
    terms: ["mobile","marketing"],
    tax_field:"text",
    agg_field:"text",
    agg: 'terms',
    depth: 2,
    num_children : 1,
    corpus_query : {
        term:{
            _type: "tweet"
        }
    }
}).then(function(res){
    console.log(JSON.stringify(res))
})
