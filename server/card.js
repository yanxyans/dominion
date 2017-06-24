var COPPER_VALUE = 1;
var SILVER_VALUE = 2;
var GOLD_VALUE = 3;
var ESTATE_VALUE = 1;
var DUCHY_VALUE = 3;
var PROVINCE_VALUE = 6;
var CURSE_VALUE = 1;

var Item = require('./item');
var Task = require('./task');

// coin and points factory

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

// item factory

function selectItem(main, trigger, type, turn, valid, selectable, controls, selected) {
	
	var selectTask = new Task(turn,
		function(item) {
			// do nothing
		},
		valid(), valid,
		function(ret) {
			var playerView = ret.players[turn];
			var visible = playerView.visible;
			if (visible) {
				playerView.control = Object.keys(controls);
			}
		},
		function(cards, index) {
			var card = selectable(cards, index, selected);
			if (!card) {
				return;
			}
			
			var found = selected.indexOf(card);
			if (found === -1) {
				// select
				selected.push(card);
			} else {
				// deselect
				selected.splice(found, 1);
			}
		},
		controls);
	
	return new Item([selectTask, ...main], trigger, type, turn);
}

function trashItem(player, game, selected) {
	var turn = player.seat;
	
	var trash = new Task(turn,
		function(item) {
			var len = selected.length;
			for (var i = 0; i < len; i++) {
				var card = selected[i];
				var index = player.hand.indexOf(card);
				
				if (index !== -1) {
					player.hand.splice(index, 1);
					game.trash.push(card);
				}
			}
		}, true);
	
	return new Item([trash], [], "trash", turn);
}

function gainItem(player, game, valid, selectable, selected, dest) {
	var turn = player.seat;
	
	var gain = new Task(turn,
		function(item) {
			var len = selected.length;
			
			for (var i = 0; i < len; i++) {
				var card = selected[i];
				
				var keys = Object.keys(game.pilesWork).filter(function(name) {
					var pile = game.pilesWork[name];
					return pile.indexOf(card) !== -1;
				});
				
				if (keys.length === 1) {
					var pile = game.pilesWork[keys[0]];
					var index = pile.indexOf(card);
					if (index !== -1) {
						pile.splice(index, 1);
						dest.push(card);
					}
				}
			}
		}, true);
	
	return selectItem([gain], [], "gain", turn, valid, selectable,
		{
			Gain: function() {
				if (selected.length === 1) {
					this.resolvable = true;
					return true;
				}
				
				return false;
			}
		},
		selected);
}

// task factory

function discardTask(player, selected) {
	var turn = player.seat;
	
	return new Task(turn,
		function(item) {
			var len = selected.length;
			for (var i = 0; i < len; i++) {
				var card = selected[i];
				var index = player.hand.indexOf(card);
				
				if (index !== -1) {
					player.hand.splice(index, 1);
					player.discard.push(card);
				}
			}
		}, true);
}

function drawTask(player, amt) {
	var turn = player.seat;
	return new Task(turn,
		function(item) {
			player.draw(amt);
		}, true);
}

// misc

function getWorkshopPiles(piles) {
	return Object.keys(piles).filter(function(name) {
		var pile = piles[name];
		return pile.length > 0 && pile[0].coin <= 4;
	});
}

// primary card routines

function cellarAction(player, game) {
	if (player && game) {
		game.action++;
		
		var turn = player.seat;
		var selected = [];
		
		var discardTk = new Task(turn,
			function(item) {
				if (selected.length) {
					var discard = discardTask(player, selected);
					var discardItem = new Item([discard], [], "discard", turn);
					
					item.todo.push(discardItem);
				}
			}, true);
		var drawTk = new Task(turn,
			function(item) {
				if (selected.length) {
					var draw = drawTask(player, selected.length);
					var drawItem = new Item([draw], [], "draw", turn);
					
					item.todo.push(drawItem);
				}
			}, true);
			
		var playItem = selectItem([discardTk, drawTk], [], "play", turn,
			function() {
				return player.hand.length < 1;
			},
			function(cards, index, sel) {
				if (cards === player.hand && index in cards) {
					return cards[index];
				}
				
				return null;
			},
			{
				Discard: function() {
					this.resolvable = true;
					return true;
				}
			},
			selected);
			
		game.todo.push(playItem);
	}
}

