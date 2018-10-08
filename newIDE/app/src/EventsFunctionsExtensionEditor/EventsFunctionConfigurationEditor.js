// @flow
import * as React from 'react';
import TextField from 'material-ui/TextField';
import { Column, Line } from '../UI/Grid';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import { mapVector } from '../Utils/MapFor';
import FlatButton from 'material-ui/FlatButton';
import IconButton from 'material-ui/IconButton';
import EmptyMessage from '../UI/EmptyMessage';
import Delete from 'material-ui/svg-icons/action/delete';
import {
  enumerateObjectTypes,
  type EnumeratedObjectMetadata,
} from '../ObjectsList/EnumerateObjects';
import Divider from 'material-ui/Divider';
import ThemeConsumer from '../UI/Theme/ThemeConsumer';
const gd = global.gd;

type Props = {|
  project: gdProject,
  eventsFunction: gdEventsFunction,
  onParametersUpdated: () => void,
|};

type State = {|
  objectMetadata: Array<EnumeratedObjectMetadata>,
|};

const styles = {
  scrollView: {
    overflowY: 'scroll',
  },
  parametersContainer: {
    flex: 1,
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
  state = { objectMetadata: [] };

  componentDidMount() {
    this.setState({
      objectMetadata: enumerateObjectTypes(this.props.project),
    });
  }

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

  _removeParameter = (index: number) => {
    const { eventsFunction } = this.props;
    const parameters = eventsFunction.getParameters();

    gd.removeFromVectorParameterMetadata(parameters, index);
    this.forceUpdate();
    this.props.onParametersUpdated();
  };

  render() {
    const { objectMetadata } = this.state;
    const { eventsFunction } = this.props;

    const parameters = eventsFunction.getParameters();
    const type = eventsFunction.getFunctionType();

    return (
      <Column noMargin>
        <div style={styles.scrollView}>
          <Column>
            <Line noMargin alignItems="center">
              <img src="res/function32.png" alt="" style={styles.icon} />
              <SelectField
                value={type}
                onChange={(e, i, value) => {
                  eventsFunction.setFunctionType(value);
                  this.forceUpdate();
                }}
              >
                <MenuItem
                  value={gd.EventsFunction.Action}
                  primaryText="Action"
                />
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
                  floatingLabelText="Sentence in events sheet (write _PARAMx_ for parameters, e.g: _PARAM1_)"
                  fullWidth
                  value={eventsFunction.getSentence()}
                  onChange={(e, text) => {
                    eventsFunction.setSentence(text);
                    this.forceUpdate();
                  }}
                />
              ) : null}
            </Line>
          </Column>
          <Line noMargin>
            <ThemeConsumer>
              {muiTheme => (
                <div
                  style={{
                    ...styles.parametersContainer,
                    backgroundColor: muiTheme.list.itemsBackgroundColor,
                  }}
                >
                  {mapVector(
                    parameters,
                    (parameter: gdParameterMetadata, i: number) => {
                      if (i === 0) {
                        // By convention, first parameter is always the runtimeScene
                        // and is not shown in editor.
                        return null;
                      }

                      return (
                        <React.Fragment key={i}>
                          <Column>
                            <Line noMargin expand>
                              <Column noMargin expand>
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
                                  fullWidth
                                />
                              </Column>
                              <Column noMargin expand>
                                <SelectField
                                  hintText="Type"
                                  value={parameter.getType()}
                                  onChange={(e, i, value) => {
                                    parameter.setType(value);
                                    this.forceUpdate();
                                    this.props.onParametersUpdated();
                                  }}
                                  fullWidth
                                >
                                  <MenuItem
                                    value="objectList"
                                    primaryText="Objects"
                                  />
                                  <MenuItem
                                    value="expression"
                                    primaryText="Number"
                                  />
                                  <MenuItem
                                    value="string"
                                    primaryText="String (text)"
                                  />
                                </SelectField>
                              </Column>
                              {parameter.getType() === 'objectList' && (
                                <Column noMargin expand>
                                  <SelectField
                                    value={parameter.getExtraInfo()}
                                    onChange={(e, i, value) => {
                                      parameter.setExtraInfo(value);
                                      this.forceUpdate();
                                      this.props.onParametersUpdated();
                                    }}
                                    fullWidth
                                  >
                                    <MenuItem
                                      value=""
                                      primaryText="Any object"
                                    />
                                    {objectMetadata.map(
                                      (metadata: EnumeratedObjectMetadata) => {
                                        if (metadata.name === '') {
                                          // Base object is an "abstract" object
                                          return null;
                                        }

                                        return (
                                          <MenuItem
                                          key={metadata.name}
                                            value={metadata.name}
                                            primaryText={metadata.fullName}
                                          />
                                        );
                                      }
                                    )}
                                  </SelectField>
                                </Column>
                              )}
                            </Line>
                          </Column>
                          <Line expand noMargin>
                            <Column expand>
                              <TextField
                                hintText="Description"
                                value={parameter.getDescription()}
                                onChange={(e, text) => {
                                  parameter.setDescription(text);
                                  this.forceUpdate();
                                }}
                                fullWidth
                              />
                            </Column>
                            <Column>
                              <IconButton
                                onClick={() => this._removeParameter(i)}
                              >
                                <Delete />
                              </IconButton>
                            </Column>
                          </Line>
                          <Divider />
                        </React.Fragment>
                      );
                    }
                  )}
                  {parameters.size() <= 1 ? (
                    <EmptyMessage>
                      No parameters for this function.
                    </EmptyMessage>
                  ) : null}
                  <Line justifyContent="flex-end">
                    <Column>
                      <FlatButton
                        label="Add a parameter"
                        onClick={this._addParameter}
                      />
                    </Column>
                  </Line>
                </div>
              )}
            </ThemeConsumer>
          </Line>
        </div>
      </Column>
    );
  }
}
