// @flow
import * as React from 'react';
import TextField from 'material-ui/TextField';
import { Column, Line } from '../UI/Grid';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import { mapVector } from '../Utils/MapFor';
import RaisedButton from 'material-ui/RaisedButton';
import EmptyMessage from '../UI/EmptyMessage';
const gd = global.gd;

type Props = {|
  eventsFunction: gdEventsFunction,
  onParametersUpdated: () => void,
|};

type State = {||};

const styles = {
  list: {
    overflowY: 'scroll',
  },
  icon: {
    width: 32,
    height: 32,
    marginRight: 8,
  },
};

export default class EventsFunctionConfigurationEditor extends React.Component<
  Props,
  State
> {
  _addParameter = () => {
    const { eventsFunction } = this.props;
    const parameters = eventsFunction.getParameters();

    const newParameter = new gd.ParameterMetadata();
    newParameter.setType('objectList');
    parameters.push_back(newParameter);
    newParameter.delete();
    this.forceUpdate();
    this.props.onParametersUpdated();
  };

  render() {
    const { eventsFunction } = this.props;

    const parameters = eventsFunction.getParameters();
    const type = eventsFunction.getFunctionType();

    return (
      <Column>
        <div style={styles.list}>
          <Line noMargin alignItems="center">
            <img src="res/function32.png" alt="" style={styles.icon} />
            <SelectField
              value={type}
              onChange={(e, i, value) => {
                eventsFunction.setFunctionType(value);
                this.forceUpdate();
              }}
            >
              <MenuItem value={gd.EventsFunction.Action} primaryText="Action" />
              <MenuItem
                value={gd.EventsFunction.Condition}
                primaryText="Condition"
              />
              <MenuItem
                value={gd.EventsFunction.Expression}
                primaryText="Expression"
              />
              <MenuItem
                value={gd.EventsFunction.StringExpression}
                primaryText="String Expression"
              />
            </SelectField>
            <TextField
              hintText="Full name displayed in editor"
              value={eventsFunction.getFullName()}
              onChange={(e, text) => {
                eventsFunction.setFullName(text);
                this.forceUpdate();
              }}
            />
          </Line>
          <Line noMargin>
            <TextField
              hintText="Description, displayed in editor"
              fullWidth
              multiLine
              value={eventsFunction.getDescription()}
              onChange={(e, text) => {
                eventsFunction.setDescription(text);
                this.forceUpdate();
              }}
            />
          </Line>
          <Line noMargin>
            {type === gd.EventsFunction.Action ||
            type === gd.EventsFunction.Condition ? (
              <TextField
                floatingLabelText="Sentence, displayed in events sheet (write _PARAMx_ for parameters, e.g: _PARAM1_)"
                fullWidth
                value={eventsFunction.getSentence()}
                onChange={(e, text) => {
                  eventsFunction.setSentence(text);
                  this.forceUpdate();
                }}
              />
            ) : null}
          </Line>
          <p>Parameters:</p>
          <Line noMargin>
            <div>
              {mapVector(
                parameters,
                (parameter: gdParameterMetadata, i: number) => {
                  if (i === 0) {
                    // By convention, first parameter is always the runtimeScene
                    // and is not shown in editor.
                    return null;
                  }

                  return (
                    <Line noMargin expand key={i}>
                      <TextField
                        hintText="Parameter name"
                        value={parameter.getName()}
                        onChange={(e, text) => {
                          parameter.setName(text);
                          this.forceUpdate();
                        }}
                        onBlur={() => {
                          this.props.onParametersUpdated();
                        }}
                      />
                      <SelectField
                        hintText="Type"
                        value={parameter.getType()}
                        onChange={(e, i, value) => {
                          parameter.setType(value);
                          this.forceUpdate();
                          this.props.onParametersUpdated();
                        }}
                      >
                        <MenuItem value="objectList" primaryText="Objects" />
                        <MenuItem value="expression" primaryText="Number" />
                        <MenuItem value="string" primaryText="String (text)" />
                      </SelectField>
                      <TextField
                        hintText="Description"
                        value={parameter.getDescription()}
                        onChange={(e, text) => {
                          parameter.setDescription(text);
                          this.forceUpdate();
                        }}
                      />
                    </Line>
                  );
                }
              )}
              {parameters.size() <= 1 ? (
                <EmptyMessage>No parameters for this function.</EmptyMessage>
              ) : null}
              <Line justifyContent="flex-end">
                <Column>
                  <RaisedButton
                    label="Add a parameter"
                    onClick={this._addParameter}
                  />
                </Column>
              </Line>
            </div>
          </Line>
        </div>
      </Column>
    );
  }
}
