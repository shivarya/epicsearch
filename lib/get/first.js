/**
 * Different version that native elasticsearch get. It returns
 * first document matching a particular key===value condition.
 * If not found, it returns null
 *@param key The property on which to do term query
 *@param val The value to match for given key
 *@param sort How to sort the duplicates for key:val
 *@param index The index to search on. Default is config.default_index
 *@param type The type of document to be matched. Default is epicdoc
 */
var _ = require('underscore')
var debug = require('debug')('GetFirst')
function GetFirst(es){
  this.es = es
}

GetFirst.prototype.gobble = function(params){
  return this.swallow(this.chew(params))
}

GetFirst.prototype.chew = function(params){
  if(!_.isArray(params.val)) {
    params.val = [params.val]
  }
  var key = params.key,
    vals = params.val,
    fields = params.fields,
    sort = params.sort,
    es = this.es 
  return _.chain(vals).
    map(function(val){
      var match_pair = {}
      match_pair[key] = val
      return [
        {
          index: params.index || es.config.default_index,
          type: params.type || es.config.default_type
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


GetFirst.prototype.swallow = function(m_search_instructions){
  return this.es.msearch({
    body: m_search_instructions
  }).
  then(function(es_res){
    return es_res.responses.map(function(resp,i){
      if (resp.error) {
        return resp
      }
      if(!resp.hits.total){
        return null
      } else {  
        var doc = resp.hits.hits[0]
        if(doc._source) {
          doc._source._id = doc._id
          return {
            doc: doc._source,
            total: resp.hits.total
          }
        } else {
          doc.fields || (doc.fields =  {})
          doc.fields._id = doc._id
          var requested_fields = m_search_instructions[2*i+1].fields
          if(!requested_fields){
            return {
              doc : doc.fields,
              total: resp.hits.total
            }
          }
          var returned_fields = doc.fields
          requested_fields.forEach(function(field){
            if(returned_fields[field] && returned_fields[field].length == 1){
              returned_fields[field]=returned_fields[field][0]
            }
          })
          return {
            doc: returned_fields,
            total: resp.hits.total
          }
        }
      }
    })
  })
}

module.exports = GetFirst

if (require.main === module) {
  var EpicSearch = require('../../index')
  var config = require('../../config')
  var es = new EpicSearch(config)
  setTimeout(function(){
      es.get_first({index:'test',type:'test',key:'url',val:[1,3]}).
      then(function(res){console.log(1,'get',res)})
    },
    5000
  )

  es.get_first({index:'test',type:'test',key:'url',val:13}).
  then(function(res){console.log(2,'get',res)})
}
