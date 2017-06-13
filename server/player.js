var shuffle = require('./util').shuffle;
var findOne = require('./util').findOne;

var ACTION_PHASE = 1;
var BUY_PHASE = 2;
var ACTION_PLAY = 'action';
var TREASURE_PLAY = 'treasure';

function Player(user) {
	this.id = user.id;
	this.name = user.name;
	
	// game variables
	
	// card storage
	this.deck = [];
	this.discard = [];
	this.hand = [];
	this.play = [];
	this.aside = [];
	
	// resource storage
	this.action = 0;
	this.buy = 0;
	this.coin = 0;
	
	// action storage
	this.todo = [];
	
	// start in standby phase
	this.phase = 0;
	
	// used for state management, set at game start
	this.seat = -1;
	this.next = -1;
	
	// buy status
	this.bought = false;
}

Player.prototype.retrievePlayerState = function(id) {
	var visible = id === this.id;
	return {
		name: this.name,
		deck: this.deck.length,
		discard: visible ?
			this.discard.map(this.getCardName.bind(null, true)) :
			this.discard.slice(this.discard.length - 1).map(this.getCardName.bind(null, true)),
		hand: this.hand.map(this.getCardName.bind(null, visible)),
		play: this.play.map(this.getCardName.bind(null, true)),
		aside: this.aside.map(this.getCardName.bind(null, true)),
		action: this.action,
		buy: this.buy,
		coin: this.coin,
		phase: this.phase,
		seat: this.seat
	};
};

Player.prototype.getCardName = function(visible, card) {
	return visible && card ? card.name : "";
};

Player.prototype.init = function() {
	this.emptyCards();
	this.emptyResources();
	
	this.todo = [];
	
	this.phase = 0;
	
	this.bought = false;
	this.points = 0;
};

Player.prototype.emptyCards = function() {
	this.deck = [];
	this.discard = [];
	this.hand = [];
	this.play = [];
	this.aside = [];
};

Player.prototype.emptyResources = function() {
	this.action = 0;
	this.buy = 0;
	this.coin = 0;
};

Player.prototype.start = function() {
	this.action = 1;
	this.buy = 1;
	this.coin = 0;
	
	// action phase
	this.phase = 1;
	
	// set buy status
	this.bought = false;
};

Player.prototype.draw = function(amt) {
	var deck_amt = this.deck.length;
	var draw_amt = Math.min(amt, deck_amt);
	
	for (var i = 0; i < draw_amt; i++) {
		this.hand.push(this.deck.pop());
	}
	
	if (draw_amt < amt && this.discard.length) {
		shuffle(this.discard);
		// place shuffled cards on top of deck
		[this.deck, this.discard] = [this.discard, this.deck];
		this.draw(amt - draw_amt);
	}
};

Player.prototype.cleanUp = function() {
	this.emptyResources();
	this.moveCards(this.hand, this.discard, this.hand.length);
	this.moveCards(this.play, this.discard, this.play.length);
	
	// standby phase
	this.phase = 0;
};

Player.prototype.moveCards = function(src, dest, amt) {
	if (src && dest && src.length >= amt) {
		for (var i = 0; i < amt; i++) {
			dest.push(src.pop());
		}
	}
};

Player.prototype.tryPlay = function(card) {
	if (card) {
		if (this.phase === ACTION_PHASE &&
		    ACTION_PLAY in card.types &&
			this.action) {
			this.action--;
			return ACTION_PLAY;
		} else if (this.phase === BUY_PHASE &&
		           TREASURE_PLAY in card.types &&
				   !this.bought) {
			return TREASURE_PLAY;
		}
	}
	return null;
};

Player.prototype.tryPay = function(card) {
	if (this.phase === BUY_PHASE &&
	    card &&
	    card.coin <= this.coin &&
		this.buy) {
		this.coin -= card.coin;
		this.buy--;

		if (!this.bought) {
			this.bought = true;
		}
		return true;
	}
	return false;
};

Player.prototype.canReact = function(item) {
	var len = this.hand.length;
	for (var i = 0; i < len; i++) {
		var card = this.hand[i];
		if (card.canReact && card.canReact(this, item)) {
			return true;
		}
	}
	
	return false;
};

Player.prototype.countScore = function() {
	
	this.getScoreIn(this.hand);
	this.getScoreIn(this.play);
	this.getScoreIn(this.deck);
	this.getScoreIn(this.discard);

	return {
		name: this.name,
		score: this.points
	};
};

Player.prototype.getScoreIn = function(stack) {
	for (var i = 0; i < stack.length; i++) {
		var card = stack[i];
		if ('victory' in card.types) {
			card.types.victory(this);
		} else if ('curse' in card.types) {
			card.types.curse(this);
		}
	}
};

module.exports = Player;