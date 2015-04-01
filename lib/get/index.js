var es , 
  utils = require('../../utils'),
  _ = require('underscore')


/**
 * Different version that native elasticsearch get. It returns
 * first document matching a particular key===value condition.
 * If not found, it returns null
 *@param index The index to search on. Default is config.docIndex
 *@param key The property on which to do term query
 *@param val The value to match for given key
 *@param type The type of document to be matched. Default is epicdoc
 *@param sort How to sort the duplicates for every val
 */

module.exports = function(params){
  return search(chew(params))
}

var search = function(m_search_instructions){
  return es.msearch({
    body: m_search_instructions
  }).
  then(function(es_res){
    return es_res.responses.map(function(resp,i){
      if (resp.error) {
        throw new Error(resp.error)
      }
      
      if(resp.hits.total){
        var doc = resp.hits.hits[0]
        if(doc._source) {
          doc._source._id = doc._id
          return doc._source
        } else {
          doc.fields || (doc.fields =  {})
          doc.fields._id = doc._id
          
          var req_fields = m_search_instructions[2*i+1].fields
          if(!req_fields)
            return doc.fields
           
          var ret_fields = doc.fields
          req_fields.forEach(function(field){
            if(ret_fields[field] && ret_fields[field].length == 1){
              ret_fields[field]=ret_fields[field][0]
            }
          })
          return ret_fields
        }
      } else
        return null
    })
  }).
  catch(function(err){
    console.log(err)
    throw err
  }) 
}


var chew = function(params){
  
  es = es || require('../../index')
  if(!_.isArray(params.val)) {
    params.val = [params.val]
  }
  var key = params.key,
    vals = params.val,
    fields = params.fields,
    sort = params.sort 

  return _.chain(vals).
    map(function(val){
      var match_pair = {}
      match_pair[key] = val
      return [
        {
          index: params.index || es.config.docIndex,
          type: params.type || 'epicdoc'
        },
        {
          query:{
            "term":match_pair
          },
          sort: sort,
          fields : fields,
          size:1
        }
      ] 
    }).
    flatten().
    value()
}

module.exports.process_bulk = function(){
  var responseSizes = []
  var bulk_instructions = 
    _.chain(arguments)
    .map(function(request){
      var instructions = chew.apply(null,request)
      responseSizes.push(instructions.length/2)
      return instructions
    })
   .flatten()
   .value()
  return search(bulk_instructions)
  .then(function(results){
    return utils.split_by_counts(results,responseSizes)
  })
}


if (require.main === module) {
  var index = require('../../index')
  setTimeout(function(){
    index.get_first({index:'test',type:'test',key:'url',val:[1,3]}).
    then(function(res){console.log(1,'get',res)})
  },5000)

    index.get_first({index:'test',type:'test',key:'url',val:3}).
    then(function(res){console.log(2,'get',res)})
}
