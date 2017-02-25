function User(id) {
	this.id = id;
}

function isValidName(name) {
	return true;
}

User.prototype.setName = function(name) {
	if (isValidName(name)) {
		this.name = name;
		return true;
	}
	return false;
};

module.exports = User;