function Task(turn, resolve, valid, resolvable, view, apply, controls) {
	this.turn = turn;
	
	this.resolve = resolve;
	this.valid = valid;
	this.resolvable = resolvable;
	
	this.view = view;
	this.apply = apply;
	
	this.controls = controls ? Object.keys(controls) : [];
	
	this.controls.forEach(function(control) {
		this[control] = controls[control];
	}, this);
}

module.exports = Task;