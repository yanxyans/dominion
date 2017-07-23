import React from 'react';
import RaisedButton from 'material-ui/RaisedButton';

const audio = new Audio('/asset/notif.mp3');

export default class Control extends React.Component {
    
    componentDidMount() {
        var player = this.props.player;
        var peek = player.control[0];
        if (player.isPlayer &&
            peek !== 'Start' &&
            peek !== 'Restart') {
            audio.play();
        }
    }
    
    render() {
        var player = this.props.player;
        var _complete = this.props._complete;
        
        return (
            <div className='buttons'>
                {player.control.map(function(comm, index) {
                    return <RaisedButton key={index}
                                         label={(comm === 'Action' && player.action + ' action') ||
                                                (comm === 'Buy' && player.buy + ' buy ' + player.coin + ' coin') ||
                                                comm}
                                         primary={player.main && index < player.phase}
                                         onTouchTap={_complete.bind(null, comm)}/>;
                })}
            </div>
        );
    }
}