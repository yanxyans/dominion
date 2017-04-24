function User(socket) {
	this.socket = socket;
	this.id = socket.id;
	// generate a random name
	this.name = socket.id.substring(0, 7);
	this.games = {};
	this.inGame = null;
}

// user life cycle management

User.prototype.setName = function(name) {
	var cleanName = name.replace(/[^a-z0-9]/gi,'');
	if (cleanName && cleanName.length <= 20) {
		this.name = name;
		this.emit('_user_name', {
			head: 'ok',
			body: 'name is set'
		}, name);
	} else {
		this.emit('_user_name', {
			head: 'err',
			body: 'name has to be alphanumeric and less than twenty characters'
		});
	}
};

User.prototype.addGame = function(game, spot) {
	// view will be updated in enterGame
	if (game) {
		this.games[game] = spot;
	}
};

User.prototype.removeGame = function(game) {
	if (game) {
		delete this.games[game];
		if (game === this.inGame) {
			this.socket.leave(game);
			this.inGame = null;
			this.emit('_game_user', {});
			this.emit('_game_board', {
				piles: [],
				players: [],
				trash: []
			});
			this.emit('_game_player');
		}
		this.emit('_user_room', {
			head: 'ok',
			body: 'left room'
		}, this.getRoom());
	}

};

User.prototype.switchGame = function(fromGame, toGame) {
	if (fromGame && toGame) {
		this.socket.leave(fromGame);
		this.socket.join(toGame);
		this.inGame = toGame;
	}
};

User.prototype.enterGame = function(game) {
	if (!(game in this.games)) {
		this.emit('_user_room', {
			head: 'err',
			body: 'room does not exist'
		});
		return false;
	} else {
		// switch from old game to new game
		var oldGame = this.inGame;
		if (!oldGame) {
			this.socket.join(game);
			this.inGame = game;
			this.emit('_user_room', {
				head: 'ok',
				body: 'entered room'
			}, this.getRoom());
			return true;
		} else if (oldGame === game) {
			// do nothing, already in new game
			return false;
		} else {
			this.switchGame(oldGame, game);
			this.emit('_user_room', {
				head: 'ok',
				body: 'entered room'
			}, this.getRoom());
			return true;
		}
	}
};

// user view management

User.prototype.emit = function(...args) {
	this.socket.emit(...args);
};

User.prototype.getRoom = function() {
	return {
		rooms: this.games,
		inRoom: this.inGame
	};
};

module.exports = User;