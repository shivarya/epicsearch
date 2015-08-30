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
  
  var stripTheArrayResponse = false

  if(!_.isArray(params.val)) {
    stripTheArrayResponse = true
    params.val = [params.val]
  }
  
  var key = params.raw_key || params.key
  var vals = params.val
  var fields = params.fields
  var sort = params.sort
  var es = this.es 

  var instructions = 
    _.chain(vals)
    .map(function(val){
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

  return {
    response_size: instructions.length/2,
    instructions: instructions,
    stripTheArrayResponse: stripTheArrayResponse 
  }
}


GetFirst.prototype.swallow = function(m_search_instructions) {
  return this.es.msearch({
    body: m_search_instructions
  }).
  then(function(es_res){
    return es_res.responses.map(function(resp,i) {
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
  //es.get_first({key:'url',val:[1,3],fields:['url']}).
  /**es.get_first({ key: 'url', val: [ 13, 12 ], fields: [ 'url' ] }).
    then(function(res){console.log(1,'get',res)})
  .catch(debug)
  es.get_first({ key: 'url', val: 13, fields: [ 'url' ] }).
    then(function(res){console.log(1,'get',res)})
  .catch(debug)**/
  
  es.get_first(
    {"key":"url.url_raw","docs":[{"@url":"http://www.youtube.com/watch?v=j6zv1C4o_NY","title":"How WWE Should Have Booked Sting's Debut - YouTube","display_title":"How WWE Should Have Booked Sting's Debut","description":"Adam's back to tackle the debacle that was Sting's WWE Debut! For more awesome content, check out: http://whatculture.com/wwe Catch us on Facebook at: https:...","author":{"url":"http://www.youtube.com/channel/UCq8jp0E99ELBvmBxjJ-JLgA","name":"WhatCulture WWE"},"publish_time":1440720000000,"tags":["WWE","WhatCulture","What Culture","Breaking News","Exclusives","Features","WWE 2K15","Raw","Smackdown","Steve Borden (TV Personality)","Sting","Triple H","WrestleMania (Recurring Event)","Wrestling (Sport)","Shocking","Funny","Undertaker","Vince McMahon (Organization Leader)","WCW","ECW","Nitro","Leaked","How WWE Should Have Booked","Adam Blampied","NWO","TNA","Dudley Boyz","WWE Champion","Seth Rollins","The Shield","Wolfpac","Battleground","Night Of Champions","Impact"],"image":"https://i.ytimg.com/vi/j6zv1C4o_NY/maxresdefault.jpg","hostname":"youtube.com","domain":"youtube.com","amp_channel":"twitter","dist_channel":"youtube","fetch_time":1440927769138,"semantictags":["microdata","og","twitter"],"twitter_card":"player","stats":{"views":83887,"duration":547},"popularity":{"shares":{"total":4650,"channels":[null]},"comments":{"total":2043,"channels":[null]},"clicks":{"total":0,"channels":[null]},"applause":{"total":4896,"channels":[null]},"last_updated":1440927771055},"type":"video","sub_type":"how","ids":{"collection":"UCq8jp0E99ELBvmBxjJ-JLgA"},"category":"Sports","publisher":{"name":"YouTube","twitter":"youtube","googleplus":"+youtube","type":"ContentHub","country":"us"},"meta":{"videoId":"j6zv1C4o_NY"},"channel":"youtube","total_shares":4650,"total_comments":2043,"total_clicks":0,"total_applause":4896,"sharers":[{"channel":"twitter","id":[null],"count":1}],"share_time":1440927105000,"tweet":{"_id":"637920633452630016","channel":"twitter","lang":"en","text":"I liked a @YouTube video from @whatculturewwe http://t.co/0ZKqos0qSi How WWE Should Have Booked Sting's Debut","created_at":1440927105000,"urls":["https://www.youtube.com/watch?v=j6zv1C4o_NY&feature=youtu.be&a="],"sharer":{"lang":"en","description":"What to say I Have a great group of friends ,I have a slight youtube addiction! ,I love\nmeeting new friends and i normally Follow Back :)","screen_name":"davencfc","followers_count":278}},"original_url":"http://www.youtube.com/watch?v=j6zv1C4o_NY"}],"val":["http://www.youtube.com/watch?v=j6zv1C4o_NY"],"fields":["url"]}
  ).then(function(res){console.log(1,'get',res)})
  .catch(debug)
  //es.get_first({index:'test',type:'test',key:'url',val:13}).
  //then(function(res){console.log(2,'get',res)})
}
