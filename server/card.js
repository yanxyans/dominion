var COPPER_VALUE = 1;
var SILVER_VALUE = 2;
var GOLD_VALUE = 3;
var ESTATE_VALUE = 1;
var DUCHY_VALUE = 3;
var PROVINCE_VALUE = 6;
var CURSE_VALUE = 1;

var Item = require('./item');

function incPlayerCoin(value) {
	return function(player, game) {
		if (player) {
			game.coin += value;
		}
	};
}

function incPlayerPoints(points) {
	return function(player, game) {
		if (player) {
			player.points += points;
		}
	};
}

function decPlayerPoints(points) {
	return function(player, game) {
		if (player) {
			player.points -= points;
		}
	};
}

function selectItem(player, cntrl, cont, test, res, type, other, rev, src) {
	var ref = [];
	
	var ret = new Item([{
		turn: function() {
			return player.seat;
		},
		view: function(ret) {
			var playerView = ret.players[player.seat];
			var visible = playerView.visible;
			if (visible) {
				playerView.control = cntrl;
			}
		},
		apply: function(cards, index) {
			if (src(cards)) { // source from player hand or game pile
				if (typeof cards == "string") {
					cards = src(cards);
				}
				if (index in cards) {
					var card = cards[index];
					if (!test(this.ref, card)) {
						return;
					}
					
					var found = this.ref.indexOf(card);
					if (found === -1) {
						// select
						this.ref.push(card);
					} else {
						// deselect
						this.ref.splice(found, 1);
					}
				}
			}
		},
		resolvable: rev,
		cont: cont,
		resolved: false,
		resolve: res
	}], [], type, player.seat);
	
	ret.main = ret.main.concat(other);
	ret.main = ret.main.map(function(r) {
		r.ref = ref;
		return r;
	});
	return ret;		
}

function discardItem(player, ref) {
	return new Item([{
		turn: function() {
			return player.seat;
		},
		resolvable: function() {
			return true;
		},
		resolve: function(item) {
			for (var i = 0; i < ref.length; i++) {
				var card = ref[i];
				var index = player.hand.indexOf(card);
				
				if (index !== -1) {
					player.hand.splice(index, 1);
					player.discard.push(card);
				}
			}
		}
	}], [], "discard", player.seat);
}

function cellarAction(player, game) {
	if (player && game) {
		game.action++;
		
		var drawItem = function(toDraw) {
			return new Item([{
				turn: function() {
					return player.seat;
				},
				resolvable: function() {
					return true;
				},
				resolve: function(item) {
					player.draw(toDraw);
				}
			}], [], "draw", player.seat);
		};
		
		var playItem = selectItem(player, ["discard"],
			function(cntrl) {
				if (cntrl === "discard" && !this.resolved) {
					this.resolved = true;
					return true;
				}
				return false;
			},
			function(ref, card) {
				return true;
			},
			function(item) {
				var len = this.ref.length;
				if (len) {
					item.todo.push(discardItem(player, this.ref));
				}
			},
			"play",
			[{
				turn: function() {
					return player.seat;
				},
				resolvable: function() {
					return true;
				},
				resolve: function(item) {
					var len = this.ref.length;
					if (len) {
						item.todo.push(drawItem(len));
					}
				}
			}],
			function() {
				return this.resolved || player.hand.length < 1;
			},
			function(cards) {
				return cards === player.hand;
			}
		);
			
		game.todo.push(playItem);
	}
}

function marketAction(player, game) {
	if (player) {
		player.draw(1);
		game.action++;
		game.buy++;
		game.coin++;
	}
}

function militiaAction(player, game) {
	if (player && game) {
		game.coin += 2;
		
		var militiaAttack = this.attack;
		
		var main = [];
		var len = game.players.length;
		for (let i = 1; i < len; i++) {
			let j = (player.seat + i) % len;
			let enemy = game.players[j];
			
			let atk = new Item([], [], "attack", player.seat);
			atk.target = enemy;
			
			let atkItem = {
				turn: function() {
					return player.seat;
				},
				resolvable: function() {
					return true;
				},
				resolve: function(item) {
					if (atk.target && atk.target.hand.length > 3) {
						item.todo.push(militiaAttack(enemy));
					}
				}
			};
			atk.main.push(atkItem);
			
			game.todo.push(atk);
		}
	}
}

function militiaAttack(player) {
	return selectItem(player, ["discard"],
		function(cntrl) {
			if (cntrl === "discard" && !this.resolved && this.ref.length + 3 === player.hand.length) {
				this.resolved = true;
				return true;
			}
			return false;
		},
		function(ref, card) {
			return (player.hand.length > ref.length + 3) || ref.indexOf(card) !== -1;
		},
		function(item) {
			item.todo.push(discardItem(player, this.ref));
		},
		"attacked",
		[],
		function() {
			return this.resolved;
		},
		function(cards) {
			return cards === player.hand;
		}
	);
}

