var Game = require('./game');

function Room(io) {
	this.io = io;
	this.rooms = {};
}

Room.prototype.newRoom = function(newGame) {
    if (!newGame) {
        return false;
    }
    
    var name = newGame.name;
	if (this.rooms[name]) {
		return false;
	}
    
    var callback = this.emitRoom.bind(this, name);
	this.rooms[name] = {
		game: new Game(newGame.startDeck, newGame.supply, callback),
		users: {}
	};
	return true;
};

Room.prototype.emitRoom = function(room, type, content) {
    this.io.sockets.in(room).emit(type, content);
};

Room.prototype.hasUser = function(room, user) {
	return user.id in room.users;
};

Room.prototype.joinUser = function(name, user) {
	var room = this.rooms[name];
    if (!room || !user || this.hasUser(room, user)) {
        return false;
    }
	
	// user will be joined to room as player, if possible
	var res = room.game.addPlayer(user);
	var joinType = res ? 'player' : 'spectator';
    
	room.users[user.id] = {
		name: user.name,
		type: joinType
	};
	user.addRoom(name, joinType);
    
    this.updateRoom(name);
	return true;
};

Room.prototype.leaveUser = function(name, user) {
	var room = this.rooms[name];
    if (!room || !user || !this.hasUser(room, user)) {
        return false;
    }
	
	var joinType = room.users[user.id].type;
	if (joinType === 'player') {
		room.game.removePlayer(user);
	}
	
	// remove user from room
	delete room.users[user.id];
	user.removeRoom(name);
	
	this.updateRoom(name);
	return true;
};

Room.prototype.updateRoom = function(name) {
	var room = this.rooms[name];
	if (!room) {
		return false;
	}
	
	var users = this.io.sockets.adapter.rooms[name];
	if (!users) {
		return false;
	}
	
	Object.keys(users.sockets).forEach(function(id) {
		this.io.to(id).emit('_room_state', this.retrieveRoomState(room, id));
	}, this);
};

Room.prototype.retrieveRoomState = function(room, id) {
	if (!room || !room.users[id]) {
		return null;
	}
	
	var gameState = room.game.retrieveGameState(id);
	return {
		users: Object.keys(room.users).map(function(id) {
            var user = room.users[id];
            return { name: user.name, type: user.type };
        }),
		players: gameState.players,
		supply: gameState.piles,
		trash: gameState.trash
	};
};

Room.prototype.getGame = function(name) {
	var room = this.rooms[name];
    return room ? room.game : null;
};

Room.prototype.setPlayer = function(user) {
    if (!user) {
        return false;
    }
    
    var name = user.current;
	var room = this.rooms[name];
    var userRoom = user.rooms[name];
	if (!room || !userRoom || !this.hasUser(room, user)) {
		return false;
	}

	room.users[user.id].type = 'player';
    userRoom.type = 'player';
	return true;
};

Room.prototype.updateUser = function(user) {
    if (user) {
        var id = user.id;
        var name = user.name;
        
        Object.keys(user.rooms).forEach(function(userRoom) {
            var room = this.rooms[userRoom];
            
            if (room) {
                var user = room.users[id];
                
                if (user) {
                    user.name = name;
                    if (user.type === 'player') {
                        var players = room.game.players;
                        var player = players.find(function(player) {
                            return player.id === id;
                        });
                        if (player) {
                            player.name = name;
                        }
                    }
                    
                    this.updateRoom(userRoom);
                }
            }
        }, this);
    }
};

module.exports = Room;