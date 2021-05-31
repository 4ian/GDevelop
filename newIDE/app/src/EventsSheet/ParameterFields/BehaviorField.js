// @flow
import { Trans } from '@lingui/macro';
import * as React from 'react';
import { type ParameterFieldProps } from './ParameterFieldCommons';
import { getLastObjectParameterValue } from './ParameterMetadataTools';
import SemiControlledAutoComplete, {
  type SemiControlledAutoCompleteInterface,
} from '../../UI/SemiControlledAutoComplete';
const gd: libGDevelop = global.gd;

type State = {|
  errorText: ?string,
|};

export default class BehaviorField extends React.Component<
  ParameterFieldProps,
  State
> {
  state: State = { errorText: null };
  _description: ?string;
  _longDescription: ?string;
  _behaviorTypeAllowed: ?string;
  _behaviorNames: Array<string> = [];
  _field: ?SemiControlledAutoCompleteInterface;

  constructor(props: ParameterFieldProps) {
    super(props);

    const { parameterMetadata } = this.props;
    this._description = parameterMetadata
      ? parameterMetadata.getDescription()
      : undefined;

    this._longDescription = parameterMetadata
      ? parameterMetadata.getLongDescription()
      : undefined;

    this._behaviorTypeAllowed = parameterMetadata
      ? parameterMetadata.getExtraInfo()
      : undefined;
  }

  _updateBehaviorsList() {
    const {
      instructionMetadata,
      instruction,
      expressionMetadata,
      expression,
      parameterIndex,
    } = this.props;

    const objectName = getLastObjectParameterValue({
      instructionMetadata,
      instruction,
      expressionMetadata,
      expression,
      parameterIndex,
    });
    if (!objectName) return;

    this._behaviorNames = gd
      .getBehaviorsOfObject(
        this.props.globalObjectsContainer,
        this.props.objectsContainer,
        objectName,
        true
      )
      .toJSArray()
      .filter(behaviorName => {
        return (
          !this._behaviorTypeAllowed ||
          gd.getTypeOfBehavior(
            this.props.globalObjectsContainer,
            this.props.objectsContainer,
            behaviorName,
            false
          ) === this._behaviorTypeAllowed
        );
      });
  }

  focus() {
    if (this._field) this._field.focus();
  }

  _getError: (value?: string) => null | string = (value?: string) => {
    if (!value && !this.props.value) return null;

    const isValidChoice =
      this._behaviorNames.filter(choice => this.props.value === choice)
        .length !== 0;

    if (!isValidChoice) return 'This behavior is not attached to the object';

    return null;
  };

  _doValidation: (value?: string) => void = (value?: string) => {
    this.setState({ errorText: this._getError(value) });
  };

  _forceChooseBehavior: () => void = () => {
    // This is a bit hacky:
    // force the behavior selection if there is only one selectable behavior
    if (this._behaviorNames.length === 1) {
      if (this.props.value !== this._behaviorNames[0]) {
        this.props.onChange(this._behaviorNames[0]);
      }
    }
  };

  componentDidUpdate() {
    this._forceChooseBehavior();
  }

  componentDidMount() {
    this._forceChooseBehavior();
  }

  render(): React.Node {
    this._updateBehaviorsList();

    const noBehaviorErrorText =
      this._behaviorTypeAllowed !== '' ? (
        <Trans>
          The behavior is not attached to this object. Please select another
          object or add this behavior.
        </Trans>
      ) : (
        <Trans>
          This object has no behaviors: please add this behavior to the object
          first.
        </Trans>
      );

    return (
      <SemiControlledAutoComplete
        margin={this.props.isInline ? 'none' : 'dense'}
        floatingLabelText={this._description}
        helperMarkdownText={this._longDescription}
        fullWidth
        errorText={
          !this._behaviorNames.length
            ? noBehaviorErrorText
            : this.state.errorText
        }
        value={this.props.value}
        onChange={this.props.onChange}
        onRequestClose={this.props.onRequestClose}
        onBlur={event => {
          this._doValidation(event.currentTarget.value);
        }}
        dataSource={this._behaviorNames.map(behaviorName => ({
          text: behaviorName,
          value: behaviorName,
        }))}
        openOnFocus={!this.props.isInline}
        disabled={this._behaviorNames.length <= 1}
        ref={field => (this._field = field)}
      />
    );
  }
}
