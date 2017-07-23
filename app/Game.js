import React from 'react';

import Board from './Board';
import PlayerAll from './PlayerAll';
import FullWidthSection from './FullWidthSection';

export default class GameComponent extends React.Component {
    
    render() {
        return (
            <FullWidthSection id='game'>
                <Board supply={this.props.supply}
                       trash={this.props.trash}
                       tooltip={this.props.tooltip}
                       _tap={this.props._tap}/>
                <PlayerAll isPlayer={this.props.isPlayer}
                           players={this.props.players.slice(0).reverse()}
                           _recon={this.props._recon}
                           _complete={this.props._complete}
                           _tap={this.props._tap}
                           tooltip={this.props.tooltip}/>
            </FullWidthSection>
        );
    }
}