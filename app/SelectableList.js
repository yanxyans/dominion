import React from 'react';
import {List, ListItem, makeSelectable} from 'material-ui/List';

let SelectableList = makeSelectable(List);

function wrapState(ComposedComponent) {
  return class SelectableList extends React.Component {
    static propTypes = {
      children: React.PropTypes.node.isRequired
    };

    handleRequestChange = (event, room) => {
			this.props._setRoom(room);
    };

    render() {
      return (
        <ComposedComponent
          value={this.props.current}
          onChange={this.handleRequestChange}>
          {this.props.children}
        </ComposedComponent>
      );
    }
  };
}

SelectableList = wrapState(SelectableList);

export default SelectableList;