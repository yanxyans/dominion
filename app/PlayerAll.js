import React from 'react';

import Paper from 'material-ui/Paper';
import AppBar from 'material-ui/AppBar';
import { red700, blue700, green700, yellow700 } from 'material-ui/styles/colors';

import IconButton from 'material-ui/IconButton';
import IconEmpty from 'material-ui/svg-icons/toggle/star-border';
import IconHalf from 'material-ui/svg-icons/toggle/star-half';
import IconFull from 'material-ui/svg-icons/toggle/star';

import Player from './Player';

const colors = [red700, blue700, green700, yellow700];

export default class PlayerAll extends React.Component {
    state = {
        view: 1
    }
    
    _toggle = () => {
        this.setState({view: (this.state.view + 1) % 3});
    }
    
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
        
        var view = this.state.view;
        return (
            <Paper id='players' zDepth={2}>
                <AppBar title='players'
                        showMenuIconButton={false}
                        iconElementRight={
                            (view === 0 &&
                            <IconButton tooltip='min'><IconEmpty/></IconButton>) ||
                            (view === 1 &&
                            <IconButton tooltip='default'><IconHalf/></IconButton>) ||
                            (view === 2 &&
                            <IconButton tooltip='full'><IconFull/></IconButton>)}
                        onRightIconButtonTouchTap={this._toggle}
                        style={{zIndex:998}}/>
                
                <div className='content'>
                    {players.map(function(player, index) {
                        return <Player key={index}
                                       player={player}
                                       tooltip={this.tooltip}
                                       _complete={this._complete}
                                       _tap={this._tap}
                                       _recon={this._recon.bind(null, player.slot)}
                                       color={colors[player.slot]}
                                       hideContent={view === 0 && !player.isPlayer}
                                       allCards={view === 2}/>;
                    }, this.props)}
                </div>
            </Paper>
        );
    }
}