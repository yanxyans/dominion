import React from 'react';

import BoardComponent from './BoardComponent';
import PlayerComponent from './PlayerComponent';
import ControlComponent from './ControlComponent';

import FullWidthSection from './FullWidthSection';
import Paper from 'material-ui/Paper';

import IconButton from 'material-ui/IconButton';
import FontIcon from 'material-ui/FontIcon';

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
    
    _openGithub = () => {
        window.open("https://github.com/yanxyans/dominion");
    }
    
    openOrigin = () => {
        window.open("https://dominion.games");
    }
    
    openWiki = () => {
        window.open("http://wiki.dominionstrategy.com/index.php/Main_Page");
    }
    
    render() {
        var players = this.props.gameState === "END" ? this.props.players.filter(function(player) {
            return player.counted;
        }).sort(function(a, b) {
            return b.points - a.points;
        }).concat(this.props.players.filter(function(player) {
        return !player.counted; }))        : this.props.players;
        
        return (
            <FullWidthSection id='game'>

                <Paper id='players' zDepth={2}>
                    <h1> players </h1>
                    {players.map(function(player, index) {
                        var slot = player.seat;
                        var raised = index % 2 === 0;
                        return <PlayerComponent key={index}
                                                player={player}
                                                _reconRoom={this.props._reconRoom.bind(null, slot)}
                                                _sendControl={this.props._sendControl}
                                                _tapCard={this.props._tapCard}
                                                _handleMouseOver={this._handleMouseOver}
                                                _handleMouseOut={this._handleMouseOut}
                                                _toggleHelp={this._toggleHelp}
                                                raised={raised}
                                                gameState={this.props.gameState}
                                                index={index}/>;
                    }, this)}
                </Paper>
                                {this.props.gameState !== "INIT" && <BoardComponent piles={this.props.piles}
                                trash={this.props.trash}
                                _tapCard={this.props._tapCard}
                                _handleMouseOver={this._handleMouseOver}
                _handleMouseOut={this._handleMouseOut}/>}
                <Paper id='info' zDepth={2}>
                    <h1> dominion </h1>
                    <div id='help'>
                    {!this.props.help && <FontIcon className="muidocs-icon-custom-github" onTouchTap={this._openGithub} title="source" style={{cursor:'pointer', fontSize: '48px'}}/>}
                    {!this.props.help && <FontIcon className="material-icons" onTouchTap={this.openOrigin} title="official game" style={{cursor:'pointer', fontSize: '48px'}}>public</FontIcon>}
                    {!this.props.help && <FontIcon className="material-icons" onTouchTap={this.openWiki} title="wiki" style={{cursor:'pointer', fontSize: '48px'}}>help</FontIcon>}
                    {!this.props.help && <a href="mailto:fssyan@gmail.com"><FontIcon className="material-icons" title="contact" style={{cursor:'pointer', fontSize: '48px'}}>mail</FontIcon></a>}
                    
                    {this.state.card && this.props.help && <img src={'/asset/cards/' + this.state.card + '.jpg'}/>}

                    </div>
                    
                </Paper>
            </FullWidthSection>
        );
    }
}