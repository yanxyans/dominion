import React from 'react';

import PlayerComponent from './PlayerComponent';

import Paper from 'material-ui/Paper';

export default class PlayersComponent extends React.Component {
    render() {
        var players = this.props.players;
        var gameState = this.props.gameState;
        var sortedPlayers = gameState !== 'END' ?
            players :
            players.filter(function(player) {
                return player.counted;
            }).sort(function(playerA, playerB) {
                return playerB.points - playerA.points;
            }).concat(players.filter(function(player) {
                return !player.counted;
            }));
            
        return (
            <Paper id='players' zDepth={2}>
                <Paper className='title' zDepth={1}>
                    <h1> players </h1>
                </Paper>
                
                <div className='content'>
                    {sortedPlayers.map(function(player, index) {
                        player.turn = player.turn || gameState !== 'MAIN';
                        return <PlayerComponent key={index}
                                                player={player}
                                                hasContent={gameState === 'MAIN' ||
                                                           (gameState === 'END' &&
                                                            player.counted)}
                                                _reconRoom={this._reconRoom.bind(null, player.seat)}
                                                _sendControl={this._sendControl}
                                                _tapCard={this._tapCard}
                                                _handleMouseOver={this._handleMouseOver}
                                                _handleMouseOut={this._handleMouseOut}/>;
                    }, this.props)}
                </div>
            </Paper>
        );
    }
}