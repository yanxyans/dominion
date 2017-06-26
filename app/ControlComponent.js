import React from 'react';
import {
    Step,
    Stepper,
    StepButton
} from 'material-ui/Stepper';

/**
 * A basic vertical non-linear implementation
 */
class ControlComponent extends React.Component {
  
    render() {
        
        return (
            <div>
                <Stepper activeStep={this.props.phase}
                        linear={false}
                        orientation="horizontal"
                >
                    {this.props.control.map(function(step, index) {
                        return (
                            <Step key={index}>
                                <StepButton onTouchTap={this.bind(null, step)}>
                                    {step}
                                </StepButton>
                            </Step>
                        );
                    }, this.props._sendControl)}
                </Stepper>
            </div>
        );
    }
}

export default ControlComponent;