import React from 'react';
import {
    Step,
    Stepper,
    StepButton
} from 'material-ui/Stepper';
import ChevronRightIcon from 'material-ui/svg-icons/navigation/chevron-right';

import { yellowA700, white } from 'material-ui/styles/colors';
import IconCoin from 'material-ui/svg-icons/action/copyright';
import code from 'material-ui/svg-icons/action/code';

const StepIcon = ({ label, color = yellowA700}) => (
    <div style={{ position: 'relative' }}>
      <div style={{ color: white, position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', textAlign: 'center', lineHeight: '24px' }}>{label}</div>
    </div>
);

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
                        connector={this.phase !== null ? <ChevronRightIcon /> : <code />}
                >
                    {this.props.control.map(function(step, index) {
                        var isDisabled = (this.phase !== null) && (index <= this.phase);
                        var cur = (this.phase !== null) && (index === this.phase);
                        return (
                            <Step key={index} >
                                <StepButton onTouchTap={this._sendControl.bind(null, step)}
                                            disabled={isDisabled}
                                            icon={null}
                                            className={isDisabled || !this.visible ? null : 'hvr-buzz-out'}
                                >
                                    <div style={{color: cur ? yellowA700 : white }}>
                                    {step}
                                    </div>
                                </StepButton>
                            </Step>
                        );
                    }, this.props)}
                </Stepper>
            </div>
        );
    }
}

export default ControlComponent;