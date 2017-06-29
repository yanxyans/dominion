import React from 'react';
import { List, makeSelectable } from 'material-ui/List';
import PropTypes from 'prop-types';

let RoomList = makeSelectable(List);

function wrapState(ComposedComponent) {
    return class RoomList extends React.Component {
        static propTypes = {
            children: PropTypes.node.isRequired
        }

        _handleRequestChange = (event, room) => {
            this.props._setRoom(room);
        }

        render() {
            return (
                <ComposedComponent value={this.props.current}
                                   onChange={this._handleRequestChange}>
                    {this.props.children}
                </ComposedComponent>
            );
        }
    };
}

RoomList = wrapState(RoomList);

export default RoomList;