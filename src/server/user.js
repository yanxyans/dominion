function User(socket) {
	this.socket = socket;
	this.id = socket.id;
	this.name = socket.id.substring(0, 7);
	this.games = {};
	this.inGame = null;
}

// user life cycle management

User.prototype.setName = function(name) {
	var cleanName = $('<div/>').text(name).text();
	if (cleanName) {
		this.name = cleanName;
		this.emit('_user_name', {
			head: 'ok',
			body: 'name is set'
		}, cleanName);
	} else {
		this.emit('_user_name', {
			head: 'err',
			body: 'invalid name'
		});
	}
};

User.prototype.addGame = function(game, spot) {
	// view will be updated in enterGame
	this.games[game] = spot;
};

User.prototype.removeGame = function(game) {
	if (this.games[game]) {
		delete this.games[game];
		if (this.inGame === game) {
			this.switchGame(this.inGame, null);
		}
		this.emit('_user_room', {
			head: 'ok',
			body: 'left room'
		}, this.getRoom());
	}
};

User.prototype.switchGame = function(fromGame, toGame) {
	if (fromGame !== null) {
		this.socket.leave(fromGame);
	}
	if (toGame !== null) {
		this.socket.join(toGame);
	}
	
	if (toGame === null) {
		this.emit('_game_user', {});
		this.emit('_game_board', {
			piles: {},
			players: []
		});
		this.emit('_game_player', null, null, null);
	} else if (fromGame &&
						 this.games[fromGame] !== -1 &&
						 this.games[toGame] === -1) {
		this.emit('_game_player', null, null, null);
	}
	this.inGame = toGame;
};

User.prototype.enterGame = function(game) {
	if (!(game in this.games)) {
		this.emit('_user_room', {
			head: 'err',
			body: 'room does not exist'
		});
		return false;
	} else {
		var oldGame = this.inGame;
		if (oldGame === game) {
			// do nothing
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

User.prototype.emit = function(eventName, ...args) {
	this.socket.emit(eventName, ...args);
};

User.prototype.getRoom = function() {
	return {
		rooms: this.games,
		inRoom: this.inGame
	};
};

module.exports = User;