// @flow
import * as React from 'react';
import TextField from 'material-ui/TextField';
import { Column, Line } from '../UI/Grid';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import { mapVector } from '../Utils/MapFor';
import { FlatButton } from 'material-ui';
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
};

export default class EventsFunctionEditor extends React.Component<
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

    return (
      <Column noMargin>
        <div style={styles.list}>
          {mapVector(parameters, (parameter: gdParameterMetadata, i: number) => {
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
          })}
          <FlatButton label="Add a parameter" onClick={this._addParameter} />
        </div>
      </Column>
    );
  }
}
