import React from 'react';

import Paper from 'material-ui/Paper';
import FontIcon from 'material-ui/FontIcon';
import IconButton from 'material-ui/IconButton';

import IconPublic from 'material-ui/svg-icons/social/public';
import IconBooks from 'material-ui/svg-icons/av/library-books';
import IconEmail from 'material-ui/svg-icons/communication/email'

const styles = {
    linkButton: {
        width: 'auto',
        height: 'auto'
    },
    linkIcon: {
        fontSize: '48px',
        width: '48px',
        height: '48px'
    }
};

export default class InfoComponent extends React.Component {
    render() {
        return (
            <Paper id='info' zDepth={2}>
                <Paper className='title' zDepth={2}>
                    <h1> dominion </h1>
                </Paper>
                
                <Paper className='content full' zDepth={2}>
                    {this.props.help && this.props.card &&
                    <div className='links'>
                        <img src={'asset/cards/' + this.props.card + '.jpg'}/>
                    </div>}
                    
                    {!this.props.help &&
                    <div className='links'>
                        <IconButton tooltip='source'
                                    style={styles.linkButton}
                                    iconStyle={styles.linkIcon}
                                    touch={true}
                                    onTouchTap={() => window.open('https://github.com/yanxyans/dominion')}>
                            <FontIcon className='muidocs-icon-custom-github'/>
                        </IconButton>
                        <IconButton tooltip='official game'
                                    style={styles.linkButton}
                                    iconStyle={styles.linkIcon}
                                    touch={true}
                                    onTouchTap={() => window.open('https://dominion.games')}>
                            <IconPublic/>
                        </IconButton>
                        <IconButton tooltip='wiki'
                                    style={styles.linkButton}
                                    iconStyle={styles.linkIcon}
                                    touch={true}
                                    onTouchTap={() => window.open('http://wiki.dominionstrategy.com/index.php/Main_Page')}>
                            <IconBooks/>
                        </IconButton>
                        <IconButton tooltip='contact'
                                    style={styles.linkButton}
                                    iconStyle={styles.linkIcon}
                                    touch={true}
                                    href='mailto:fssyan@gmail.com'>
                            <IconEmail/>
                        </IconButton>
                    </div>}
                </Paper>
            </Paper>
        );
    }
}