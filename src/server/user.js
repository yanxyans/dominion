function User(socket) {
	this.socket = socket;
	this.name = socket.id.substring(0, 7);
	this.rooms = {};
	this.in_room = null;
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
		in_room: this.in_room,
		is_player: this.rooms[this.in_room]
	};
};

User.prototype.getRoom = function() {
	return this.in_room;
};

User.prototype.setName = function(name) {
	var cleanName = $('<div/>').text(name).text();
	if (cleanName) {
		this.name = cleanName;
		this.socket.emit('_update_name', {
			head: 'ok',
			body: 'name was set'
		}, cleanName);
	} else {
		this.socket.emit('_update_name', {
			head: 'err',
			body: 'could not validate name'
		});
	}
};

User.prototype.addRoom = function(room, type) {
	var rooms = this.rooms;
	if (rooms[room]) {
		this.socket.emit('_update_view', {
			head: 'err',
			body: 'room already exists'
		});
	} else {
		this.rooms[room] = type;
	}
};

User.prototype.pickRoom = function(callback, room) {
	if (!(room in this.rooms)) {
		this.socket.emit('_update_view', {
			head: 'err',
			body: 'room does not exist'
		});
	} else {	
		this.socket.leave(this.in_room);
		this.socket.join(room);
		this.in_room = room;
		
		if (callback) {
			callback(this);
		}
		this.socket.emit('_update_view', {
			head: 'ok',
			body: 'room is picked'
		}, this.getView());
	}
};

module.exports = User;