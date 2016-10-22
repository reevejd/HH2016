alert("test");

var socket = io()


socket.on("whatever", function(data) {
    console.log('You got data from the server:')
    console.log(data);
});