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

User.prototype.getRooms = function() {
	return {
		rooms: this.rooms,
		sel: this.sel_room
	};
};

User.prototype.setName = function(name) {
	var cleanName = cleanInput(name);
	if (cleanName) {
		this.name = cleanName;
	}
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

module.exports = User;