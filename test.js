var EpicSearch = require('./index')
var config = require('./config')
var es = new EpicSearch(config)
  setTimeout(function(){
      es.get_first({index:'test',type:'test',key:'url',val:[1,3]}).
      then(function(res){console.log(1,'get',res)})
    },
    5000
  )

  es.get_first({index:'test',type:'test',key:'url',val:3}).
  then(function(res){console.log(2,'get',res)})
