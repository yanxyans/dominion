var Player = require('./player');
var getRandomInt = require('./util').getRandomInt;
var Card = require('./card');

var MAX_PLAYERS = 4;
var MIN_PLAYERS = 2;
var TURN_DRAW_AMT = 5;
var CLEANUP_PHASE = 3;

function Game(start, piles) {
	this.start = start;
	this.pilesOrigin = piles;
	this.pilesWork = {};
	this.trash = [];
	
	this.players = [];
	this.state = "INIT";
	this.turn = [];
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
	if (this.state !== "INIT") {
		var activePlayer = this.players[this.turn[this.turn.length - 1]];
		this.getControls(activePlayer);
		this.getControls(this.players[this.turn[this.turn.length - 1]]);
	}
	
	return {
		players: this.players.map(function(player, index) {
			var turn = this.state !== "INIT" &&
			           this.turn[this.turn.length - 1] === player.seat;
			var visible = id === player.id &&
			              (this.state === "INIT" || turn);
			var control = visible ? this.getControls(player) : null;
											
			var playerState = player.retrievePlayerState(id);
			playerState.turn = turn;
			
			if (control) {
				this.getControls(player);
				playerState.control = control;
			}
			return playerState;
		}, this),
		piles: this.pilesWork,
		trash: this.trash.map(function(c) {
			return c.name;
		})
	};
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
		
		// assign player seats
		player.seat = i;
		
		// initialize player variables
		player.init();
		
		// distribute pile cards to player discards
		for (var j = 0; j < startLen; j++) {
			var startCard = startHand[j];
			var startAmount = this.start[startCard];
			this.moveCards(this.pilesWork[startCard], player.discard, startAmount); 
		}

		// player starts with five cards in hand
		player.draw(TURN_DRAW_AMT);
	}
	
	// designate the first turn
	this.turn = [];
	var firstTurn = getRandomInt(0, len);
	var firstPlayer = this.players[firstTurn];
	firstPlayer.start();
	
	this.turn.push(firstTurn);
	
	return {
		head: 'ok',
		body: 'game has started'
	};
};

Game.prototype.moveCards = function(src, dest, amt) {
	if (src && dest && src.length >= amt) {
		for (var i = 0; i < amt; i++) {
			dest.push(src.pop());
		}
	}
};

Game.prototype.getControls = function(player) {
	if (this.state === "INIT") {
		return ["Start"];
	} else if (this.state === "MAIN" && player) {
		var todo = this.getTodo(player);
		return todo ? todo.cntrl : ["Action", "Buy", "Cleanup"];
	}
	
	return [];
};

Game.prototype.setPhase = function(user, phase, end) {
	if (!user || this.state !== "MAIN") {
		return false;
	}
	
	var userIndex = this.getPlayIndex(user.id);
	var playIndex = this.turn[0];
	if (userIndex !== playIndex ||
	    this.turn.length > 1 ||
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
			
			var turn = this.turn.pop();
			var nextTurn = (turn + 1) % this.players.length;
			var nextPlayer = this.players[nextTurn];
			nextPlayer.start();
			
			this.turn.push(nextTurn);
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
	var activeIndex = this.turn[this.turn.length - 1];
	if (userIndex !== activeIndex) {
		return false;
	}
	
	var player = this.players[activeIndex];
	var cards = this.getCards(src);
	
	if (player) {
		var todo = this.getTodo(player);
		if (todo) {
			return this.handleTodo(todo, cards, index);
		} else if (cards === player.hand) {
			var ret = this.handlePlay(player, cards, index);
			this.getTodo(player);
			return ret;
		} else if (cards in this.pilesWork) {
			return this.handleBuy(player, cards, index);
		}
	}
	
	return false;
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
		
		return true;
	}
	
	return false;
};

Game.prototype.handlePlay = function(player, cards, index) {
	if (player && cards === player.hand && index in cards) {
		var card = cards[index];
		var playType = player.tryPlay(card);
		
		if (playType && index in cards) {
			var p = cards.splice(index, 1)[0];
			player.play.push(p);
			
			// apply played card
			var otherPlayers = this.getOtherPlayers(player);
			var piles = this.pilesWork;
			var trash = this.trash;
			
			var turn = this.turn;
			var len = this.turn.length;
			var gc = this.getTodo;
			var callback = function(s) {
				turn.splice(len, 0, s);
			};
			p.types[playType](player, otherPlayers, piles, trash, callback);
			
			return true;
		}
	}
	
	return false;
};

