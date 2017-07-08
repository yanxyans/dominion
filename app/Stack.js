import React from 'react';

import Paper from 'material-ui/Paper';
import IconButton from 'material-ui/IconButton';

import IconAdd from 'material-ui/svg-icons/content/add';
import IconRemove from 'material-ui/svg-icons/content/remove';
import ReactTooltip from 'react-tooltip';

function guidGenerator() {
    var S4 = function() {
       return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
    };
    return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
}

export default class Stack extends React.Component {
    constructor(props) {
        super(props);
        
        this.state = {
            open: props.open,
            show: props.show
        };
    }
    
    componentDidMount() {
        this.setState({open: this.props.open});
    }
    
    _handleToggle = () => {
        this.setState({open: !this.state.open});
    }
    
    _getIndex = (index, isLast, selected, selectable) => {
        var isStacked = !this.state.open && !isLast ?
            {marginRight:'-50px'} :
            {margin:'1px'};
        var isSelected = selected ?
            {opacity:0.35} :
            null;
        var isSelectable = selectable ?
            {boxShadow:'0px 0px 1px 1px #FFAB00'} :
            null;
        
        return Object.assign(
            {},
            {zIndex:index, maxHeight:'95px', transition:'.3s'},
            isStacked,
            isSelected,
            isSelectable
        );
    }
    
    render() {
        var data = this.props.data;
        var display = this.state.open || this.props.alwaysOpen ? data : data.slice(0, 5);
        
        var size = data.length;
        var len = display.length;
        
        var tap = this.props._tapCard;
        var show = this.props.show;
        
        return (
            <Paper className={'wrap ' + this.props.tooltip} zDepth={1}>
                {!this.props.alwaysOpen &&
                <IconButton onTouchTap={this._handleToggle}
                            tooltip={this.props.tooltip + ' (' + size + ')'}>
                    {this.state.open ? <IconRemove/> : <IconAdd/>}
                </IconButton>}
                <div className={this.props.alwaysOpen ? 'wide stack' : 'default stack'}>
                    {display.map(function(item, index) {
                        var name = item.name;
                        var source = '/asset/cards/' + (name ? name : 'back') + '.jpg';
                        item.source = source;
                        
                        var isLast = index === 0;
                        
                        const guid = guidGenerator();
                        item.guid = guid;
                        
                        return <img key={index}
                                    src={source}
                                    className='hvr-grow'
                                    style={this._getIndex(len - 1 - index, isLast, item.selected, item.selectable)}
                                    onTouchTap={tap.bind(null, index)}
                                    data-for={guid}
                                    data-tip=''/>;
                    }, this)}
                    {display.map(function(item, index) {
                        return <ReactTooltip id={item.guid}
                                             key={index}
                                             effect='solid'
                                             type='light'>
                                    {show && <img src={item.source}
                                                  style={{maxHeight:'400px'}}/>}
                               </ReactTooltip>;
                    })}
                </div>
            </Paper>
        );
    }
}