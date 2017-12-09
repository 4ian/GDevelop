import React, { Component } from 'react';
import AutoComplete from 'material-ui/AutoComplete';
const gd = global.gd;

const styles = {
  autoCompleteTextField: {
    minWidth: 300,
  },
};

const fuzzyFilterOrEmpty = (searchText, key) => {
  return !key || AutoComplete.fuzzyFilter(searchText, key);
};

export default class BehaviorField extends Component {
  constructor(props) {
    super(props);

    this.state = { errorText: null };

    const { parameterMetadata } = this.props;
    this._description = parameterMetadata
      ? parameterMetadata.getDescription()
      : undefined;

    this._behaviorTypeAllowed = parameterMetadata
      ? parameterMetadata.getExtraInfo()
      : undefined;
  }

  _updateBehaviorsList() {
    const { instructionOrExpression } = this.props;
    if (
      !instructionOrExpression ||
      instructionOrExpression.getParametersCount() === 0
    )
      return;

    const objectName = instructionOrExpression.getParameter(0);
    this._behaviorNames = gd
      .getBehaviorsOfObject(
        this.props.project,
        this.props.layout,
        objectName,
        true
      )
      .toJSArray()
      .filter(behaviorName => {
        return (
          !this._behaviorTypeAllowed ||
          gd.getTypeOfBehavior(
            this.props.project,
            this.props.layout,
            behaviorName
          ) === this._behaviorTypeAllowed
        );
      });
  }

  focus() {
    if (this._field) this._field.focus();
  }

  _getError = () => {
    if (!this.props.value) return null;

    const isValidChoice =
      this._behaviorNames.filter(choice => this.props.value === choice)
        .length !== 0;

    if (!isValidChoice) return 'This behavior is not attached to the object';

    return null;
  };

  _doValidation = () => {
    this.setState({ errorText: this._getError() });
  };

  componentDidUpdate() {
    const { instructionOrExpression } = this.props;
    if (
      !instructionOrExpression ||
      instructionOrExpression.getParametersCount() === 0
    )
      return;

    // This is a bit hacky:
    // force the behavior selection if there is only one selectable behavior
    if (this._behaviorNames.length === 1) {
      if (this.props.value !== this._behaviorNames[0]) {
        this.props.onChange(this._behaviorNames[0]);
      }
    }
  }

  render() {
    this._updateBehaviorsList();

    const noBehaviorErrorText =
      this._behaviorTypeAllowed !== ''
        ? 'The behavior is not attached to this object. Please select another object or add the behavior'
        : 'This object has no behaviors: please add a behavior to the object first';

    return (
      <AutoComplete
        floatingLabelText={this._description}
        fullWidth
        textFieldStyle={styles.autoCompleteTextField}
        menuProps={{
          maxHeight: 250,
        }}
        errorText={
          !this._behaviorNames.length
            ? noBehaviorErrorText
            : this.state.errorText
        }
        searchText={this.props.value}
        onUpdateInput={value => {
          this.setState({ errorText: null });
          this.props.onChange(value);
        }}
        onBlur={this._doValidation}
        onNewRequest={data => {
          // Note that data may be a string or a {text, value} object.
          if (typeof data === 'string') {
            this.props.onChange(data);
          } else if (typeof data.value === 'string') {
            this.props.onChange(data.value);
          }
        }}
        dataSource={this._behaviorNames.map(behaviorName => ({
          text: behaviorName,
          value: behaviorName,
        }))}
        filter={fuzzyFilterOrEmpty}
        openOnFocus={!this.props.isInline}
        disabled={this._behaviorNames.length <= 1}
        ref={field => (this._field = field)}
      />
    );
  }
}
