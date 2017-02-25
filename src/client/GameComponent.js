import React from 'react';
import ReactDOM from 'react-dom';
import injectTapEventPlugin from 'react-tap-event-plugin';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import MenuComponent from './MenuComponent';

injectTapEventPlugin();

class GameComponent extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			name: ""
		};
		
		this._init = this._init.bind(this);
		this._updateName = this._updateName.bind(this);
		this._handleSetName = this._handleSetName.bind(this);
	}
	
	componentDidMount() {
		this.socket = io();
		this.socket.on('_init', this._init);
		this.socket.on('_updateName', this._updateName);
	}
	
	_init(name) {
		this.setState({
			name: name
		});
	}
	
	_updateName(name) {
		this.setState({
			name: name
		});
	}
	
	_handleSetName(newName) {
		this.socket.emit('_setName', newName);
	}
	
  render() {
    return (
			<MuiThemeProvider>
				<MenuComponent name={this.state.name} setName={this._handleSetName} />
			</MuiThemeProvider>
		)
  }
}
 
ReactDOM.render(<GameComponent />, document.getElementById('root'));

if (module.hot) {
	module.hot.accept();
}