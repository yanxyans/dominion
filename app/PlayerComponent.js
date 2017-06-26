import React from 'react';

import Stack from './Stack';
import ControlComponent from './ControlComponent';
import Paper from 'material-ui/Paper';

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
        return (
            <Paper id='player'>
                <div onTouchTap={_reconRoom}>
                    name:{player.name}
                </div>
                
                <div>
                    points:{player.points} deck:{player.deck}
                </div>
                
                {'action' in player && 'buy' in player && 'coin' in player &&
                <div>
                    action:{player.action} buy:{player.buy} coin:{player.coin}
                </div>}
                
                {player.control &&
                <div>
                    <ControlComponent control={player.control}
                                      phase={phase}
                                      _sendControl={_sendControl}/>
                </div>}
                
                discard
                <Stack data={player.discard}
                       _tapCard={_tapCard.bind(null, source.slice().concat('discard'))}
                       open={true}/>
                       
                hand
                <Stack data={player.hand}
                       _tapCard={_tapCard.bind(null, source.slice().concat('hand'))}
                       open={true}/>
                       
                play
                <Stack data={player.play}
                       _tapCard={_tapCard.bind(null, source.slice().concat('play'))}
                       open={true}/>
                       
            </Paper>
        );
    }
}