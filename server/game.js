var Player = require('./player');
var Card = require('./card');

var getRandomInt = require('./util').getRandomInt;
var moveCards = require('./util').moveCards;

var MAX_PLAYERS = 4;
var MIN_PLAYERS = 2;

var TURN_DRAW_AMT = 5;

var ACTION_PHASE = 1;
var BUY_PHASE = 2;
var CLEANUP_PHASE = 3;

var ACTION_PLAY = 'action';
var TREASURE_PLAY = 'treasure';

function Game(start, piles) {
	this.start = start;
	this.pilesOrigin = piles;
	this.pilesWork = {};
	this.trash = [];
	
	this.players = [];
	this.state = "INIT";
	
	this.turn = -1;
	this.todo = [];
	
	this.action = 0;
	this.buy = 0;
	this.coin = 0;
}

Game.prototype.addPlayer = function(user) {
	if (this.players.length >= MAX_PLAYERS) {
		return false;
	} else if (this.state !== "INIT") {
		return false;
	} else if (!user) {
		return false;
	}
	
	// game has not started and can has house user
	this.players.push(new Player(user));
	return true;
};

Game.prototype.removePlayer = function(user) {
	if (!user) {
		return false;
	}
	
	var slot = this.getPlayIndex(user.id);
	if (slot === -1) {
		// player was not found
		return false;
	}

	if (this.state === "INIT") {
		// free up a player slot
		this.players.splice(slot, 1);
	} else {
		// game is in progress, wait for someone to reconnect
		var player = this.players[slot];
		
		player.id = null;
		player.name = "(disconnected)";
	}
};

Game.prototype.getPlayIndex = function(id) {
	return this.players.map(function(player) {
		return player.id;
	}).indexOf(id);
};

Game.prototype.takePlayerSlot = function(user, slot) {
	if (!(slot in this.players)) {
		return false;
	} else if (!user) {
		return false;
	}
	
	var playerSlot = this.players[slot];
	if (playerSlot.id !== null) {
		// player slot is occupied
		return false;
	}
	playerSlot.id = user.id;
	playerSlot.name = user.name;
	return true;
};

Game.prototype.retrieveGameState = function(id) {
	var todo = this.getTodo(this.todo);
	var ret = {
		players: this.players.map(function(player, index) {
			var visible = id === player.id;
			var playerState = player.retrievePlayerState(id);
			playerState.visible = visible;
			
			if (playerState.seat === this.turn && this.turn !== -1) {
				playerState.action = this.action;
				playerState.buy = this.buy;
				playerState.coin = this.coin;
			}
			return playerState;
		}, this),
		piles: this.pilesWork,
		trash: this.trash.map(function(c) {
			return c.name;
		})
	};
	
	if (todo) {
		todo.view(ret)
	} else {
		this.view(ret);
	}
	
	return ret;
};

Game.prototype.reconnect = function(user, slot) {
	if (!user) {
		return {
			head: 'err',
			body: 'invalid user'
		};
	} else if (this.getPlayIndex(user.id) !== -1) {
		return {
			head: 'err',
			body: 'user is already playing'
		};
	}

	var res = this.takePlayerSlot(user, slot);
	if (res) {
		return {
			head: 'ok',
			body: 'user is now playing'
		};
	}
	return {
		head: 'err',
		body: 'could not take player slot'
	};
};

Game.prototype.startGame = function(user) {
	if (!user) {
		return {
			head: 'err',
			body: 'invalid user'
		};
	} else if (this.getPlayIndex(user.id) === -1) {
		return {
			head: 'err',
			body: 'only players may start game'
		};
	} else if (this.state !== "INIT") {
		return {
			head: 'err',
			body: 'game is in progress'
		};
	}
	
	var len = this.players.length;
	if (len < MIN_PLAYERS) {
		return {
			head: 'err',
			body: 'game is played with two or more players'
		};
	}
	
	// flag game as in progress
	this.state = "MAIN";
	
	// init piles
	this.pilesWork = {};
	var pilesName = Object.keys(this.pilesOrigin);
	for (var i = 0; i < pilesName.length; i++) {
		var pileName = pilesName[i];
		// array containing pile size for two, three, and four players
		var pileSize = this.pilesOrigin[pileName][len - MIN_PLAYERS];
		
		this.pilesWork[pileName] = [];
		for (var j = 0; j < pileSize; j++) {
			this.pilesWork[pileName].push(new Card(pileName));
		}
	}
	
	// init trash pile
	this.trash = [];
	
	// get starting hand
	var startHand = Object.keys(this.start);
	var startLen = startHand.length;
	
	for (var i = 0; i < len; i++) {
		var player = this.players[i];
		
		// initialize player variables
		player.init(i);
		
		// distribute pile cards to player discards
		for (var j = 0; j < startLen; j++) {
			var startCard = startHand[j];
			var startAmount = this.start[startCard];
			moveCards(this.pilesWork[startCard], player.discard, startAmount); 
		}

		// player starts with five cards in hand
		player.draw(TURN_DRAW_AMT);
	}
	
	// designate the first turn
	var firstTurn = getRandomInt(0, len);
	var firstPlayer = this.players[firstTurn];
	
	this.resetResources(firstPlayer);
	this.turn = firstTurn;
	
	return {
		head: 'ok',
		body: 'game has started'
	};
};

