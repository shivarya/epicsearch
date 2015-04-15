/**
 * Different version that native elasticsearch get. It returns
 * first document matching a particular key===value condition.
 * If not found, it returns null
 *@param index The index to search on. Default is config.default_index
 *@param key The property on which to do term query
 *@param val The value to match for given key
 *@param type The type of document to be matched. Default is epicdoc
 *@param sort How to sort the duplicates for every val
 */
var _ = require('underscore')

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
        throw new Error(resp.error)
      }
      
      if(resp.hits.total){
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
          
          var req_fields = m_search_instructions[2*i+1].fields
          if(!req_fields)
            return doc.fields
           
          var ret_fields = doc.fields
          req_fields.forEach(function(field){
            if(ret_fields[field] && ret_fields[field].length == 1){
              ret_fields[field]=ret_fields[field][0]
            }
          })
          return {
            doc: ret_fields,
            total: resp.hits.total
          }
        }
      } else
        return null
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

  es.get_first({index:'test',type:'test',key:'url',val:3}).
  then(function(res){console.log(2,'get',res)})
}
