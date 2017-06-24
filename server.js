var express = require('express');
var path = require('path');

var ACTION_PHASE = 1;
var BUY_PHASE = 2;
var CLEANUP_PHASE = 3;

var app = express();

var isProduction = process.env.NODE_ENV === 'production';
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var port = process.env.PORT || 3000;

var httpProxy = require('http-proxy');

var proxy = httpProxy.createProxyServer();

var publicPath = path.resolve(__dirname, 'public');
var roomPath = path.resolve(__dirname, 'server', 'room');
var userPath = path.resolve(__dirname, 'server', 'user');

var Room = require(roomPath);
var User = require(userPath);
var room = new Room(io);
var FirstGame = {
	name: 'First Game',
	start: {
		mine: 1,
		copper: 4
	},
	piles: {
		copper: [60, 60, 60],
		silver: [40, 40, 40],
		gold: [30, 30, 30],
		estate: [14, 21, 24],
		duchy: [8, 12, 12],
		province: [8, 12, 12],
		cellar: [10, 10, 10],
		market: [10, 10, 10],
		militia: [10, 10, 10],
		mine: [10, 10, 10],
		moat: [10, 10, 10],
		remodel: [10, 10, 10],
		smithy: [10, 10, 10],
		village: [10, 10, 10],
		woodcutter: [10, 10, 10],
		workshop: [10, 10, 10]
	}
};
room.newRoom(FirstGame.name, FirstGame.start, FirstGame.piles);

// We point to our static assets
app.use(express.static(publicPath));

if (!isProduction) {

  // We require the bundler inside the if block because
  // it is only needed in a development environment. Later
  // you will see why this is a good idea
  var bundle = require('./server/bundle');
  bundle();

  // Any requests to localhost:3000/build is proxied
  // to webpack-dev-server
  app.all('/build/*', function (req, res) {
    proxy.web(req, res, {
        target: 'http://localhost:8080'
    });
  });

}

// It is important to catch any errors from the proxy or the
// server will crash. An example of this is connecting to the
// server when webpack is bundling
proxy.on('error', function(e) {
  console.log('Could not connect to proxy, please try again...');
});

server.listen(port, function () {
  console.log('Server listening at port %d', port);
});

io.on('connection', function(socket) {
	var user = new User(socket);
	var game = null;
	var current = null;
	socket.emit('_init', user.name);
	
	socket.on('_set_name', function(name) {
		var res = user.setName(name);
	});
	
	socket.on('_join_room', function(name) {
		var res = room.joinUser(name, user);
		if (res.head === 'ok') {
			game = room.getGame(user.current);
			current = user.current;
		}
	});
	socket.on('_set_room', function(name) {
		var res = user.joinRoom(name);
		if (res) {
			room.updateRoom(user.current);
			game = room.getGame(user.current);
			current = user.current;
		}
	});
	
	socket.on('_recon_room', function(slot) {
		if (game && current) {
			var res = game.reconnect(user, slot);
			if (res.head === 'ok') {
				room.toggleUserType(current, user);
				room.updateRoom(current);
			}
		}
	});
	
	socket.on('disconnect', function() {
		user.disconnect(room);
	});
	
	// game routines
	
	socket.on('_send_control', function(cntrl) {
		if (game && current) {
			switch (cntrl) {
				case "Start":
					game.startGame(user) && room.updateRoom(current);
					break;
				case "Action":
					game.setPhase(user, ACTION_PHASE) && room.updateRoom(current);
					break;
				case "Buy":
					game.setPhase(user, BUY_PHASE) && room.updateRoom(current);
					break;
				case "Cleanup":
					game.setPhase(user, CLEANUP_PHASE) && room.updateRoom(current);
					break;
				default:
					game.tryControl(user, cntrl) && room.updateRoom(current);
			}
		}
	});
	
	socket.on('_tap_card', function(src, index) {
		if (game && current) {
			game.tapCard(user, src, index) && room.updateRoom(current);
		}
	});
});
