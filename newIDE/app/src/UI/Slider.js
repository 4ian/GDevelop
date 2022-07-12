// @flow
import * as React from 'react';
import MuiSlider from '@material-ui/core/Slider';

type Props = {|
  value: number,
  min: number,
  max: number,
  step: number,
  onChange: (value: number) => void,
|};

const Slider = (props: Props) => (
  <MuiSlider
    color="secondary"
    value={props.value}
    track={false}
    onChange={(e, newValue) => props.onChange(newValue)}
    min={props.min}
    max={props.max}
    step={props.step}
  />
);

export default Slider;
