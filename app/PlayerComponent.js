import React from 'react';

import ControlComponent from './ControlComponent';
import Stack from './Stack';

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

const styles = {
    active: {
        transition: '.3s'
    },
    inactive: {
        opacity: '0.35',
        transition: '.3s'
    }
}

export default class PlayerComponent extends React.Component {
    
    render() {
        var player = this.props.player;
        var source = ['players', player.seat];
        
        var visible = player.visible;
        
        var tap = this.props._tapCard;
        var over = this.props._handleMouseOver;
        var out = this.props._handleMouseOut;

        return (
            <div className='player'
                 style={player.turn ? styles.active : styles.inactive}>
                <Paper className='title' zDepth={2}>
                    <div className='buttons'>
                        <IconButton tooltip={player.name}
                                    style={{zIndex:1000}}
                                    onTouchTap={this.props._reconRoom}>
                            {player.disc ?
                                <IconDisconnect/> :
                                <IconName color={visible ? yellowA700 : null}/>}
                        </IconButton>
                        
                        {player.index !== undefined &&
                        <IconButton tooltip={player.points + ' points(s)'}
                                    style={{zIndex:1000}}>
                            {player.index === 0 && <IconOne/>}
                            {player.index === 1 && <IconTwo/>}
                            {player.index === 2 && <IconThree/>}
                            {player.index === 3 && <IconFour/>}
                        </IconButton>}
                        
                        {player.action !== undefined &&
                        <IconButton tooltip={player.action + ' action(s)'}
                                    style={{zIndex:1000}}>
                            <IconAction/>
                        </IconButton>}
                        {player.buy !== undefined &&
                        <IconButton tooltip={player.buy + ' action(s)'}
                                    style={{zIndex:1000}}>
                            <IconBuy/>
                        </IconButton>}
                        {player.coin !== undefined &&
                        <IconButton tooltip={player.coin + ' action(s)'}
                                    style={{zIndex:1000}}>
                            <IconCoin/>
                        </IconButton>}
                    </div>
                    
                    {player.control &&
                    <ControlComponent control={player.control}
                                      phase={player.main ? player.phase - 1 : null}
                                      visible={visible}
                                      _sendControl={this.props._sendControl}/>}
                </Paper>
                
                <Paper className='content' zDepth={1}>
                    <Stack data={player.discard}
                           tooltip='discard'
                           _tapCard={tap.bind(null, source.concat('discard'))}
                           open={false}
                           _handleMouseOver={over}
                           _handleMouseOut={out}/>
                    <Stack data={player.play}
                           tooltip='play'
                           _tapCard={tap.bind(null, source.concat('play'))}
                           open={true}
                           _handleMouseOver={over}
                           _handleMouseOut={out}/>

                    <Stack data={player.deck}
                           tooltip='deck'
                           _tapCard={tap.bind(null, source.concat('deck'))}
                           open={false}
                           _handleMouseOver={over}
                           _handleMouseOut={out}/>
                    <Stack data={player.hand}
                           tooltip='hand'
                           _tapCard={tap.bind(null, source.concat('hand'))}
                           open={true}
                           _handleMouseOver={over}
                           _handleMouseOut={out}/>
                </Paper>
            </div>
        );
    }
}