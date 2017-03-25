// Setup basic express server
var path = require('path');
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var port = process.env.PORT || 3000;

var jsdom = require('jsdom').jsdom;
jsdom.env("", function(err, window) {
	if (err) {
		console.error(err);
		return;
	}
	global.$ = require('jquery')(window);
});

var Game = require(path.resolve(__dirname, 'game'));
var User = require(path.resolve(__dirname, 'user'));
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

var webpack = require('webpack');
var webpackConfig = require('../../webpack.config');
var compiler = webpack(webpackConfig);
app.use(express.static(path.resolve(__dirname, '..', '..', 'public')));
app.use(require('webpack-dev-middleware')(compiler, {
  noInfo: true, publicPath: webpackConfig.output.publicPath
}));
app.use(require('webpack-hot-middleware')(compiler));

server.listen(port, function () {
  console.log('Server listening at port %d', port);
});

io.on('connection', function(socket) {
	var user = new User(socket);
	socket.emit('_init', user.name);
	socket.on('_set_name', user.setName.bind(user));
	socket.on('_join_game', game.addUser.bind(game, user));
	socket.on('_enter_game', user.enterGame.bind(user, game.onSuccess.bind(game)));
	socket.on('disconnect', game.disconnectUser.bind(game, user));
});