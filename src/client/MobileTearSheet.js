import React, {Component, PropTypes} from 'react';

class MobileTearSheet extends Component {

  static propTypes = {
    children: PropTypes.node,
    height: PropTypes.number.isRequired,
  };

  static defaultProps = {
    height: 500,
  };

  static contextTypes = {
    muiTheme: PropTypes.object.isRequired,
  };

  render() {
    const {
      prepareStyles,
    } = this.context.muiTheme;

    const styles = {
      root: {
        marginBottom: 24,
        marginRight: 24,
        maxWidth: 350,
        width: '100%',
      },
      container: {
				border: this.props.isTurn ? this.props.isTurn : 'solid 1px #d9d9d9',
        height: this.props.height,
        overflow: 'auto',
				WebkitBoxSizing: 'border-box',
				MozBoxSizing: 'border-box',
				boxSizing: 'border-box'
      },
      bottomTear: {
        display: 'block',
        position: 'relative',
        marginTop: -10,
        maxWidth: 350,
      },
    };

    return (
      <div style={prepareStyles(styles.root)}>
        <div style={prepareStyles(styles.container)}>
          {this.props.children}
        </div>
      </div>
    );
  }
}

export default MobileTearSheet;