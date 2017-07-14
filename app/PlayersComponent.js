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
        var sortedPlayers = players.sort(function(playerA, playerB) {
            return playerA.rank - playerB.rank;
        });
            
        return (
            <Paper id='players' zDepth={2}>
                <Toolbar style={styles.appBar}>
                    <ToolbarGroup>
                        <ToolbarTitle text='players' style={{color:white}}/>
                    </ToolbarGroup>
                </Toolbar>
                
                <div className='content'>
                    {sortedPlayers.map(function(player, index) {
                        player.turn = player.isTurn;
                        return <PlayerComponent key={index}
                                                player={player}
                                                hasContent={player.rank}
                                                _reconRoom={this._reconRoom.bind(null, player.slot)}
                                                _sendControl={this._sendControl}
                                                _tapCard={this._tapCard}
                                                help={this.help}/>;
                    }, this.props)}
                </div>
            </Paper>
        );
    }
}