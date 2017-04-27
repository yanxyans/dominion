var express = require('express');
var path = require('path');

var app = express();

var isProduction = process.env.NODE_ENV === 'production';
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var port = process.env.PORT || 3000;

var httpProxy = require('http-proxy');

var proxy = httpProxy.createProxyServer();

var publicPath = path.resolve(__dirname, 'public');
var gamePath = path.resolve(__dirname, 'server', 'game.js');
var userPath = path.resolve(__dirname, 'server', 'user.js');

var Game = require(gamePath);
var User = require(userPath);
var game = new Game(io);
var room = 'first_game';
var set = {
	start: {
		militia: 1,
		moat: 1
	},
	kingdom: {
		copper: [60, 60, 60],
		silver: [40, 40, 40],
		gold: [30, 30, 30],
		estate: [14, 21, 24],
		duchy: [8, 12, 12],
		province: [8, 12, 12],
		curse: [10, 20, 30],
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
game.newRoom(room, set);
game.newRoom('t', set);

// We point to our static assets
app.use(express.static(publicPath));

if (!isProduction) {

  // We require the bundler inside the if block because
  // it is only needed in a development environment. Later
  // you will see why this is a good idea
  var bundle = require('./server/bundle.js');
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
	socket.emit('_init', user.name);
	socket.on('_set_name', user.setName.bind(user));
	socket.on('_join_game', game.addUser.bind(game, user));
	socket.on('_enter_game', game.enterUser.bind(game, user));
	socket.on('disconnect', game.disconnectUser.bind(game, user));
	socket.on('_click_card', game.clickCard.bind(game, user));
	socket.on('_reconnect', game.reconnect.bind(game, user));
});
