import React from 'react';

import Paper from 'material-ui/Paper';
import FontIcon from 'material-ui/FontIcon';

const styles = {
    infoIcon: {
        cursor: 'pointer',
        fontSize: '48px'
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
                        <FontIcon className='muidocs-icon-custom-github'
                                  onTouchTap={() => window.open('https://github.com/yanxyans/dominion')}
                                  title='source'
                                  style={styles.infoIcon}/>
                        <FontIcon className='material-icons'
                                  onTouchTap={() => window.open('https://dominion.games')}
                                  title='official game'
                                  style={styles.infoIcon}>
                            public
                        </FontIcon>
                        <FontIcon className='material-icons'
                                  onTouchTap={() => window.open('http://wiki.dominionstrategy.com/index.php/Main_Page')}
                                  title='wiki'
                                  style={styles.infoIcon}>
                            help
                        </FontIcon>
                        <a href='mailto:fssyan@gmail.com'>
                            <FontIcon className='material-icons'
                                      title='contact'
                                      style={styles.infoIcon}>
                                mail
                            </FontIcon>
                        </a>
                    </div>}
                </Paper>
            </Paper>
        );
    }
}