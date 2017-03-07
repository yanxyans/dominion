function User(id) {
	this.id = id;
	this.rooms = {};
}

function isValidName(name) {
	return true;
}

User.prototype.setName = function(name) {
	if (isValidName(name)) {
		this.name = name;
		return true;
	}
	return false;
};

User.prototype.addRoom = function(room, type) {
	var rooms = this.rooms;
	if (!rooms[room]) {
		rooms[room] = {
			type: type
		};
	}
};

module.exports = User;