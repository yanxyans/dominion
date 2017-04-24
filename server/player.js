function Player(user, spot) {
	this.id = user.id;
	this.name = user.name;
	this.socket = user.socket;
	this.spot = spot;
	this.seated = true;
}

module.exports = Player;