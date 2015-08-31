
/**
 * Dedups and saves doc based on supplied queryField|storedField/val pair. A workaround for lack of 'unique' constraint in elasticsearch
 *@param doc|docs the doc(s) to be saved. Can be array or single element
 *@param queryField Optional. the unanalyzed unique field by which to do term query matches and get 'first' document to override (if it exists). If it is not specified storedField parameter is used instead
 *@param storedField Optional. The stored field corresponding to the queryField. This is used to create 'fields' parameter of ES request to get those documents to replace in ES, if they exist
 *@param sort Optional. In case duplicates exist, the one to be on top of sort result will be overwritten by the passed doc. If this is not specified, the document that gets overwritten is arbitrary chosen.
 *@param type Optional. The type of document to be inserted. Default is config.default_type
 *@param index Optional. The index to insert in. Default is config.default_index
 */

var _ = require('lodash')
var debug = require('debug')('IndexByUnique')
var BulkIndex = require('./bulk')

function IndexByUnique(es) {
  this.es = es
  this.bulkIndex = new BulkIndex(es)
}

IndexByUnique.prototype.gobble = function(params) {
  return this.chew(params).then(this.swallow)
}

IndexByUnique.prototype.chew = function(params) {

  var docs = params.docs || params.doc

  if (!docs) {

    throw new Error('docs or doc not passed for indexing')

  } else if (!_.isArray(docs)) {

    docs = [docs]

  }

  params.docs = docs
  params.val = _.pluck(docs, params.storedField || params.queryField)
  params.fields = [params.storedField || params.queryField]

  var that = this
  return this.es.get_first(params)
  .then(function(esDocs) {

    esDocs = _.pluck(esDocs,'doc')

    esDocs.forEach(function(esDoc,i) {
      if (esDoc) {
        docs[i]._id = esDoc._id
      }
    })

    return {
      instructions: that.bulkIndex.chew(params),
      response_size: docs.length
    }
  })
}

IndexByUnique.prototype.swallow = function(bulkInstructions) {

  return this.es.bulk({body: bulkInstructions})
  .then(function(res) {

    return res.items

  })
}

module.exports = IndexByUnique

if (require.main === module) {
  var EpicSearch = require('../../index')
  var config = require('../../config')
  var es = new EpicSearch(config)

  es.index_by_unique({
    queryField: 'url',
    //storedField: 'url',
    index: 'test',
    type: 'test',
    sort: {fetch_time: 'asc'},
    docs: { url: '12', title: 'How WWE Should Have Booked Sting\'s Debut - YouTube', display_title: 'How WWE Should Have Booked Sting\'s Debut', description: 'Adam\'s back to tackle the debacle that was Sting\'s WWE Debut! For more awesome content, check out: http://whatculture.com/wwe Catch us on Facebook at: https:...', author: { url: 'http://www.youtube.com/channel/UCq8jp0E99ELBvmBxjJ-JLgA', name: 'WhatCulture WWE' }, publish_time: 1440720000000, tags: [ 'WWE', 'WhatCulture', 'What Culture', 'Breaking News', 'Exclusives', 'Features', 'WWE 2K15', 'Raw', 'Smackdown', 'Steve Borden (TV Personality)', 'Sting', 'Triple H', 'WrestleMania (Recurring Event)', 'Wrestling (Sport)', 'Shocking', 'Funny', 'Undertaker', 'Vince McMahon (Organization Leader)', 'WCW', 'ECW', 'Nitro', 'Leaked', 'How WWE Should Have Booked', 'Adam Blampied', 'NWO', 'TNA', 'Dudley Boyz', 'WWE Champion', 'Seth Rollins', 'The Shield', 'Wolfpac', 'Battleground', 'Night Of Champions', 'Impact' ], image: 'https://i.ytimg.com/vi/j6zv1C4o_NY/maxresdefault.jpg', hostname: 'youtube.com', domain: 'youtube.com', amp_channel: 'twitter', dist_channel: 'youtube', fetch_time: 9980, semantictags: [ 'microdata', 'og', 'twitter' ], twitter_card: 'player', stats: { views: 83887, duration: 547 }, popularity: { shares: { total: 4650, channels: [Object] }, comments: { total: 2043, channels: [Object] }, clicks: { total: 0, channels: [Object] }, applause: { total: 4896, channels: [Object] }, last_updated: 1440927771055 }, type: 'video', sub_type: 'how', ids: { collection: 'UCq8jp0E99ELBvmBxjJ-JLgA' }, category: 'Sports', publisher: { name: 'YouTube', twitter: 'youtube', googleplus: '+youtube', type: 'ContentHub', country: 'us' }, meta: { videoId: 'j6zv1C4o_NY' }, channel: 'youtube', total_shares: 4650, total_comments: 2043, total_clicks: 0, total_applause: 4896, sharers: [ { channel: 'twitter', id: [Object], count: 1 } ], share_time: 1440927105000, tweet: { _id: '637920633452630016', channel: 'twitter', lang: 'en', text: 'I liked a @YouTube video from @whatculturewwe http://t.co/0ZKqos0qSi How WWE Should Have Booked Sting\'s Debut', created_at: 1440927105000, urls: [ 'https://www.youtube.com/watch?v= j6zv1C4o_NY&feature=youtu.be&a=' ], sharer: { lang: 'en', description: 'What to say I Have a great group of friends ,I have a slight youtube addiction! ,I love\nmeeting new friends and i normally Follow Back:)', screen_name: 'davencfc', followers_count: 278 } }, original_url: 'http://www.youtube.com/watch?v=j6zv1C4o_NY' }
  })
  .then(function(res) {
    debug('indexed by uniqueness', res)
    //es.get_first({index:'test',type:'test',storedField:'url',val: 'http://www.youtube.com/watch?v= j6zv1C4o_NY', sort:{ts:'desc'}}).
    //then(debug)
  })
  .catch(function(err) {
    debug('err', err)
  })
}
