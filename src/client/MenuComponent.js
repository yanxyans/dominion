import React from 'react';
import { List, ListItem } from 'material-ui/List';
import Divider from 'material-ui/Divider';
import MobileTearSheet from './MobileTearSheet';
import NameComponent from './NameComponent';
import JoinComponent from './JoinComponent';
import SelectableList from './SelectableList';
import {Card, CardMedia} from 'material-ui/Card';

const styles = {
  card: {
    display: 'flex',
		justifyContent: 'justify-content'
  }
};

export default class MenuComponent extends React.Component {
  render() {
    return (
			<div id='menu'>
				<MobileTearSheet id='menu_child'>
					<List>
						<NameComponent name={this.props.name} _setName={this.props._setName} />
						<JoinComponent _joinGame={this.props._joinGame} />
					</List>
					<Divider />
					<SelectableList inRoom={this.props.inRoom} _enterGame={this.props._enterGame}>
						{Object.keys(this.props.rooms).map(function(room) {
							return <ListItem key={room} value={room}>{room}</ListItem>;
						})}
					</SelectableList>
				</MobileTearSheet>
				<MobileTearSheet>
					<List>
						<ListItem primaryText="a e s t h e t i c" />
						{this.props.helpCard === '' ? null :
						 <Card style={styles.card}>
						   <CardMedia>
								 <img src={this.props.helpCard} />
							 </CardMedia>
						 </Card>}
					</List>
				</MobileTearSheet>
			</div>
    )
  }
};