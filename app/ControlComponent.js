import React from 'react';
import {
    Step,
    Stepper,
    StepButton
} from 'material-ui/Stepper';

import PrimaryIcon from 'material-ui/svg-icons/navigation/chevron-right';
import SecondaryIcon from 'material-ui/svg-icons/action/code';

import { amberA700, white } from 'material-ui/styles/colors';

/**
 * A basic vertical non-linear implementation
 */
class ControlComponent extends React.Component {
  
    render() {
        var phase = this.props.phase;
        var visible = this.props.visible;
        
        var send = this.props._sendControl;
        
        return (
            <div className='controls'>
                <Stepper activeStep={phase}
                         linear={false}
                         orientation='horizontal'
                         connector={phase !== null ? <PrimaryIcon/> : <SecondaryIcon/>}
                >
                    {this.props.control.map(function(step, index) {
                        var isDisabled = !visible || (phase !== null && index <= phase);
                        var isActive = phase !== null && index === phase;
                        
                        return (
                            <Step key={index}>
                                <StepButton onTouchTap={send.bind(null, step)}
                                            disabled={isDisabled}
                                            icon={null}
                                            className={!isDisabled && 'hvr-buzz-out'}
                                >
                                    <span style={{color: isActive ? amberA700 : white}}>
                                        {step}
                                    </span>
                                </StepButton>
                            </Step>
                        );
                    })}
                </Stepper>
            </div>
        );
    }
}

export default ControlComponent;