import React from 'react';
import ReactDOM from 'react-dom';
 
class Game extends React.Component {
  render() {
    return <h1>Game goes here</h1>
  }
}
 
ReactDOM.render(<Game />, document.getElementById('root'));

if (module.hot) {
	module.hot.accept();
}