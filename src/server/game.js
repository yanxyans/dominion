function Game(io) {
	this.io = io;
	
	this.rooms = {};
}

Game.prototype.newRoom = function(room, set) {
	var rooms = this.rooms;
	if (rooms[room]) {
		return {
			head: 'err',
			body: 'room is taken'
		};
	}
	rooms[room] = {
		set: set,
		spectators: {},
		players: {}
	};
	return {
		head: 'ok',
		body: 'room was created'
	};
};

module.exports = Game;