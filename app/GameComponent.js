import React from 'react';

import BoardComponent from './BoardComponent';
import PlayersComponent from './PlayersComponent';
import FullWidthSection from './FullWidthSection';

export default class GameComponent extends React.Component {
    
    render() {
        return (
            <FullWidthSection id='game'>
                <BoardComponent supply={this.props.supply}
                                trash={this.props.trash}
                                tooltip={this.props.tooltip}
                                _tap={this.props._tap}/>
                <PlayersComponent isPlayer={this.props.isPlayer}
                                  players={this.props.players.slice(0).reverse()}
                                  _recon={this.props._recon}
                                  _complete={this.props._complete}
                                  _tap={this.props._tap}
                                  tooltip={this.props.tooltip}/>
            </FullWidthSection>
        );
    }
}