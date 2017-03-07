// Setup basic express server
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var port = process.env.PORT || 3000;

var webpack = require('webpack');
var webpackConfig = require('../../webpack.config');
var compiler = webpack(webpackConfig);

var path = require('path');
var Game = require(path.resolve(__dirname, 'game'));
var User = require(path.resolve(__dirname, 'user'));

server.listen(port, function () {
  console.log('Server listening at port %d', port);
});

app.use(express.static(path.resolve(__dirname, '..', '..', 'public')));
app.use(require('webpack-dev-middleware')(compiler, {
  noInfo: true, publicPath: webpackConfig.output.publicPath
}));
app.use(require('webpack-hot-middleware')(compiler));

var game = new Game(io);
var room = 'dominion0';
var set = {
	start: {
		copper: 7,
		estate: 3
	},
	kingdom: {
		copper: 60,
		silver: 40,
		gold: 30,
		estate: 24,
		duchy: 12,
		province: 12,
		curse: 30
	}
};
game.newRoom(room, set);

io.on('connection', function(socket) {
	var id = socket.id;
	var name = id.substring(0, 7);
	var user = new User(id, name);
	socket.emit('_init', name);
	
	socket.on('_setName', function(name) {
		if (user.setName(name)) {
			socket.emit('_updateName', name);
		}
	});
	
	socket.on('_joinRoom', function(room, type) {
		if (type === 'spectators' || type === 'players') {
			var res = game.addUser(room, user, type);
			if (res.head === 'ok') {
				// leave previous room
				user.addRoom(room, type);
				socket.join(room);
				
				socket.emit('_updateRooms', user.rooms);
				io.sockets.in(room).emit('_updateUsers', room, game.getSpectators(room), game.getPlayers(room));
			}
		}
	});
});