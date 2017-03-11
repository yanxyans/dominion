function Game() {
	this.rooms = {};
}

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
		userc: 0
	};
};

Game.prototype.addUser = function(room, user) {
	var rooms = this.rooms;
	var id = user.getID();
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
	var user_type = ++rooms[room].userc > 4 ? 1 : 0;
	rooms[room].users[id] = user_type;
	user.addRoom(room, user_type);
	user.selRoom(room);
	return {
		head: 'ok',
		body: 'user has joined room'
	};
};

module.exports = Game;