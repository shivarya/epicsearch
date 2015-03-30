var express = require('express'),
    bodyParser = require('body-parser'),
    app = express(),
    http = require('http'),
    index = require('./index')
var port = process.env.PORT ||process.argv[2] ||  4265;
    app.set('port',port)
    app.use(bodyParser.json({limit:'15mb'}));
var server = http.createServer(app)
    server.listen(port)
var config = require('./config')
/**
 *  Operation is the last word specified in 
 *  /something/something_else/operation
 *  TODO have a better way to make and read a REST url
 */
var execute = function(req,res) {
	var params  = req.body;
  if(req.url.lastIndexOf('/') === req.url.length-1)//remove the trailing / 
    req.url = req.url.substring(0,req.url.length-1)
  var operation = req.url.substring(req.url.lastIndexOf('/')+1,req.url.length)
  index[operation](params,config).
  then(
    function(response){
      res.json(response)
      res.end()
    }
    
  ).
  catch(function(err) {
      res.status(400)
      res.send('something bad happened.Most probably IllegalArgument exception somewhere ' +err )
      res.end()
    })
};

app.post("/*",execute);
