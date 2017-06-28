var Game = require('./game');

function Room(io) {
	this.io = io;
	this.rooms = {};
}

Room.prototype.newRoom = function(name, start, piles) {
	if (this.rooms[name]) {
		return {
			head: 'err',
			body: 'room is taken'
		};
	}
    
    var callback = this.emitMessage.bind(this, name);
	
	this.rooms[name] = {
		game: new Game(start, piles, callback),
		users: {}
	};
	return {
		head: 'ok',
		body: 'room is created'
	};
};

Room.prototype.emitMessage = function(room, message) {
    this.io.sockets.in(room).emit('_react_message', message);
};

Room.prototype.roomHasUser = function(room, user) {
	return user.id in room.users;
};

Room.prototype.joinUser = function(name, user) {
	var room = this.rooms[name];
	if (!room) {
		return {
			head: 'err',
			body: 'room does not exist'
		};
	} else if (!user) {
		return {
			head: 'err',
			body: 'invalid user'
		};
	} else if (this.roomHasUser(room, user)) {
		return {
			head: 'err',
			body: 'user already joined room'
		};
	}
	
	// user will be joined to room as player, if possible
	var res = room.game.addPlayer(user);
	var joinType = res ? "PLAYER" : "SPECTATOR";
	room.users[user.id] = {
		name: user.name,
		type: joinType
	};
	
	// user keeps inventory of rooms they are in
	user.addRoom(name, joinType);
	
	this.updateRoom(name);
	return {
		head: 'ok',
		body: 'user joined room'
	};
};

Room.prototype.leaveUser = function(name, user) {
	var room = this.rooms[name];
	if (!room) {
		return {
			head: 'err',
			body: 'room does not exist'
		};
	} else if (!user) {
		return {
			head: 'err',
			body: 'invalid user'
		};
	} else if (!this.roomHasUser(room, user)) {
		return {
			head: 'err',
			body: 'user is not in room'
		};
	}
	
	// get user join type
	var joinType = room.users[user.id].type;
	
	// remove user from room
	delete room.users[user.id];
	
	// update room inventory
	user.removeRoom(name);
	
	// if user was a player, also free up a player slot
	if (joinType === "PLAYER") {
		room.game.removePlayer(user);
	}
	
	this.updateRoom(name);
	return {
		head: 'ok',
		body: 'user left room'
	};
};

Room.prototype.updateRoom = function(name) {
	var room = this.rooms[name];
	if (!room) {
		return false;
	}
	
	var users = this.io.sockets.adapter.rooms[name];
	if (!users) {
		return false;
	}
	
	Object.keys(users.sockets).forEach(function(id) {
		this.io.to(id).emit('_room_state', this.retrieveRoomState(room, id));
	}, this);
};

Room.prototype.retrieveRoomState = function(room, id) {
	if (!room) {
		return null;
	} else if (!room.users[id]) {
		return null;
	}
	
	var gameState = room.game.retrieveGameState(id);
	return {
		users: Object.keys(room.users).map(function(uid) {
			return {
				name: this[uid].name,
				type: this[uid].type.toLowerCase()
			};
		}, room.users),
		players: gameState.players,
		piles: gameState.piles,
		trash: gameState.trash,
        state: gameState.state
	};
};

Room.prototype.getGame = function(name) {
	var room = this.rooms[name];
	if (!room) {
		return null;
	}
	
	return room.game;
};

Room.prototype.toggleUserType = function(name, user) {
	var room = this.rooms[name];
	if (!room) {
		return {
			head: 'err',
			body: 'room does not exist'
		};
	} else if (!user) {
		return {
			head: 'err',
			body: 'invalid user'
		};
	} else if (!this.roomHasUser(room, user)) {
		return {
			head: 'err',
			body: 'user is not in room'
		};
	}

	var prevType = room.users[user.id].type;
	room.users[user.id].type = prevType === "SPECTATOR" ? "PLAYER" : "SPECTATOR";
	return {
		head: 'ok',
		body: 'toggled user type'
	};
};

module.exports = Room;