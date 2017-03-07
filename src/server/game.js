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
		spectators: {},
		spectators_cnt: 0,
		players: {},
		players_cnt: 0
	};
};

Game.prototype.addUser = function(room, user, type) {
	var rooms = this.rooms;
	if (rooms[room]) {
		var r = rooms[room];
		if (r.spectators[user.id] ||
				r.players[user.id]) {
			return {
				head: 'err',
				body: 'user is already in room'
			};
		} else if (type === 'players' &&
							 r.player_cnt === 4) {
			return {
				head: 'fail',
				body: 'player slots are full'
			};
		}
		
		r[type][user.id] = user;
		r[type + '_cnt']++;
		return {
			head: 'ok',
			body: user.name + ' has been added to ' + type
		};
	}
	return {
		head: 'err',
		body: 'room does not exist'
	};
}

Game.prototype.getSpectators = function(room) {
	var rooms = this.rooms;
	if (rooms[room]) {
		return rooms[room].spectators;
	}
};

Game.prototype.getPlayers = function(room) {
	var rooms = this.rooms;
	if (rooms[room]) {
		return rooms[room].players;
	}
};

module.exports = Game;