Game.prototype.handleBuy = function(player, cards, index) {
	if (player && cards in this.pilesWork && index in this.pilesWork[cards]) {
		var pile = this.pilesWork[cards];
		var card = pile[index];
		if (player.tryPay(card)) {
			
			// gain event
			player.todo.push({
				prep: function gain() {
					this.card = {
						pile: pile,
						index: index
					};
					this.prepped = true;
				},
				resolve: function gain() {
					if (this.card) {
						var p = this.card.pile;
						var i = this.card.index;
						
						if (p && i in p) {
							// gain card
							var c = p.splice(i, 1)[0];
							player.discard.push(c);
						}
					}
					
					this.resolved = true;
				},
				prepped: false,
				resolved: false,
				cntrl: [],
				todo: []
			});
			
			return true;
		}
	}
	
	return false;
};

Game.prototype.getOtherPlayers = function(player) {
	 return this.players.filter(function(p) {
		 return p !== player;
	 });
};

Game.prototype.tryControl = function(user, cntrl) {
	if (!user || this.state !== "MAIN") {
		return false;
	}
	
	var userIndex = this.getPlayIndex(user.id);
	var activeIndex = this.turn[this.turn.length - 1];
	if (userIndex !== activeIndex) {
		return false;
	}
	
	var player = this.players[activeIndex];
	var todo = this.getTodo(player);
	if (todo && todo[cntrl]) {
		todo[cntrl]();
		return true;
	}
	return false;
};

Game.prototype.getTodo = function(node) {
	if (node && node.todo) {
		var todo = node.todo;
		while (todo.length) {
			var t = todo[0];
			if (t.cntrl && t.cntrl.length) {
				// wait on user input
				return t;
			}
			
			
			if (!t.prepped && t.prep) {
				// auto-complete default event
				
				t.prep();
				if (this.handleReactions(t)) {
					return t;
				}
			}
			if (!t.resolved && t.resolve) {
				t.resolve();
				if (this.handleReactions(t)) {
					return t;
				}
			}
			
			// dfs unresolved events
			var res = this.getTodo(t);
			if (res) {
				// bubble up unresolved event
				return res;
			}
			
			if (t.resolved) {
				// filter resolved events
				var u = todo.splice(0, 1)[0];
				
				// take player todo as event node
				var ret = false;
				if (node.prep && node.resolve) {
					ret = this.handleReactions(node);
				}
				
				if (u.prep && (u.prep.name === 'react' || u.prep.name === 'attacked') &&
				    u.resolve && (u.resolve.name === 'react' || u.resolve.name === 'attacked') &&
						this.turn.length > 1) {
					this.turn.pop();
					
				}
				
				if (ret) {
					return t;
				}
			}
		}
	}
	
	return null;
};

Game.prototype.handleReactions = function(t) {
	var found = false;

	if (t && this.state === "MAIN") {
		// game must be in main state
		
		var turnLen = this.turn.length;
		var activeIndex = this.turn[turnLen - 1];
		
		var playerLen = this.players.length;
		var wrapIndex = activeIndex + playerLen;
		
		for (var i = activeIndex; i < wrapIndex; i++) {
			var playIndex = i % playerLen;
			var player = this.players[playIndex];
			
			if (player.canReact(t)) {
				this.turn.splice(turnLen, 0, playIndex);
				
				// react event
				player.todo.unshift({
					selected: [],
					apply: function(cards, index) {
						if (cards === player.hand ||
						    cards === player.discard) {
							if (index in cards) {
								var card = cards[index];
								if (card.canReact && card.canReact(player, cards, t)) {
									var found = this.selected.indexOf(card);
									if (found === -1 && !this.selected.length) {
										// select
										this.selected.push(card);
									} else if (found !== -1) {
										// deselect
										this.selected.splice(found, 1);
									}
								}
							}
						}
					},
					react: function() {
						var len = this.selected.length;
						if (len === 1) {
							this.selected.shift().types.reaction(player, t);
							
							if (!player.canReact(t)) {
								this.cntrl = [];
							}
						} else if (len === 0) {
							this.cntrl = [];
						}
					},
					prep: function react() {
						this.prepped = true;
					},
					resolve: function react() {
						this.resolved = true;
					},
					prepped: true,
					resolved: false,
					cntrl: ['react'],
					todo: []
				});
				
				if (!found) {
					found = true;
				}
			}
		}
		
	}
	
	return found;
};

module.exports = Game;