Game.prototype.resetResources = function(player) {
	this.action = 1;
	this.buy = 1;
	this.coin = 0;
	
	player.phase = ACTION_PHASE;
	
	player.bought = false;
};

Game.prototype.view = function(ret) {
	if (ret) {
		for (var i = 0; i < ret.players.length; i++) {
			var player = ret.players[i];
			if (player.visible) {
				if (this.state === "INIT") {
					player.control = ["Start"];
				} else if (this.state === "MAIN") {
					if (this.turn === player.seat) {
						player.control = ["Action", "Buy", "Cleanup"];
					}
				}
			}
		}
	}
};

Game.prototype.setPhase = function(user, phase, end) {
	if (!user || this.state !== "MAIN") {
		return false;
	}
	
	var userIndex = this.getPlayIndex(user.id);
	var playIndex = this.turn;
	if (userIndex !== playIndex ||
	    this.todo.length ||
    	phase < 0 ||
		phase > 3) {
		return false;
	}
	
	var player = this.players[playIndex];
	if (phase <= player.phase) {
		return false;
	}
	
	player.phase = phase;
	if (player.phase === CLEANUP_PHASE) {
		if (this.endCondition()) {
			this.endGame(end);
		} else {
			// initiate cleanup sequence
			player.cleanUp();
			player.draw(TURN_DRAW_AMT);
			
			var nextTurn = (this.turn + 1) % this.players.length;
			var nextPlayer = this.players[nextTurn];
			
			this.resetResources(nextPlayer);
			this.turn = nextTurn;
		}
	}
	
	return true;
};

Game.prototype.endCondition = function() {
	return this.state === "MAIN" && (!this.pilesWork.province.length || (Object.keys(this.pilesWork).filter(function(pile) { return !this.pilesWork[pile].length; }, this).length >= 3));
};

Game.prototype.endGame = function(end) {
	end(this.players.map(function(player) {
		return player.countScore();
	}).sort(function(a, b) {
		return b.score - a.score;
	}));
	this.state = "INIT";
};

Game.prototype.tapCard = function(user, src, index) {
	if (!user || this.state !== "MAIN") {
		return false;
	}
	
	var userIndex = this.getPlayIndex(user.id);
	var todo = this.getTodo(this.todo);
	if (todo) {
		if (userIndex !== todo.turn()) {
			return false;
		}
	} else {
		if (userIndex !== this.turn) {
			return false;
		}
	}
	
	var player = this.players[userIndex];
	var cards = this.getCards(src);
	
	var ret = false;
	if (player) {
		if (todo) {
			ret = this.handleTodo(todo, cards, index);
		} else if (cards === player.hand) {
			ret = this.handlePlay(player, cards, index);
		} else if (cards in this.pilesWork) {
			ret = this.handleBuy(player, cards, index);
		}
	}
	
	return ret;
};

Game.prototype.getCards = function(src) {
	if (src && src.length) {
		var type = src.shift();
		if (type === 'players') {
			return this.getPlayerCards(src);
		} else if (type === 'piles') {
			return this.getPileCards(src);
		} else if (type === 'trash' && !src.length) {
			return this.trash;
		}
	}
	
	return null;
};

Game.prototype.getPlayerCards = function(src) {
	if (src && src.length === 2) {
		var player = src[0];
		var cards = src[1];
		if (player in this.players &&
		   (cards === 'hand' ||
			cards === 'discard' ||
			cards === 'play' ||
			cards === 'deck')) {
		  return this.players[player][cards];
		}
	}
	
	return null;
};

Game.prototype.getPileCards = function(src) {
	if (src && src.length === 1) {
		var pile = src[0];
		if (pile in this.pilesWork) {
			return pile;
		}
	}
	
	return null;
};

Game.prototype.handleTodo = function(todo, cards, index) {
	if (todo && todo.apply) {
		todo.apply(cards, index);
		this.advanceTodo(this.todo);
		return true;
	}
	
	return false;
};

