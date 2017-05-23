var COPPER_VALUE = 1;
var SILVER_VALUE = 2;
var GOLD_VALUE = 3;
var ESTATE_VALUE = 1;
var DUCHY_VALUE = 3;
var PROVINCE_VALUE = 6;
var CURSE_VALUE = 1;

function incPlayerCoin(value) {
	return function(player) {
		if (player) {
			player.coin += value;
		}
	};
}

function incPlayerPoints(points) {
	return function(player) {
		if (player) {
			player.points += points;
		}
	};
}

function decPlayerPoints(points) {
	return function(player) {
		if (player) {
			player.points -= points;
		}
	};
}

function cellarAction(player) {
	if (player) {
		player.action++;
		
		var handSelected = [];
		player.todo.push({
			selected: {
				players: {
					[player.seat]: {
						hand: handSelected
					}
				}
			},
			apply: function(cards, index) {
				if (cards === player.hand) { // sourcing from player hand
				  if (index in cards) {
						var card = cards[index];
						var found = handSelected.indexOf(card);
						if (found === -1) {
							// select
							handSelected.push(card);
						} else {
							// deselect
							handSelected.splice(found, 1);
						}
					}
				}
			},
			discard: function() {
				this.cntrl = [];
			},
			prep: function discard() {
				this.prepped = true;
			},
			resolve: function discard() {
				var len = handSelected.length;
				if (len) {
					for (var i = 0; i < len; i++) {
						var card = handSelected[i];
						var index = player.hand.indexOf(card);
						
						if (index !== -1) {
							// discard
							player.discard.push(player.hand.splice(index, 1)[0]);
						}
					}
					
					this.todo.push({
						prep: function draw() {
							this.amt = len;
							this.prepped = true;
						},
						resolve: function draw() {
							player.draw(this.amt);
							this.resolved = true;
						},
						prepped: false,
						resolved: false,
						cntrl: [],
						todo: []
					});
				}
				
				this.resolved = true;
			},
			prepped: false,
			resolved : false,
			cntrl: ['discard'],
			todo: []
		});
	}
}

function marketAction(player) {
	if (player) {
		player.draw(1);
		player.action++;
		player.buy++;
		player.coin++;
	}
}

function militiaAction(player, otherPlayers, piles, trash, turn) {
	if (player && otherPlayers) {
		player.coin += 2;
		
		var militiaAttack = this.attack;
		
		player.todo.push({
			prep: function attack() {
				this.players = otherPlayers;
				this.prepped = true;
			},
			resolve: function attack() {
				for (var i = 0; i < this.players.length; i++) {
					var p = this.players[i];
					if (militiaAttack(p)) {
						turn(p.seat);
					}
				}
				this.resolved = true;
			},
			prepped: false,
			resolved : false,
			cntrl: [],
			todo: []			
		});
	}
}

function militiaAttack(player) {
	if (player && player.hand.length > 3) {
		var handSelected = [];
		player.todo.unshift({
			selected: {
				players: {
					[player.seat]: {
						hand: handSelected
					}
				}
			},
			apply: function(cards, index) {
				if (cards === player.hand) { // sourcing from player hand
				  if (index in cards) {
						var card = cards[index];
						var found = handSelected.indexOf(card);
						if (found === -1 && player.hand.length > handSelected.length + 3) {
							// select
							handSelected.push(card);
						} else if (found !== -1) {
							// deselect
							handSelected.splice(found, 1);
						}
					}
				}
			},
			discard: function() {
				if (handSelected.length === player.hand.length - 3) {
					this.cntrl = [];
				}
			},
			prep: function attacked() {
				this.prepped = true;
			},
			resolve: function attacked() {
				var len = handSelected.length;
				for (var i = 0; i < len; i++) {
					var card = handSelected[i];
					var index = player.hand.indexOf(card);
					
					if (index !== -1) {
						// discard
						player.discard.push(player.hand.splice(index, 1)[0]);
					}
				}
				
				this.resolved = true;
			},
			prepped: false,
			resolved : false,
			cntrl: ['discard'],
			todo: []
		});
		
		return true;
	}
	
	return false;
}

function moatAction(player) {
	if (player) {
		player.draw(2);
	}
}

function moatReaction(player, ev) {
	if (player && ev && ev.players) {
		var index = ev.players.indexOf(player);
		if (index !== -1) {
			ev.players.splice(index, 1);
		}
	}
}

