import React from 'react';

import Paper from 'material-ui/Paper';
import Stack from './Stack';

export default class BoardComponent extends React.Component {
    render() {
        return (
            <Paper id='board' zDepth={2}>
                <Paper className='title' zDepth={2}>
                    <h1> piles </h1>
                </Paper>
                <Paper className='content'>
                    {Object.keys(this.props.piles).map(function(pile, index) {
                        return <Stack key={index}
                                      data={this.piles[pile]}
                                      tooltip='pile'
                                      _tapCard={this._tapCard.bind(null, ['piles', pile])}
                                      open={false}
                                      _handleMouseOver={this._handleMouseOver}
                                      _handleMouseOut={this._handleMouseOut}/>;
                    }, this.props)}
                    {this.props.trash &&
                    <Stack data={this.props.trash}
                           tooltip='trash'
                           _tapCard={this.props._tapCard.bind(null, ['trash'])}
                           open={false}
                           _handleMouseOver={this.props._handleMouseOver}
                           _handleMouseOut={this.props._handleMouseOut}/>}
                </Paper>
            </Paper>
        );
    }
}