Game.prototype.handlePlay = function(player, cards, index) {
	if (player && cards && cards === player.hand && index in cards) {
		var card = cards[index];
		
		if (card) {
			if (ACTION_PLAY in card.types &&
				player.canPlayAction(card) &&
				this.action) {
				this.action--;
				this.playCard(player, cards.splice(index, 1)[0], ACTION_PLAY);
				return true;
			} else if (TREASURE_PLAY in card.types &&
					   player.canPlayTreasure(card) &&
					   !this.bought) {
				this.playCard(player, cards.splice(index, 1)[0], TREASURE_PLAY);
				return true;
			}
		}
	}
	
	return false;
};

Game.prototype.playCard = function(player, card, playType) {
	player.play.push(card);
	
	// apply
	card.types[playType](player, this);
	
	this.advanceTodo(this.todo);
};

Game.prototype.handleBuy = function(player, cards, index) {
	if (player && cards in this.pilesWork && index in this.pilesWork[cards]) {
		var pile = this.pilesWork[cards];
		var card = pile[index];
		
		if (card) {
			if (player.canBuy(card) &&
				card.coin <= this.coin &&
				this.buy) {
				
				// purchase
				this.coin -= card.coin;
				this.buy--;
				
				if (!player.bought) {
					player.bought = true;
				}
				
				// gain event
				pile.splice(index, 1);
				player.discard.push(card);
				
				this.advanceTodo(this.todo);
				return true;
			}
		}
	}
	
	return false;
};

Game.prototype.tryControl = function(user, cntrl) {
	if (!user || this.state !== "MAIN") {
		return false;
	}
	
	var userIndex = this.getPlayIndex(user.id);
	var todo = this.getTodo(this.todo);
	if (!todo || userIndex !== todo.turn() || !todo.cont) {
		return false;
	}
	
	var ret = todo.cont(cntrl);
	this.advanceTodo(this.todo);
	return ret;
};

Game.prototype.advanceTodo = function(todo) {
	while (todo.length) {
		var item = todo[0];
		var ret = this.advanceItem(item);
		if (ret) {
			todo.shift();
		} else {
			return false;
		}
	}
	
	return true;
};

Game.prototype.advanceItem = function(item) {
	while (true) {
		// break for redo, return true to complete / false to wait on input
		var ret = this.advanceTodo(item.todo);
		if (!ret) {
			return false;
		}
		
		switch (item.state) {
			case "PRE":
				if (!item.react.length) {
					this.handleReactions(item);
				}
				
				this.advanceReactions(item);
				
				if (item.react.length) {
					return false;
				}
			case "MAIN":
				item.state = "MAIN";
				
				if (item.main.length) {
					var m = item.main[0];
					if (!m.resolvable()) {
						return false;
					}
					
					item.main.shift();
					m.resolve(item);
					break;
				}
			case "POST":
				item.state = "POST";
				
				if (!item.react.length) {
					this.handleReactions(item);
				}
				
				this.advanceReactions(item);
				if (item.react.length) {
					return false;
				}
				
				if (item.trigger.length) {
					var t = item.trigger[0];
					if (!t.resolvable()) {
						return false;
					}
					
					item.trigger.shift();
					t.resolve(item);
					break;
				}
				
				return true;
		}
	}
};

Game.prototype.getTodo = function(todo) {
	var len = todo.length;
	if (len) {
		var res = todo[0];
		var ret = this.getTodo(res.todo);
		
		return ret ? ret : res;
	}
	
	return null;
};

Game.prototype.handleReactions = function(item) {
	var turn = item.origin;
	var len = this.players.length;
	for (let i = 0; i < len; i++) {
		
		let t = (turn + i) % len;
		let player = this.players[t];
		let func = function() {
			return t;
		};
		item.react.push({
			// react event
			turn: func,
			resolved: false,
			usable: function(item) {
				// can use on item
				return player.canReact(item) && !this.resolved;
			},
			apply: function(cards, index) {
				// use react card
				if (cards === player.hand && index in cards) {
					var card = cards[index];
					if (card.canReact && card.canReact(player, item)) {
						card.types.reaction(player, item);
					}
				}
			},
			cont: function(cntrl) {
				if (cntrl === "finish" && !this.resolved) {
					this.resolved = true;
					return true;
				}
				return false;
			},
			view: function(disp) {
				if (disp.players[t].visible) {
					disp.players[t].control = ["finish"];
				}
			}
		});
	}
};

Game.prototype.advanceReactions = function(item) {
	while (item.react.length) {
		var r = item.react[0];
		if (r.usable(item)) {
			break;
		}
		
		item.react.shift();
	}
};

module.exports = Game;