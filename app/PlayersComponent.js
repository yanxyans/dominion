import React from 'react';

import Paper from 'material-ui/Paper';
import AppBar from 'material-ui/AppBar';
import { redA700, indigoA700, tealA700, yellowA700 } from 'material-ui/styles/colors';
import PlayerComponent from './PlayerComponent';

const colors = [redA700, indigoA700, tealA700, yellowA700];

export default class PlayersComponent extends React.Component {
    render() {
        var players = this.props.players;
        var len = players.length;
        for (var i = 0; i < len; i++) {
            if (players[i].slot === -1) {
                players[i].slot = len - 1 - i;
            }
        }
        
        var index = players.findIndex(function(player) {
            return player.isPlayer;
        });
        if (index !== -1) {
            players = this.props.players.slice(index + 1).concat(
                this.props.players.slice(0, index)).concat(
                this.props.players.slice(index, index + 1));
        }
        
        players.sort(function(playerA, playerB) {
            return playerB.rank - playerA.rank;
        });
        return (
            <Paper id='players' zDepth={2}>
                <AppBar title='players'
                        showMenuIconButton={false}
                        style={{zIndex:998}}/>
                
                <div className='content'>
                    {players.map(function(player, index) {
                        return <PlayerComponent key={index}
                                                player={player}
                                                tooltip={this.tooltip}
                                                _complete={this._complete}
                                                _tap={this._tap}
                                                _recon={this._recon.bind(null, player.slot)}
                                                color={colors[player.slot]}/>;
                    }, this.props)}
                </div>
            </Paper>
        );
    }
}