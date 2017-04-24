import React from 'react';
import Subheader from 'material-ui/Subheader';
import GameCard from './GameCard';

const styles = {
	toggleOff: {
		color: 'rgba(0, 0, 0, 0.541176)',
		cursor: 'pointer'
	},
	toggleOn: {
		color: '#285943',
		cursor: 'pointer'
	},
  wrapper: {
    display: 'flex',
    flexWrap: 'wrap',
		justifyContent: 'center'
  }
};

export default class GameCardContainer extends React.Component {
	state = {
		toggle : false
	};
	
	toggleLast = () => {
		this.setState({toggle: !this.state.toggle});
	};
	
	render() {
		return (
			<div id={this.props.type}>
				<Subheader onTouchTap={this.toggleLast}
									 style={this.state.toggle ? styles.toggleOn : styles.toggleOff}
				>
					{this.props.type}
				</Subheader>
				<div id='content' style={styles.wrapper}>
					{this.props.cards.map(function(card, index) {
						return (!this.state.toggle || (index === this.props.cards.length - 1)) &&
							<GameCard key={index}
												index={this.props.type !== 'buy' ? index : card.name}
												type={this.props.type}
												name={card.name}
												sel={card.sel}
												_clickCard={this.props._clickCard}
												_help={this.props._help}
												amt={card.amt} />;
					}, this)}
				</div>
			</div>
		)
	}
};