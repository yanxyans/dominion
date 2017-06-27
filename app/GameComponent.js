import React from 'react';

import BoardComponent from './BoardComponent';
import PlayerComponent from './PlayerComponent';
import ControlComponent from './ControlComponent';

import FullWidthSection from './FullWidthSection';
import Paper from 'material-ui/Paper';
export default class GameComponent extends React.Component {
    state = {
        card: null
    }
    
    _handleMouseOver = (card) => {
        this.setState({card: card});
    }
    
    _handleMouseOut = () => {
        this.setState({card: null});
    }
    
    _toggleHelp = () => {
        this.setState({help: !this.state.help});
    }
    
    render() {
        return (
            <FullWidthSection id='game'>
                <BoardComponent piles={this.props.piles}
                                trash={this.props.trash}
                                _tapCard={this.props._tapCard}
                                _handleMouseOver={this._handleMouseOver}
                                _handleMouseOut={this._handleMouseOut}/>
                <Paper id='players' zDepth={1}>
                    <h1> players </h1>
                    {this.props.players.map(function(player, index) {
                        var slot = player.seat;
                        var raised = index % 2 === 0;
                        console.log(raised);
                        return <PlayerComponent key={index}
                                                player={player}
                                                _reconRoom={this.props._reconRoom.bind(null, slot)}
                                                _sendControl={this.props._sendControl}
                                                _tapCard={this.props._tapCard}
                                                _handleMouseOver={this._handleMouseOver}
                                                _handleMouseOut={this._handleMouseOut}
                                                _toggleHelp={this._toggleHelp}
                                                raised={raised}/>;
                    }, this)}
                </Paper>
                <Paper id='info' zDepth={2}>
                    {!this.props.help && <h1> dominion </h1>}
                    {!this.props.help && <h2> made for learning purposes </h2>}
                    {!this.props.help && <h3> <a href="https://dominion.games/"> official version </a> </h3>}
                    {!this.props.help && <h3> <a href="http://wiki.dominionstrategy.com/index.php/Main_Page"> wiki page </a> </h3>}
                    {!this.props.help && <h3> <a href="mailto:fssyan@gmail.com"> contact </a> </h3>}
                    
                    {this.state.card && this.props.help && <div><img src={'/asset/cards/' + this.state.card + '.jpg'}/></div>}
                    
                </Paper>
            </FullWidthSection>
        );
    }
}