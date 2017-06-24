function Task(turn, resolve, resolvable, valid, view, apply, controls) {
	this.turn = turn;
	
	this.resolve = resolve;
	this.resolvable = resolvable;
	this.valid = valid;
	
	this.view = view;
	this.apply = apply;
	
	this.controls = controls ? Object.keys(controls) : [];
	
	this.controls.forEach(function(control) {
		this[control] = controls[control];
	}, this);
}

module.exports = Task;