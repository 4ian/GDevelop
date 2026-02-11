// @flow
import * as React from 'react';

type Props = {|
  initialValue: any,
  render: (value: any, onChange: (value: any) => void) => React.Node,
|};

type State = {|
  value: any,
|};

export default class ValueStateHolder extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      value: props.initialValue,
    };
  }

  _handleChange = (value: any) => this.setState({ value });

  render() {
    return this.props.render(this.state.value, this._handleChange);
  }
}
