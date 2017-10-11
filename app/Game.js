import React from 'react';

import FullWidthSection from './FullWidthSection';
import Board from './Board';
import PlayerAll from './PlayerAll';

export default class GameComponent extends React.Component {
    
    render() {
        return (
            <FullWidthSection id='game'>
                <PlayerAll isPlayer={this.props.isPlayer}
                           players={this.props.players}
                           tooltip={this.props.tooltip}
                           _recon={this.props._recon}
                           _complete={this.props._complete}
                           _tap={this.props._tap}/>
                <Board supply={this.props.supply}
                       trash={this.props.trash}
                       tooltip={this.props.tooltip}
                       _tap={this.props._tap}/>
            </FullWidthSection>
        );
    }
}