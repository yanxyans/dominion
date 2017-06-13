function Item(main, trigger, type, origin) {
	this.main = main;
	this.trigger = trigger;
	
	this.state = "PRE";
	this.react = [];
	this.todo = [];
	this.type = type;
	this.origin = origin;
}

Item.prototype.turn = function() {
	var latest = this.getLatest();
	return latest && latest.turn ? latest.turn() : null;
};

Item.prototype.view = function(ret) {
	var latest = this.getLatest();
	
	if (latest && latest.view) {
		latest.view(ret);
	}
};

Item.prototype.apply = function(cards, index) {
	var latest = this.getLatest();
	
	if (latest && latest.apply) {
		latest.apply(cards, index);
	}
};

Item.prototype.cont = function(cntrl) {
	var latest = this.getLatest();
	
	if (latest && latest.cont) {
		return latest.cont(cntrl);
	}
	return false;
};

Item.prototype.getLatest = function() {
	switch (this.state) {
		case "PRE":
			return this.react.length ? this.react[0] : null;
		case "MAIN":
			return this.main.length ? this.main[0] : null;
		case "POST":
			return this.react.length ? this.react[0] : (this.trigger.length ? this.trigger[0] : null);
		default:
			return null;
	}
};

module.exports = Item;