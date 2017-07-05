function User(socket) {
	this.socket = socket;
	this.id = socket.id;
	this.name = 'rename yourself';
	
	this.rooms = {};
	this.current = null;
}

// user life cycle management

User.prototype.setName = function(name) {
	var cleanName = name.replace(/[^a-z0-9]/gi,'');
	if (cleanName && cleanName.length <= 20) {
		this.name = cleanName;
		
		this.updateUser();
		return {
			head: 'ok',
			body: 'name has been set'
		};
	}
	
	return {
		head: 'err',
		body: 'name is not alphanumeric and less less than twenty characters'
	};
};

User.prototype.addRoom = function(room, joinType) {
	if (!this.rooms[room]) {
		this.rooms[room] = {
			type: joinType
		};
		
		// join room after add
		this.joinRoom(room);
		this.updateUser();
		return true;
	}
	return false;
};

User.prototype.removeRoom = function(room) {
	if (this.rooms[room]) {
		// when removing the room we are currently in, make sure to leave the room beforehand
		if (room === this.current) {
			this.leaveRoom(room);
		}
		
		delete this.rooms[room];
		this.updateUser();
		return true;
	}
	return false;
};

User.prototype.joinRoom = function(room) {
	if (this.rooms[room] && this.current !== room) {
		if (this.current !== null) {
			// leave old room
			this.leaveRoom(this.current);
		}
		
		// join new room
		this.socket.join(room);
		this.current = room;
		this.updateUser();
		return true;
	}
	return false;
}

User.prototype.leaveRoom = function(room) {
	if (this.rooms[room] && this.current === room) {
		this.socket.leave(room);
		this.current = null;
		this.updateUser(true);
		return true;
	}
	return false;
};

User.prototype.disconnect = function(room) {
	// on disconnect, leave all rooms
	Object.keys(this.rooms).forEach(function(name) {
		room.leaveUser(name, this);
	}, this);
};

User.prototype.updateUser = function(emptyView) {
	this.socket.emit('_user_state', this.retrieveUserState());
	
	if (emptyView) {
		this.socket.emit('_room_state', {
			users: [],
			players: [],
			piles: {},
			trash: null,
            state: null
		});
	}
};

User.prototype.retrieveUserState = function() {
	return {
		name: this.name,
		rooms: Object.keys(this.rooms),
		current: this.current
	};
};

module.exports = User;