function mineAction(player, otherPlayers, piles, tr) {
	if (player) {

		var handSelected = [];
		player.todo.push({
			selected: {
				players: {
					[player.seat]: {
						hand: handSelected
					}
				}
			},
			apply: function(cards, index) {
				if (cards === player.hand) { // sourcing from player hand
				  if (index in cards) {
						var card = cards[index];
						var found = handSelected.indexOf(card);
						if (found === -1 && 'treasure' in card.types && !handSelected.length) {
							// select
							handSelected.push(card);
						} else if (found !== -1) {
							// deselect
							handSelected.splice(found, 1);
						}
					}
				}
			},
			trash: function() {
				this.cntrl = [];
			},
			prep: function trash() {
				this.prepped = true;
			},
			resolve: function trash() {
				
				var len = handSelected.length;
				if (len === 1) {
					var card = handSelected[0];
					
					// trash
					var index = player.hand.indexOf(card);
					if (index !== -1) {
						tr.push(player.hand.splice(index, 1)[0]);
						
						// gain event
						this.todo.push(gainEvent(piles, function(c) {
							return c && 'treasure' in c.types && c.coin <= card.coin + 3;
						}, function(pi) {
							return !Object.keys(pi).filter( function(pa) {
								return pi[pa].length && 'treasure' in pi[pa][0].types && pi[pa][0].coin <= card.coin + 3;
							}).length;
						},
							player,
							'hand'));
						
					}
				}
				
				this.resolved = true;
			},
			prepped: false,
			resolved : false,
			cntrl: ['trash'],
			todo: []
		});
	
	}
}

function gainEvent(piles, cond, res, player, dst) {
	var handSelected = [];
	var pil = null;
	var ind = -1;
	return {
		selected: {
			players: {
				[player.seat]: {
					hand: handSelected
				}
			}
		},
		apply: function(cards, index) {
			if (cards in piles) { // sourcing from piles
				var pile = piles[cards];
				if (index in pile) {
					var card = pile[index];
					var found = handSelected.indexOf(card);
					if (found === -1 && !handSelected.length && cond(card)) {
						// select
						handSelected.push(card);
						pil = pile;
						ind = index;
					} else if (found !== -1) {
						// deselect
						handSelected.splice(found, 1);
						pil = null;
						ind = -1;
					}
				}
			}
		},
		gain: function() {
			var len = handSelected.length;
			if (len) {
				var card = handSelected[0];
				pil.splice(ind, 1);
				player[dst].push(card);
				
				this.cntrl = [];
			} else {
				if (res(piles)) {
					this.cntrl = [];
				}
			}
		},
		prep: function gain() {
			this.prepped = true;
		},
		resolve: function discard() {
			this.resolved = true;
		},
		prepped: false,
		resolved : false,
		cntrl: ['gain'],
		todo: []
	};
}

function remodelAction(player, op, piles, tr) {
	if (player) {

		var handSelected = [];
		player.todo.push({
			selected: {
				players: {
					[player.seat]: {
						hand: handSelected
					}
				}
			},
			apply: function(cards, index) {
				if (cards === player.hand) { // sourcing from player hand
				  if (index in cards) {
						var card = cards[index];
						var found = handSelected.indexOf(card);
						if (found === -1 && !handSelected.length) {
							// select
							handSelected.push(card);
						} else if (found !== -1) {
							// deselect
							handSelected.splice(found, 1);
						}
					}
				}
			},
			trash: function() {
				if (handSelected.length || !player.hand.length) {
					this.cntrl = [];
				}
			},
			prep: function trash() {
				this.prepped = true;
			},
			resolve: function trash() {
				
				var len = handSelected.length;
				if (len === 1) {
					var card = handSelected[0];
					
					// trash
					var index = player.hand.indexOf(card);
					if (index !== -1) {
						tr.push(player.hand.splice(index, 1)[0]);
						
						// gain event
						this.todo.push(gainEvent(piles, function(c) {
							return c && c.coin <= card.coin + 2;
						}, function(pi) {
							return !Object.keys(pi).filter( function(pa) {
								return pi[pa].length && pi[pa][0].coin <= card.coin + 2;
							}).length;
						},
							player,
							'discard'));
						
					}
				}
				
				this.resolved = true;
			},
			prepped: false,
			resolved : false,
			cntrl: ['trash'],
			todo: []
		});
	
	}

}

function smithyAction(player) {
	if (player) {
		player.draw(3);
	}
}

function villageAction(player) {
	if (player) {
		player.draw(1);
		player.action += 2;
	}
}

function woodcutterAction(player) {
	if (player) {
		player.buy++;
		player.coin += 2;
	}
}

function workshopAction(player, op, piles) {
	if (player) {
		// gain event
		player.todo.push(gainEvent(piles, function(c) {
			return c && c.coin <= 4;
		}, function(pi) {
			return !Object.keys(pi).filter( function(pa) {
				return pi[pa].length && pi[pa][0].coin <= 4;
			}).length;
		},
			player,
			'discard'));
	}
}

function moatReact(player, src, ev) {
	if (player && ev && ev.prep && ev.players) {
		var a = player.hand === src;
		var b = ev.prep.name === 'attack';
		var c = !ev.resolved;
		var d = ev.players.indexOf(player) !== -1;
		return a && b && c && d;
		
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