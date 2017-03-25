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
	this.socket.leave(fromGame);
	this.socket.join(toGame);
	this.inGame = toGame;
};

User.prototype.enterGame = function(onSuccess, game) {
	if (!(game in this.games)) {
		this.emit('_user_room', {
			head: 'err',
			body: 'room does not exist'
		});
	} else {
		var oldGame = this.inGame;
		if (oldGame === game) {
			// do nothing
		} else {
			this.switchGame(oldGame, game);
			this.emit('_user_room', {
				head: 'ok',
				body: 'entered room'
			}, this.getRoom());
		
			if (onSuccess) {
				onSuccess(this);
			}
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