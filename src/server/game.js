function Game() {
	this.rooms = {};
}

Game.prototype.getView = function(room) {
	var game = this.rooms[room];
	if (game) {
		return {
			kingdom: game.set.kingdom,
			users: game.users
		};
	}
};

Game.prototype.getAction = function(user) {
	var sel = user.getSel();
	var id = user.getID();
	var room = this.rooms[sel];
	if (room && room.users[id]) {
		var turn = room.turn;
		if (!turn.length || id == turn[0]) {
			return this.getActionCallback(sel);
		}
	}
};

Game.prototype.getActionCallback = function(room) {
	var game = this.rooms[room];
	if (game) {
		switch (game.phase) {
			case 'start':
				return this.start.bind(this, room);
			default:
				return null;
		}
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
		spots: 4,
		phase: 'start',
		turn: [],
		modifiers: {}
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
};

Game.prototype.start = function start_game(room) {
	var game = this.rooms[room];
	if (game) {
		console.log("starting game in room " + room);
	}
};

module.exports = Game;