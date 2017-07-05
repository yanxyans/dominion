import React from 'react';

import PlayerComponent from './PlayerComponent';

import Paper from 'material-ui/Paper';

import { amberA700, greenA700, white } from 'material-ui/styles/colors';

import {Toolbar, ToolbarGroup, ToolbarSeparator, ToolbarTitle} from 'material-ui/Toolbar';

const styles = {
    appBar: {
        backgroundColor: greenA700
    },
};

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
                <Toolbar style={styles.appBar}>
                    <ToolbarGroup>
                        <ToolbarTitle text="players" style={{color:white}}/>
                    </ToolbarGroup>
                </Toolbar>
                
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
                                                _handleMouseOut={this._handleMouseOut}
                                                help={this.help}/>;
                    }, this.props)}
                </div>
            </Paper>
        );
    }
}