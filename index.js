var request = require('request'); // for making API calls
var bodyParser = require('body-parser');
var pg = require('pg');
var FormData = require('form-data');
var options = {
  uri: 'https://www.googleapis.com/urlshortener/v1/url',
  method: 'POST',
  json: {
    "longUrl": "http://www.google.com/"
  }
};
// port = process.env.PORT for deploying on cloud host (need this for heroku anyway, 8080 for local testing

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
    console.log(req.query.code);
    res.render('index');

    request.post('https://api.23andme.com/token/', {
      form: {
        client_id : 'be256e46c1e76dd5e8c76197f9168bed' ,
        client_secret : 'fdc2dceabe85b0336e7bc99b5eb6a4c3' ,
        grant_type: 'authorization_code',
        code : req.query.code ,
        redirect_uri : 'http://localhost:8080/genometoken',
        scope :'genomes'
      },
      json: true
    }, function (error, response, body) {
      // assert.equal(typeof body, 'object')
      if(error) {
          console.log(error);
      } else {
          console.log(response.statusCode, body);
          var parsed = JSON.parse(response);
          console.log(parsed.access_token);
        }
    });
    /*request({
        url: 'https://api.23andme.com/token/', //URL to hit
        //qs: {from: 'blog example', time: +new Date()}, //Query string data
        method: 'POST',
        //Lets post the following key/values as form
        /*auth: {

        },*/
        /*json: true,
        formData: {
          client_id : 'be256e46c1e76dd5e8c76197f9168bed' ,
          client_secret : 'fdc2dceabe85b0336e7bc99b5eb6a4c3' ,
          grant_type: 'authorization_code',
          code : req.query ,
          redirect_uri : 'http://localhost:8080/genometoken',
          scope :'genomes'
        }*/
        /*json: {
            "client_id" : "be256e46c1e76dd5e8c76197f9168bed" ,
            "client_secret" : "fdc2dceabe85b0336e7bc99b5eb6a4c3" ,
            'grant_type' : 'authorization_code',
            "code" : req.query ,
            "redirect_uri" : "http://localhost:8080/genometoken",
            "scope" :"genomes"
        }
    }, function(error, response, body){
        if(error) {
            console.log(error);
        } else {
            console.log(response.statusCode, body);
    }
  });*/
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

    var client = new pg.Client();

    var client = new pg.Client();

    // connect to our database
    client.connect(function (err) {
    if (err) throw err;

    // execute a query on our database
    client.query('CREATE DATABASE test', function (err, result) {
        if (err) throw err;

        client.end(function (err) {
        if (err) throw err;
        });
    });
    });

    res.send({status: "Success"});


})