function marketAction(player, game) {
	if (player) {
		var turn = player.seat;
		
		var drawTk = new Task(turn,
			function(item) {
				var draw = drawTask(player, 1);
				var drawItem = new Item([draw], [], "draw", turn);
				
				item.todo.push(drawItem);
			}, true);
		
		var playItem = new Item([drawTk], [], "play", turn);
		
		game.todo.push(playItem);
		game.action++;
		game.buy++;
		game.coin++;
	}
}

function militiaAction(player, game) {
	if (player && game) {
		game.coin += 2;
		
		var attacker = player.seat;
		var len = game.players.length;
		for (let i = 1; i < len; i++) {
			let toAttack = {};
			let index = (attacker + i) % len;
			toAttack[index] = game.players[index];
			
			var attackTask = new Task(attacker,
				function(item) {
					var attacked = toAttack[index];
					if (attacked && attacked.hand.length > 3) {
						item.todo.push(militiaAttack(attacked));
					}
				}, true);
			
			var attackItem = new Item([attackTask], [], "attack", attacker);
			attackItem.targets = toAttack;
			
			game.todo.push(attackItem);
		}
	}
}

function militiaAttack(player) {
	var turn = player.seat;
	var selected = [];
	
	var discardTk = discardTask(player, selected);
	
	return selectItem([discardTk], [], "discard", turn,
		function() {
			return player.hand.length < 4;
		},
		function(cards, index, sel) {
			if (cards === player.hand && index in cards) {
				var card = cards[index];
				if (player.hand.length - sel.length > 3 ||
					sel.indexOf(card) !== -1) {
					return card;
				}
			}
			
			return null;
		},
		{
			Discard: function() {
				if (player.hand.length - selected.length === 3) {
					this.resolvable = true;
					return true;
				}
				return false;
			}
		},
		selected);
}

function moatAction(player, game) {
	if (player) {
		var turn = player.seat;
		
		var drawTk = new Task(turn,
			function(item) {
				var draw = drawTask(player, 2);
				var drawItem = new Item([draw], [], "draw", turn);
				
				item.todo.push(drawItem);
			}, true);
		
		var playItem = new Item([drawTk], [], "play", turn);
		
		game.todo.push(playItem);
	}
}

function moatReaction(player, item) {
	if (item && player) {
		var targets = item.targets;
		var index = player.seat;
		if (targets && targets[index]) {
			delete targets[index];
		}
	}
}

function moatReact(player, item) {
	if (item) {
		var type = item.type;
		var state = item.state;
		var targets = item.targets;
		var index = player.seat
		
		return type === "attack" && state === "PRE" && targets && index in targets;
	}
	return false;
}

function mineAction(player, game) {
	if (player && game) {
		
		var turn = player.seat;
		var selected = [];
		var gained = [];
		
		var trashTask = new Task(turn,
			function(item) {
				if (selected.length === 1) {
					var trashIt = trashItem(player, game, selected);
					
					item.todo.push(trashIt);
				}
			}, true);
		var gainTask = new Task(turn,
			function(item) {
				if (selected.length === 1) {
					var oldCard = selected[0];
					
					item.todo.push(gainItem(player, game,
						function() {
							return Object.keys(game.pilesWork).filter(function(name) {
								var pile = game.pilesWork[name];
								if (pile.length > 0) {
									var newCard = pile[0];
									return 'treasure' in newCard.types &&
										   newCard.coin <= oldCard.coin + 3;
								}
								return false;
							}).length === 0;
						},
						function(cards, index, gn) {
							var piles = game.pilesWork;
							if (cards in piles && index in piles[cards]) {
								var newCard = piles[cards][index];
								if (('treasure' in newCard.types &&
									newCard.coin <= oldCard.coin + 3 &&
									gn.length < 1) ||
									gn.indexOf(newCard) !== -1) {
									return newCard;
								}
							}
							
							return null;
						}, gained, player.hand));
				}
			}, true);
		
		var playItem = selectItem([trashTask, gainTask], [], "play", turn,
			function() {
				return player.hand.filter(function(card) {
					return 'treasure' in card.types;
				}) < 1;
			},
			function(cards, index, sel) {
				if (cards === player.hand && index in cards) {
					var card = cards[index];
					if ((sel.length < 1 &&
						'treasure' in card.types) ||
						sel.indexOf(card) !== -1) {
						return card;
					}
				}
				
				return null;
			},
			{
				Trash: function() {
					this.resolvable = true;
					return true;
				}
			},
			selected);
		
		game.todo.push(playItem);
	}
}