function moatAction(player, game) {
	if (player) {
		player.draw(2);
	}
}

function moatReaction(player, item) {
	if (item) {
		item.target = null;
	}
}

function trashItem(player, game, ref) {
	return new Item([{
		turn: function() {
			return player.seat;
		},
		resolvable: function() {
			return true;
		},
		resolve: function(item) {
			for (var i = 0; i < ref.length; i++) {
				var card = ref[i];
				var index = player.hand.indexOf(card);
				
				if (index !== -1) {
					player.hand.splice(index, 1);
					game.trash.push(card);
				}
			}
		}
	}], [], "trash", player.seat);
}

function selectGainWrap(player, game, cntrl, cont, test, dest, res) {
	return selectItem(player, cntrl, cont, test,
		function(item) {
			if (this.ref.length) {
						
				var gained = this.ref[0];
				Object.keys(game.pilesWork).map(function(name) {
					var pile = game.pilesWork[name];
					var index = pile.indexOf(gained);
					if (index !== -1) {
						pile.splice(index, 1);
						dest.push(gained);
					}
					return name;
				});
			}
		},
		"gain",
		[],
		res,
		function(cards) {
			var pool = Object.keys(game.pilesWork);
			return pool.indexOf(cards) !== -1 ? game.pilesWork[cards] : null;
		}
	);
}

function mineAction(player, game) {
	if (player && game) {
		
		var mineGain = function(r) {
			var old = r[0];
			return selectGainWrap(player, game, ["gain"],
				function(cntrl) {
					if (cntrl === "gain" && !this.resolved && this.ref.length === 1) {
						this.resolved = true;
						return true;
					}
					return false;
				},
				function(ref, card) {
					return ('treasure' in card.types && card.coin <= old.coin + 3 && ref.length < 1) || ref.indexOf(card) !== -1;
				},
				player.hand,
				function() {
					var otherCheck = Object.keys(game.pilesWork).filter(function(name) {
						var pile = game.pilesWork[name];
						return pile.length > 0 && 'treasure' in pile[0].types && pile[0].coin <= old.coin + 3;
					}).length === 0;
					return this.resolved || otherCheck;
				}
			);
		};
		
		var playItem = selectItem(player, ["trash"],
			function(cntrl) {
				if (cntrl === "trash" && !this.resolved && this.ref.length <= 1) {
					this.resolved = true;
					return true;
				}
				return false;
			},
			function(ref, card) {
				return ('treasure' in card.types && ref.length < 1) || ref.indexOf(card) !== -1;
			},
			function(item) {
				var len = this.ref.length;
				if (len) {
					item.todo.push(trashItem(player, game, this.ref));
				}
			},
			"play",
			[{
				turn: function() {
					return player.seat;
				},
				resolvable: function() {
					return true;
				},
				resolve: function(item) {
					var len = this.ref.length;
					if (len) {
						var otherCheck = Object.keys(game.pilesWork).filter(function(name) {
							var pile = game.pilesWork[name];
							return pile.length > 0 && 'treasure' in pile[0].types && pile[0].coin <= this.ref[0].coin + 3;
						}, this).length !== 0;
						if (otherCheck) {
							item.todo.push(mineGain(this.ref));
						}
					}
				}
			}],
			function() {
				return this.resolved || player.hand.filter(function(card) {
					return 'treasure' in card.types;
				}).length === 0;
			},
			function(cards) {
				return cards === player.hand;
			}
		);
		
		game.todo.push(playItem);
	}
}

function remodelAction(player, game) {
	if (player && game) {

		var remodelGain = function(r) {
			var old = r[0];
			return selectGainWrap(player, game, ["gain"],
				function(cntrl) {
					if (cntrl === "gain" && !this.resolved && this.ref.length === 1) {
						this.resolved = true;
						return true;
					}
					return false;
				},
				function(ref, card) {
					return (card.coin <= old.coin + 2 && ref.length < 1) || ref.indexOf(card) !== -1;
				},
				player.discard,
				function() {
					var otherCheck = Object.keys(game.pilesWork).filter(function(name) {
						var pile = game.pilesWork[name];
						return pile.length > 0 && pile[0].coin <= old.coin + 2;
					}).length === 0;
					return this.resolved || otherCheck;
				}
			);
		};
		
		var playItem = selectItem(player, ["trash"],
			function(cntrl) {
				if (cntrl === "trash" && !this.resolved && this.ref.length === 1) {
					this.resolved = true;
					return true;
				}
				return false;
			},
			function(ref, card) {
				return (ref.length < 1) || ref.indexOf(card) !== -1;
			},
			function(item) {
				var len = this.ref.length;
				if (len) {
					item.todo.push(trashItem(player, game, this.ref));
				}
			},
			"play",
			[{
				turn: function() {
					return player.seat;
				},
				resolvable: function() {
					return true;
				},
				resolve: function(item) {
					var len = this.ref.length;
					if (len) {
						var otherCheck = Object.keys(game.pilesWork).filter(function(name) {
							var pile = game.pilesWork[name];
							return pile.length > 0 && pile[0].coin <= this.ref[0].coin + 2;
						}, this).length !== 0;
						if (otherCheck) {
							item.todo.push(remodelGain(this.ref));
						}
					}
				}
			}],
			function() {
				return this.resolved || player.hand.length < 1;
			},
			function(cards) {
				return cards === player.hand;
			}
		);
		
		game.todo.push(playItem);
	}
}

