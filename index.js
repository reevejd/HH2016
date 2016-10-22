var request = require('request'); // for making API calls
var bodyParser = require('body-parser');

// port = process.env.PORT for deploying on cloud host (need this for heroku anyway, 8080 for local testing
/*request({
    url: 'https://modulus.io/contact/demo', //URL to hit
    qs: {from: 'blog example', time: +new Date()}, //Query string data
    method: 'POST',
    //Lets post the following key/values as form
    json: {
        field1: 'data',
        field2: 'data'
    }
}, function(error, response, body){
    if(error) {
        console.log(error);
    } else {
        console.log(response.statusCode, body);
}
});*/

// setting up express 4 server & socket.io
var express = require('express');
var app = express();
app.use(bodyParser.urlencoded());
app.use(bodyParser.json());

var server = require('http').createServer(app);
var io = require('socket.io').listen(server)

var port = process.env.PORT || 8080;
server.listen(port, function() {
    console.log('Server running on :' + port);
})

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

// static files are stored in the public folder
app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res) {
  res.render('index');
});

app.get('/genometoken', function(req, res) {
    console.log(req.params);
    res.render('index');
});

io.on("connection", function(socket) {
    socket.emit("whatever", {
        item1: "this is the first item",
        item2: "this is the second item",
        someNumbers: [1, 2, 3, 4]
    });
});

setTimeout(function() {
    // or to just emit at an arbitary time:
    io.sockets.emit("whatever", {
        item1: "this is the first item",
        item2: "this is the second item",
        someNumbers: [1, 2, 3, 4]
    });
}, 7000);

app.post('/test', function(req, res) {
    console.log('user clicked button');
    //console.log(JSON.stringify(req));
    console.log(JSON.stringify(req.body));
    console.log(JSON.stringify(req.body.data1));
    res.send({status: "Success"});
})
