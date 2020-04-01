import { Trans } from '@lingui/macro';
import React, { Component } from 'react';
import FlatButton from '../../UI/FlatButton';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import Dialog from '../../UI/Dialog';
import { mapFor } from '../../Utils/MapFor';
import Text from '../../UI/Text';

export default class LayoutChooserDialog extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedLayoutName: props.layoutName,
    };
  }

  componentWillReceiveProps(newProps) {
    if (newProps.layoutName !== this.props.layoutName) {
      this.setState({
        selectedLayoutName: newProps.layoutName,
      });
    }
  }

  chooseLayout(layoutName) {
    this.setState({
      selectedLayoutName: layoutName,
    });
  }

  render() {
    const actions = [
      <FlatButton
        key="cancel"
        label={<Trans>Cancel</Trans>}
        primary={false}
        onClick={this.props.onClose}
      />,
      <FlatButton
        key="choose"
        label={<Trans>Choose</Trans>}
        primary={true}
        keyboardFocused={true}
        onClick={() => this.props.onChoose(this.state.selectedLayoutName)}
        disabled={!this.state.selectedLayoutName}
      />,
    ];

    const { project } = this.props;
    const { selectedLayoutName } = this.state;
    const layoutNames = mapFor(0, project.getLayoutsCount(), i => {
      return project.getLayoutAt(i).getName();
    });

    return (
      <Dialog
        actions={actions}
        open={this.props.open}
        title={this.props.title}
        onRequestClose={this.props.onClose}
        cannotBeDismissed={false}
        fullWidth
        maxWidth="sm"
      >
        {this.props.helpText && <Text>{this.props.helpText}</Text>}
        <RadioGroup
          aria-label="Associated scene"
          name="associated-layout"
          value={selectedLayoutName}
          onChange={event => this.chooseLayout(event.target.value)}
        >
          {layoutNames.map(name => (
            <FormControlLabel
              key={name}
              value={name}
              control={<Radio color="primary" />}
              label={name}
            />
          ))}
        </RadioGroup>
      </Dialog>
    );
  }
}
