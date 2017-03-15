function Game() {
	this.rooms = {};
}

Game.prototype.getView = function(room) {
	var game = this.rooms[room];
	if (game) {
		return {
			start: game.set.start,
			kingdom: game.set.kingdom,
			users: game.users
		};
	}
};

Game.prototype.newRoom = function(room, set) {
	if (this.rooms[room]) {
		return {
			head: 'err',
			body: 'room is taken'
		};
	}
	
	this.initRoom(room, set);
	return {
		head: 'ok',
		body: 'room was created'
	};
};

Game.prototype.initRoom = function(room, set) {
	this.rooms[room] = {
		set: set,
		users: {},
		spots: 4
	};
};

Game.prototype.addUser = function(room, user) {
	var rooms = this.rooms;
	var id = user.getID();
	var name = user.getName();
	if (!rooms[room]) {
		return {
			head: 'err',
			body: 'room does not exist'
		};
	} else if (id in rooms[room].users) {
		return {
			head: 'err',
			body: 'user is already in room'
		};
	}
	
	// 1 for spectator, 0 for player
	var user_type = rooms[room].spots > 0 ? 0 : 1;
	rooms[room].users[id] = {name: name, type: user_type};
	if (!user_type) {
		rooms[room].spots--;
	}
	user.addRoom(room, user_type);
	return {
		head: 'ok',
		body: 'user has joined room'
	};
};

Game.prototype.removeUser = function(room, id) {
	var rooms = this.rooms;
	if (!rooms[room]) {
		return {
			head: 'err',
			body: 'room does not exist'
		};
	}
	
	var user = rooms[room].users[id];
	delete rooms[room].users[id];
	if (!user.type) {
		rooms[room].spots++;
	}
	return {
		head: 'ok',
		body: 'user removed from room'
	};
}

module.exports = Game;