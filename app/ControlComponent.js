import React from 'react';
import {
  Step,
  Stepper,
  StepButton,
} from 'material-ui/Stepper';
import RaisedButton from 'material-ui/RaisedButton';
import FlatButton from 'material-ui/FlatButton';

/**
 * Non-linear steppers allow users to enter a multi-step flow at any point.
 *
 * This example is similar to the regular horizontal stepper, except steps are no longer
 * automatically set to `disabled={true}` based on the `activeStep` prop.
 *
 * We've used the `<StepButton>` here to demonstrate clickable step labels.
 */
export default class ControlComponent extends React.Component {

  render() {
    return (
      <div style={{width: '100%', maxWidth: 700, margin: 'auto'}}>
        <Stepper linear={false}>
					{this.props.controls.map(function(control, index) {
						return <Step key={index}>
							<StepButton onClick={() => this._sendControl(control)}>
								{control}
							</StepButton>
						</Step>;
					}, this.props)}
        </Stepper>
      </div>
    );
  }
};