var shuffle = require('./util').shuffle;

function Player(user, spot) {
	this.id = user.id;
	this.name = user.name;
	this.socket = user.socket;
	this.spot = spot;
	this.seated = true;
	
	// game resources
	this.deck = [];
	this.discard = [];
	this.hand = [];
	this.inPlay = [];
	this.resource = {
		action: 0,
		buy: 0,
		coin: 0,
		potion: 0
	};
	this.todo = [];
	this.attack = null;
	this.reaction = [];
	
	this.phase = 0;
	this.next = -1;
}

Player.prototype.gain = function(src, dest, card, amt) {
	if (dest === 'deck' ||
			dest === 'discard' ||
			dest === 'hand' ||
			dest === 'inPlay') {
		var pile_amt = src[card].length;
		var gain_amt = Math.min(amt, pile_amt);
		
		for (var i = 0; i < gain_amt; i++) {
			this[dest].push(src[card].pop());
		}
	}
};

Player.prototype.draw = function(amt) {
	var deck_amt = this.deck.length;
	var draw_amt = Math.min(amt, deck_amt);
	
	for (var i = 0; i < draw_amt; i++) {
		var handCard = this.deck.pop();
		if (handCard.types.includes('reaction')) {
			this.reaction.push(handCard);
		}
		this.hand.push(handCard);
	}
	
	if (draw_amt < amt && this.discard.length) {
		shuffle(this.discard);
		// place shuffled cards on top of deck
		[this.deck, this.discard] = [this.discard, this.deck];
		this.draw(amt - draw_amt);
	}
};

Player.prototype.nextPlayer = function(game) {
	game.turn = this.next;
};

module.exports = Player;