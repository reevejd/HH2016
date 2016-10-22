var request = require('request'); // for making API calls 

// port = process.env.PORT for deploying on cloud host (need this for heroku anyway, 8080 for local testing

// setting up express 4 server & socket.io
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server)

var port = process.env.PORT || 8080;
server.listen(port, function() {
    console.log('Server running on :' + port);
})


// static files are stored in the public folder
app.use(express.static(__dirname + '/public'));

app.get('/', function(req,res) {
  res.render('index');
});