function remodelAction(player, game) {
	if (player && game) {

		var turn = player.seat;
		var selected = [];
		var gained = [];
		
		var trashTask = new Task(turn,
			function(item) {
				if (selected.length === 1) {
					var trashIt = trashItem(player, game, selected);
					
					item.todo.push(trashIt);
				}
			}, true);
		var gainTask = new Task(turn,
			function(item) {
				if (selected.length === 1) {
					var oldCard = selected[0];
					
					item.todo.push(gainItem(player, game,
						function() {
							return Object.keys(game.pilesWork).filter(function(name) {
								var pile = game.pilesWork[name];
								if (pile.length > 0) {
									var newCard = pile[0];
									return newCard.coin <= oldCard.coin + 2;
								}
								return false;
							}).length === 0;
						},
						function(cards, index, gn) {
							var piles = game.pilesWork;
							if (cards in piles && index in piles[cards]) {
								var newCard = piles[cards][index];
								if ((newCard.coin <= oldCard.coin + 2 &&
									gn.length < 1) ||
									gn.indexOf(newCard) !== -1) {
									return newCard;
								}
							}
							
							return null;
						}, gained, player.discard));
				}
			}, true);
		
		var playItem = selectItem([trashTask, gainTask], [], "play", turn,
			function() {
				return player.hand.length < 1;
			},
			function(cards, index, sel) {
				if (cards === player.hand && index in cards) {
					var card = cards[index];
					if (sel.length < 1 ||
						sel.indexOf(card) !== -1) {
						return card;
					}
				}
				
				return null;
			},
			{
				Trash: function() {
					if (selected.length === 1) {
						this.resolvable = true;
						return true;
					}
					
					return false;
				}
			},
			selected);
		
		game.todo.push(playItem);
	}
}

function smithyAction(player, game) {
	if (player) {
		var turn = player.seat;
		
		var drawTk = new Task(turn,
			function(item) {
				var draw = drawTask(player, 3);
				var drawItem = new Item([draw], [], "draw", turn);
				
				item.todo.push(drawItem);
			}, true);
		
		var playItem = new Item([drawTk], [], "play", turn);
		
		game.todo.push(playItem);
	}
}

function villageAction(player, game) {
	if (player) {
		var turn = player.seat;
		
		var drawTk = new Task(turn,
			function(item) {
				var draw = drawTask(player, 1);
				var drawItem = new Item([draw], [], "draw", turn);
				
				item.todo.push(drawItem);
			}, true);
		
		var playItem = new Item([drawTk], [], "play", turn);
		
		game.todo.push(playItem);
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
		
		var turn = player.seat;
		var selected = [];					
		
		var gainIt = gainItem(player, game,
			function() {
				return getWorkshopPiles(game.pilesWork).length === 0;
			},
			function(cards, index, sel) {
				var piles = game.pilesWork;
				if (cards in piles && index in piles[cards]) {
					var card = piles[cards][index];
					if ((card.coin <= 4 &&
						sel.length < 1) ||
						sel.indexOf(card) !== -1) {
						return card;
					}
				}
				
				return null;
			}, selected, player.discard);
			
		var gainTask = new Task(turn,
			function(item) {
				if (getWorkshopPiles(game.pilesWork).length > 0) {
					item.todo.push(gainIt);
				}
			}, true);
		
		var playItem = new Item([gainTask], [], "play", turn);
		
		game.todo.push(playItem);
	}
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