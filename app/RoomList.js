import React from 'react';
import PropTypes from 'prop-types';

import { List, makeSelectable } from 'material-ui/List';

let RoomList = makeSelectable(List);

function wrapState(ComposedComponent) {
    return class RoomList extends React.Component {
        static propTypes = {
            children: PropTypes.node.isRequired
        }

        _handleRequestChange = (event, room) => {
            this.props._join(room);
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