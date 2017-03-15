function User(socket) {
	this.socket = socket;
	this.name = socket.id.substring(0, 7);
	this.rooms = {};
	this.sel_room = null;
}

function cleanInput(input) {
	return $('<div/>').text(input).text();
}

User.prototype.getID = function() {
	return this.socket.id;
};

User.prototype.getName = function() {
	return this.name;
};

User.prototype.getView = function() {
	return {
		rooms: this.rooms,
		sel_room: this.sel_room,
		player: this.rooms[this.sel_room]
	};
};

User.prototype.setName = function(name) {
	var cleanName = cleanInput(name);
	if (cleanName) {
		this.name = cleanName;
		return {
			head: 'ok',
			body: 'name was set'
		};
	}
	return {
		head: 'err',
		body: 'could not validate name'
	};
};

User.prototype.addRoom = function(room, type) {
	this.rooms[room] = type;
};

User.prototype.selRoom = function(room) {
	if (room in this.rooms) {
		this.socket.leave(this.sel_room);
		this.sel_room = room;
		this.socket.join(room);
	}
};

User.prototype.leaveRooms = function(game, callback) {
	Object.keys(this.rooms).forEach(function(room) {
		this.leaveRoom(game, room);
		callback(room);
	}, this);
};

User.prototype.leaveRoom = function(game, room) {
	game.removeUser(room, this.getID());
	delete this.rooms[room];
};

module.exports = User;