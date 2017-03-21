function Game(io) {
	this.io = io;
	this.rooms = {};
}

/**
 * Shuffles array in place.
 * @param {Array} a items The array containing the items.
 */
function shuffle(a) {
	var j, x, i;
	for (i = a.length; i; i--) {
		j = Math.floor(Math.random() * i);
		x = a[i - 1];
		a[i - 1] = a[j];
		a[j] = x;
	}
}

Game.prototype.getGame = function(room) {
	var game = this.rooms[room];
	if (game) {
		return {
			kingdom: game.set.kingdom,
			users: Object.keys(game.users).map(function(key) {
				var user = game.users[key];
				return {
					name: user.name,
					type: user.type
				}
			})
		};
	}
};

Game.prototype.getAction = function(user) {
	var room = user.getRoom();
	var id = user.getID();
	var game = this.rooms[room];
	if (!game || !game.users[id]) {
		return [];
	}
	var turn = game.turn;
	var type = game.users[id].type;
	
	if (type && (turn === null || game.players[turn].id === id)) {
		switch (game.phase) {
			case 0:
				return [this.start.name, this.start.bind(this, user)];
			default:
				return [];
		}
	}
	return [];
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
		phase: 0,
		players: [],
		modifiers: [],
		turn: null,
		trash: []
	};
};

Game.prototype.addUser = function(user, room) {
	var rooms = this.rooms;
	var id = user.getID();
	var name = user.getName();
	if (!rooms[room]) {
		user.socket.emit('_update_view', {
			head: 'err',
			body: 'room does not exist'
		});
	} else if (id in rooms[room].users) {
		user.socket.emit('_update_view', {
			head: 'err',
			body: 'user already in room'
		});
	} else {	
		// 0 for spectator, 1 for player
		var user_type = rooms[room].spots > 0 ? 1 : 0;
		rooms[room].users[id] = {
			name: name,
			type: user_type
		};
		
		if (user_type) {
			rooms[room].spots--;
		}
		user.addRoom(room, user_type);
		user.pickRoom(null, room);
		user.socket.emit('_update_action', ...this.getAction(user));
		this.io.sockets.in(room).emit('_update_game', this.getGame(room));
	}
};

Game.prototype.removeUser = function(room, user) {
	var rooms = this.rooms;
	var id = user.getID();
	if (!rooms[room]) {
		user.socket.emit('_update_view', {
			head: 'err',
			body: 'room does not exist'
		});
	} else if (!rooms[room].users[id]) {
		user.socket.emit('_update_view', {
			head: 'err',
			body: 'user is not in room'
		});
	} else {
		if (rooms[room].users[id].type) {
			rooms[room].spots++;
		}
		delete rooms[room].users[id];
	}
};

Game.prototype.start = function start_game(user) {
	var room = user.getRoom();
	var game = this.rooms[room];
	if (game && !game.phase && game.spots < 3) {
		game.phase = 'action';
		Object.keys(game.users).forEach(function(key) {
			if (game.users[key].type) {
				var player = {
					id: key,
					name: game.users[key].name,
					discard: [],
					deck: [],
					hand: [],
					in_play: [],
					reaction: []
				}
				
				Object.keys(game.set.start).forEach(function(card) {
					var amt = game.set.start[card];
					this.gain(game.set.kingdom, card, amt, player.discard);
				}, this);
				this.draw(5, player);
				game.players.push(player);
			}
		}, this);
		game.turn = 0;
		console.log("it is " + game.players[game.turn].name + "'s turn");
		console.log("he is holding " + game.players[game.turn].hand.toString());
	} else {
		user.socket.emit('_update_action', ...this.getAction(user));
	}
};

Game.prototype.gain = function(kingdom, card, amt, dest) {
	var pile_amt = kingdom[card];
	var gain_amt = Math.min(amt, pile_amt);
	kingdom[card] -= gain_amt;
	
	for (var i = 0; i < gain_amt; i++) {
		dest.push(card);
	}
};

Game.prototype.draw = function(amt, player) {
	var deck_amt = player.deck.length;
	var draw_amt = Math.min(amt, deck_amt);
	
	for (var i = 0; i < draw_amt; i++) {
		player.hand.push(player.deck.pop());
	}
	if (draw_amt < amt && player.discard) {
		shuffle(player.discard);
		[player.deck, player.discard] = [player.discard, player.deck];
		this.draw(amt - draw_amt, player);
	}
};

Game.prototype.removeUserAll = function(user) {
	var id = user.getID();
	Object.keys(user.rooms).forEach(function(room) {
		this.removeUser(room, user);
		this.io.sockets.in(room).emit('_update_game', this.getGame(room));
		delete user.rooms[room];
	}, this);
};

module.exports = Game;