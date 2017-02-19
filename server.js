// HTTP PORTION

var http = require('http');
var fs = require('fs');
var httpServer = http.createServer(requestHandler);
var url = require('url');
httpServer.listen(8080);

function requestHandler(req, res) {

	var parsedUrl = url.parse(req.url);
	console.log("The Request is: " + parsedUrl.pathname);
		
	fs.readFile(__dirname + parsedUrl.pathname, 
		function (err, data) {
			if (err) {
				res.writeHead(500);
				return res.end('Error loading ' + parsedUrl.pathname);
			}
			res.writeHead(200);
			res.end(data);
  		}
  	);
  	
}


// WEBSOCKET PORTION

var io = require('socket.io').listen(httpServer);

io.sockets.on('connection', 

	function (socket) {
	
		console.log("We have a new client: " + socket.id);
		
		///MY SOCKET EVENTS HERE
		// received star locations and send to other users
		socket.on("starArray", function(data){
			socket.broadcast.emit('thelocation', data);
		});

		// received the new line location and send to other users
		socket.on("newLine", function(data){
			socket.broadcast.emit('showLine', data);
		})

		// received the request to clear the lines and send request to other users
		socket.on('clearing', function(){
			socket.broadcast.emit('clearlines');
		});

		socket.on('disconnect', function() {
			console.log("Client has disconnected " + socket.id);
		});
	}
);