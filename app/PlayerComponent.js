import React from 'react';

import Stack from './Stack';
import ControlComponent from './ControlComponent';

import Paper from 'material-ui/Paper';

import IconButton from 'material-ui/IconButton';
import IconName from 'material-ui/svg-icons/action/face';
import IconDisconnect from 'material-ui/svg-icons/alert/warning';
import IconPoints from 'material-ui/svg-icons/action/grade'
import IconAction from 'material-ui/svg-icons/editor/format-shapes';
import IconBuy from 'material-ui/svg-icons/editor/format-bold';
import IconCoin from 'material-ui/svg-icons/action/copyright';

import IconOne from 'material-ui/svg-icons/image/looks-one';
import IconTwo from 'material-ui/svg-icons/image/looks-two';
import IconThree from 'material-ui/svg-icons/image/looks-3';
import IconFour from 'material-ui/svg-icons/image/looks-4';

import { yellowA700 } from 'material-ui/styles/colors';

export default class PlayerComponent extends React.Component {
    
    render() {
        var player = this.props.player;
        var source = ['players', player.seat];
        
        var _reconRoom = this.props._reconRoom;
        var _sendControl = this.props._sendControl;
        var _tapCard = this.props._tapCard;
        
        var phase = player.control && 
                    player.control.length === 3 &&
                    player.control[0] === "Action" &&
                    player.control[1] === "Buy" &&
                    player.control[2] === "Cleanup" ?
                        player.phase - 1 : null;
        var visible = player.visible;
        var disc = player.disc;
        var turn = player.turn;
        
        var isPlayer = visible ? yellowA700 : null;
        var isTurn = turn || this.props.gameState === "INIT" || this.props.gameState === "END" ? {transition: '.3s'} : {opacity: '0.35', transition: '.3s'};

        return (
            <Paper id='player' style={isTurn} zDepth={turn ? 2 : 0}>
                <Paper id='detail' zDepth={2}>
                    <div>
                    <IconButton tooltip={player.name}
                                style={{zIndex:1001}}
                                onTouchTap={_reconRoom}>
                        {disc ? <IconDisconnect/> : <IconName color={isPlayer}/>}
                    </IconButton>
                    {this.props.gameState === "END" && player.counted && <IconButton tooltip={player.points + ' point(s)'}
                                style={{zIndex:1001}}>
                                    {this.props.index === 0 ? <IconOne /> : null}
                                        {this.props.index === 1 ? <IconTwo /> : null}
                                            {this.props.index === 2 ? <IconThree /> : null}
                                                {this.props.index === 3 ? <IconFour /> : null}
                    </IconButton>}
                    
                    {'action' in player &&
                    <IconButton tooltip={player.action + ' action(s)'}
                                style={{zIndex:1000}}>
                        <IconAction/>
                    </IconButton>}
                    {'buy' in player &&
                    <IconButton tooltip={player.buy + ' buy(s)'}
                                style={{zIndex:1000}}>
                        <IconBuy/>
                    </IconButton>}
                    {'coin' in player &&
                    <IconButton tooltip={player.coin + ' coin(s)'}
                                style={{zIndex:1000}}>
                        <IconCoin/>
                    </IconButton>}
                    </div>
                    
                    <div>
                    {player.control &&
                    <ControlComponent control={player.control}
                                      phase={phase}
                                      _sendControl={_sendControl}
                                      visible={visible}/>}
                    </div>
                </Paper>
                
                <div id='detail2'>
                    <div id='mat'>
                        <Stack data={player.discard}
                               tooltip='discard'
                               _tapCard={_tapCard.bind(null, source.slice().concat('discard'))}
                               open={false}
                               _handleMouseOver={this.props._handleMouseOver}
                               _handleMouseOut={this.props._handleMouseOut}/>
                        <Stack data={player.play}
                               tooltip='play'
                               _tapCard={_tapCard.bind(null, source.slice().concat('play'))}
                               open={true}
                               _handleMouseOver={this.props._handleMouseOver}
                               _handleMouseOut={this.props._handleMouseOut}/>
                        
                    </div>
                    
                    <div id='mat'>
                        <Stack data={player.deck}
                               tooltip='deck'
                               _tapCard={_tapCard.bind(null, source.slice().concat('deck'))}
                               open={false}
                               _handleMouseOver={this.props._handleMouseOver}
                               _handleMouseOut={this.props._handleMouseOut}/>
                        <Stack data={player.hand}
                               tooltip='hand'
                               _tapCard={_tapCard.bind(null, source.slice().concat('hand'))}
                               open={true}
                               _handleMouseOver={this.props._handleMouseOver}
                               _handleMouseOut={this.props._handleMouseOut}/>
                    </div>
                </div>
                       
            </Paper>
        );
    }
}