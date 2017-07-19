import React from 'react';
import {
    Step,
    Stepper,
    StepButton
} from 'material-ui/Stepper';

import PrimaryIcon from 'material-ui/svg-icons/navigation/chevron-right';
import SecondaryIcon from 'material-ui/svg-icons/action/code';

import { black, white } from 'material-ui/styles/colors';

/**
 * A basic vertical non-linear implementation
 */
class ControlComponent extends React.Component {
    
    componentDidMount() {
        if (this.props.isPlayer) {
            var audio = new Audio('/asset/notif.mp3');
            audio.play();
        }
    }
  
    render() {
        var phase = this.props.phase;
        var isPlayer = this.props.isPlayer;
        
        var _complete = this.props._complete;
        
        return (
            <div className='controls'>
                <Stepper activeStep={phase}
                         linear={false}
                         orientation='horizontal'
                         connector={phase !== null ? <PrimaryIcon/> : <SecondaryIcon/>}
                >
                    {this.props.control.map(function(step, index) {
                        var isDisabled = !isPlayer || (phase !== null && index <= phase);
                        var isActive = phase !== null && index === phase;
                        
                        return (
                            <Step key={index}>
                                <StepButton onTouchTap={_complete.bind(null, step)}
                                            disabled={isDisabled}
                                            icon={null}
                                >
                                    <span style={{color: isActive ? black : white, fontWeight: isActive ? 'bold' : null}}>
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