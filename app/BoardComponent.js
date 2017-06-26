import React from 'react';

import FullWidthSection from './FullWidthSection';
import Stack from './Stack';
import Paper from 'material-ui/Paper';

export default class BoardComponent extends React.Component {
    render() {
        return (
            <FullWidthSection>
                <Paper id='board'>
                    {Object.keys(this.props.piles).map(function(pile, index) {
                        return <Stack key={index}
                                      data={this.piles[pile]}
                                      _tapCard={this._tapCard.bind(null, ['piles', pile])}
                                      open={false}/>;
                    }, this.props)}
                    
                    {this.props.trash &&
                    <Stack data={this.props.trash}
                           _tapCard={this.props._tapCard.bind(null, ['trash'])}
                           open={false}/>}
                </Paper>
            </FullWidthSection>
        );
    }
}