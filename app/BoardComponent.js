import React from 'react';

import Paper from 'material-ui/Paper';
import Stack from './Stack';

import { greenA700, white } from 'material-ui/styles/colors';

import {Toolbar, ToolbarGroup, ToolbarTitle} from 'material-ui/Toolbar';

import IconButton from 'material-ui/IconButton';

import IconClear from 'material-ui/svg-icons/content/clear';
import IconSort from 'material-ui/svg-icons/content/sort';

const styles = {
    appBar: {
        backgroundColor: greenA700
    },
};

export default class BoardComponent extends React.Component {
    state = {
        sortState: 0
    }
    
    _toggleSort = (type) => {
        this.setState({sortState: type});
    }
    
    render() {
        var help = this.props.help;
        
        var p = this.props.piles
        var piles = Object.keys(this.props.piles);
        if (this.state.sortState === 0) {
        } else if (this.state.sortState === 1) {
            piles.sort(function(pileA, pileB) {
                pileA = p[pileA];
                pileB = p[pileB];
                var lenA = pileA.length;
                var lenB = pileB.length;
                if (lenA === 0 && lenB === 0) {
                    return 0;
                } else if (lenA === 0) {
                    return 1;
                } else if (lenB === 0) {
                    return -1;
                } else {
                    return pileA[0].coin - pileB[0].coin;
                }
            });
        } else if (this.state.sortState === 2) {
            piles.sort(function(pileA, pileB) {
                pileA = p[pileA];
                pileB = p[pileB];
                var lenA = pileA.length;
                var lenB = pileB.length;
                if (lenA === 0 && lenB === 0) {
                    return 0;
                } else if (lenA === 0) {
                    return 1;
                } else if (lenB === 0) {
                    return -1;
                } else {
                    var typeA = pileA[0].types;
                    var typeB = pileB[0].types;
                    
                    if (typeA.length && typeB.length) {
                        
                        var a = typeA[0];
                        var b = typeB[0];
                        return a.charCodeAt(0) - b.charCodeAt(0);
                    }
                    return 0;
                }
            });
        } else if (this.state.sortState === 3) {
            piles.sort(function(pileA, pileB) {
                pileA = p[pileA];
                pileB = p[pileB];
                var lenA = pileA.length;
                var lenB = pileB.length;
                if (lenA === 0 && lenB === 0) {
                    return 0;
                } else if (lenA === 0) {
                    return 1;
                } else if (lenB === 0) {
                    return -1;
                } else {
                    return lenA - lenB;
                }
            });
        }
        
        return (
            <Paper id='board' zDepth={2}>
                <Toolbar style={styles.appBar}>
                    <ToolbarGroup>
                        <ToolbarTitle text='supply' style={{color:white}}/>
                    </ToolbarGroup>
                    <ToolbarGroup>
                        
                        <IconButton tooltip='cost'
                                    onTouchTap={this._toggleSort.bind(null, 1)}>
                            <IconSort/>
                        </IconButton>
                        
                        <IconButton tooltip='type'
                                    onTouchTap={this._toggleSort.bind(null, 2)}>
                            <IconSort/>
                        </IconButton>
                        
                        <IconButton tooltip='size'
                                    onTouchTap={this._toggleSort.bind(null, 3)}>
                            <IconSort/>
                        </IconButton>
                        
                        <IconButton tooltip='reorder'
                                    onTouchTap={this._toggleSort.bind(null, 0)}>
                            <IconClear/>
                        </IconButton>
                    </ToolbarGroup>
                </Toolbar>
                <div className='content'>
                    {piles.map(function(pile, index) {
                        return <Stack key={index}
                                      data={this.piles[pile]}
                                      tooltip='pile'
                                      _tapCard={this._tapCard.bind(null, ['piles', pile])}
                                      open={false}
                                      show={help}/>;
                    }, this.props)}
                    {this.props.trash &&
                    <Stack data={this.props.trash}
                           tooltip='trash'
                           _tapCard={this.props._tapCard.bind(null, ['trash'])}
                           open={false}
                           show={help}/>}
                </div>
            </Paper>
        );
    }
}