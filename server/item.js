function Item(main, trigger, type, origin) {
	this.main = main;
	this.trigger = trigger;
	
	this.state = "PRE";
	this.react = [];
	this.todo = [];
	this.type = type;
	this.origin = origin;
}

Item.prototype.getItem = function() {
	switch (this.state) {
		case "PRE":
			return this.react.length ? this.react[0] : null;
		case "MAIN":
			return this.main.length ? this.main[0] : null;
		case "POST":
			return this.react.length ? this.react[0] :
				  (this.trigger.length ? this.trigger[0] : null);
		default:
			return null;
	}
};

module.exports = Item;