function smithyAction(player, game) {
	if (player) {
		player.draw(3);
	}
}

function villageAction(player, game) {
	if (player) {
		player.draw(1);
		game.action += 2;
	}
}

function woodcutterAction(player, game) {
	if (player) {
		game.buy++;
		game.coin += 2;
	}
}

function workshopAction(player, game) {
	if (player && game) {
		// gain event
		
		var workCondition = function() {
			return Object.keys(game.pilesWork).filter(function(name) {
				var pile = game.pilesWork[name];
				return pile.length > 0 && pile[0].coin <= 4;
			}).length;
		};
		
		var workshopGain = selectGainWrap(player, game, ["gain"],
			function(cntrl) {
				if (cntrl === "gain" && !this.resolved && this.ref.length === 1) {
					this.resolved = true;
					return true;
				}
				return false;
			},
			function(ref, card) {
				return (card.coin <= 4 && ref.length < 1) || ref.indexOf(card) !== -1;
			},
			player.discard,
			function() {
				return this.resolved || workCondition() === 0;
			}
		);
		
		var playItem = new Item([{
			turn: function() {
				return player.seat;
			},
			resolvable: function() {
				return true;
			},
			resolve: function(item) {
				if (workCondition() !== 0) {
					item.todo.push(workshopGain);
				}
			}
		}], [], "play", player.seat);
		
		game.todo.push(playItem);
	}
}

function moatReact(player, item) {
	if (item) {
		var type = item.type;
		var state = item.state;
		var target = item.target;
		return type === "attack" && state === "PRE" && target === player;
	}
	return false;
}

function getCardAttributes(name) {
	switch (name) {
		case 'cellar':
			return {
				coin: 2,
				types: {
					action: cellarAction
				}
			};
		case 'copper':
			return {
				coin: 0,
				types: {
					treasure: incPlayerCoin(COPPER_VALUE)
				}
			};
		case 'curse':
			return {
				coin: 0,
				types: {
					curse: decPlayerPoints(CURSE_VALUE)
				}
			};
		case 'duchy':
			return {
				coin: 5,
				types: {
					victory: incPlayerPoints(DUCHY_VALUE)
				}
			};
		case 'estate':
			return {
				coin: 2,
				types: {
					victory: incPlayerPoints(ESTATE_VALUE)
				}
			};
		case 'gold':
			return {
				coin: 6,
				types: {
					treasure: incPlayerCoin(GOLD_VALUE)
				}
			};
		case 'market':
			return {
				coin: 5,
				types: {
					action: marketAction
				}
			};
		case 'militia':
			return {
				coin: 4,
				types: {
					attack: militiaAttack,
					action: militiaAction
				}
			};
		case 'mine':
			return {
				coin: 5,
				types: {
					action: mineAction
				}
			};
		case 'moat':
			return {
				coin: 2,
				types: {
					action: moatAction,
					reaction: moatReaction
				},
				canReact: moatReact
			};
		case 'province':
			return {
				coin: 8,
				types: {
					victory: incPlayerPoints(PROVINCE_VALUE)
				}
			};
		case 'remodel':
			return {
				coin: 4,
				types: {
					action: remodelAction
				}
			};
		case 'silver':
			return {
				coin: 3,
				types: {
					treasure: incPlayerCoin(SILVER_VALUE)
				}
			};
		case 'smithy':
			return {
				coin: 4,
				types: {
					action: smithyAction
				}
			};
		case 'village':
			return {
				coin: 3,
				types: {
					action: villageAction
				}
			};
		case 'woodcutter':
			return {
				coin: 3,
				types: {
					action: woodcutterAction
				}
			};
		case 'workshop':
			return {
				coin: 3,
				types: {
					action: workshopAction
				}
			};
		default:
			return {
				coin: null,
				types: {}
			};
	}
}

function Card(name) {
	var attributes = getCardAttributes(name);
	
	this.name = name;
	this.coin = attributes.coin;
	this.types = attributes.types;
	
	if (attributes.canReact) {
		this.canReact = attributes.canReact;
	}
}

module.exports = Card;