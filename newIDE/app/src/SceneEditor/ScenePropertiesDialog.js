// @flow
import { Trans } from '@lingui/macro';

import React, { Component } from 'react';
import TextField from '../UI/TextField';
import RaisedButton from '../UI/RaisedButton';
import Dialog, { DialogPrimaryButton } from '../UI/Dialog';
import ColorField from '../UI/ColorField';
import EmptyMessage from '../UI/EmptyMessage';
import BehaviorSharedPropertiesEditor from './BehaviorSharedPropertiesEditor';
import propertiesMapToSchema from '../PropertiesEditor/PropertiesMapToSchema';
import some from 'lodash/some';
import Checkbox from '../UI/Checkbox';
import { isNullPtr } from '../Utils/IsNullPtr';
import { ColumnStackLayout } from '../UI/Layout';
import {
  rgbColorToRGBString,
  rgbStringAndAlphaToRGBColor,
  type RGBColor,
} from '../Utils/ColorTransformer';
import HelpIcon from '../UI/HelpIcon';
import { Column, Line } from '../UI/Grid';
import DismissableTutorialMessage from '../Hints/DismissableTutorialMessage';
import { Accordion, AccordionHeader, AccordionBody } from '../UI/Accordion';
import { IconContainer } from '../UI/IconContainer';
import { getBehaviorTutorialIds } from '../Utils/GDevelopServices/Tutorial';
import ScrollView from '../UI/ScrollView';
import { type ResourceManagementProps } from '../ResourcesList/ResourceSource';

const gd: libGDevelop = global.gd;

type Props = {|
  open: boolean,
  layout: gdLayout,
  project: gdProject,
  onApply: () => void,
  onClose: () => void,
  onOpenMoreSettings?: ?() => void,
  onEditVariables: () => void,
  resourceManagementProps: ResourceManagementProps,
|};

type State = {|
  windowTitle: string,
  shouldStopSoundsOnStartup: boolean,
  backgroundColor: ?RGBColor,
|};

export default class ScenePropertiesDialog extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = this._loadFrom(props.layout);
  }

  _loadFrom(layout: gdLayout): State {
    return {
      windowTitle: layout.getWindowDefaultTitle(),
      shouldStopSoundsOnStartup: layout.stopSoundsOnStartup(),
      backgroundColor: {
        r: layout.getBackgroundColorRed(),
        g: layout.getBackgroundColorGreen(),
        b: layout.getBackgroundColorBlue(),
        a: 1,
      },
    };
  }

  // To be updated, see https://reactjs.org/docs/react-component.html#unsafe_componentwillreceiveprops.
  UNSAFE_componentWillReceiveProps(newProps: Props) {
    if (
      (!this.props.open && newProps.open) ||
      (newProps.open && this.props.layout !== newProps.layout)
    ) {
      this.setState(this._loadFrom(newProps.layout));
    }
  }

  _onApply = () => {
    this.props.layout.setWindowDefaultTitle(this.state.windowTitle);
    this.props.layout.setStopSoundsOnStartup(
      this.state.shouldStopSoundsOnStartup
    );
    this.props.layout.setBackgroundColor(
      this.state.backgroundColor ? this.state.backgroundColor.r : 0,
      this.state.backgroundColor ? this.state.backgroundColor.g : 0,
      this.state.backgroundColor ? this.state.backgroundColor.b : 0
    );
    this.props.onApply();
  };

  render() {
    const { layout } = this.props;
    const actions = [
      // TODO: Add support for cancelling modifications made to BehaviorSharedData
      // (either by enhancing a function like propertiesMapToSchema or using copies)
      // and then re-enable cancel button.
      // <FlatButton
      //   label={<Trans>Cancel</Trans>}
      //   primary={false}
      //   onClick={this.props.onClose}
      // />,
      <DialogPrimaryButton
        label={<Trans>Ok</Trans>}
        key="ok"
        primary={true}
        onClick={this._onApply}
      />,
    ];

    const allBehaviorSharedDataNames = layout
      .getAllBehaviorSharedDataNames()
      .toJSArray();

    const propertiesEditors = allBehaviorSharedDataNames
      .map(behaviorName => {
        const behaviorSharedData = layout.getBehaviorSharedData(behaviorName);

        if (isNullPtr(gd, behaviorSharedData)) return null;

        const properties = behaviorSharedData.getProperties();
        const propertiesSchema = propertiesMapToSchema(
          properties,
          sharedDataContent => behaviorSharedData.getProperties(),
          (sharedDataContent, name, value) => {
            behaviorSharedData.updateProperty(name, value);
          }
        );
        const behaviorTypeName = behaviorSharedData.getTypeName();

        const behaviorMetadata = gd.MetadataProvider.getBehaviorMetadata(
          gd.JsPlatform.get(),
          behaviorTypeName
        );
        const tutorialIds = getBehaviorTutorialIds(behaviorTypeName);
        // TODO Make this a functional component to use PreferencesContext
        const enabledTutorialIds = [];
        const iconUrl = behaviorMetadata.getIconFilename();

        return (
          !!propertiesSchema.length && (
            <Accordion
              key={behaviorName}
              defaultExpanded
              id={`behavior-parameters-${behaviorName}`}
            >
              <AccordionHeader
                actions={[
                  <HelpIcon
                    key="help"
                    size="small"
                    helpPagePath={behaviorMetadata.getHelpPath()}
                  />,
                ]}
              >
                {iconUrl ? (
                  <IconContainer
                    src={iconUrl}
                    alt={behaviorMetadata.getFullName()}
                    size={20}
                  />
                ) : null}
                <Column expand>
                  <TextField
                    value={behaviorName}
                    margin="none"
                    fullWidth
                    disabled
                    onChange={(e, text) => {}}
                    id={`behavior-${behaviorName}-name-text-field`}
                  />
                </Column>
              </AccordionHeader>
              <AccordionBody>
                <Column
                  expand
                  noMargin
                  // Avoid Physics2 behavior overflow on small screens
                  noOverflowParent
                >
                  {enabledTutorialIds.length ? (
                    <Line>
                      <ColumnStackLayout expand>
                        {tutorialIds.map(tutorialId => (
                          <DismissableTutorialMessage
                            key={tutorialId}
                            tutorialId={tutorialId}
                          />
                        ))}
                      </ColumnStackLayout>
                    </Line>
                  ) : null}
                  <Line>
                    <BehaviorSharedPropertiesEditor
                      key={behaviorName}
                      behaviorSharedData={behaviorSharedData}
                      project={this.props.project}
                      resourceManagementProps={
                        this.props.resourceManagementProps
                      }
                    />
                  </Line>
                </Column>
              </AccordionBody>
            </Accordion>
          )
        );
      })
      .filter(Boolean);

    return (
      <Dialog
        title={<Trans>Scene properties</Trans>}
        actions={actions}
        secondaryActions={[
          <RaisedButton
            key="edit-scene-variables"
            label={<Trans>Edit scene variables</Trans>}
            fullWidth
            onClick={() => {
              this.props.onEditVariables();
              this.props.onClose();
            }}
          />,
        ]}
        onRequestClose={this.props.onClose}
        onApply={this._onApply}
        open={this.props.open}
        maxWidth="sm"
      >
        <ScrollView>
          <ColumnStackLayout expand noMargin>
            <TextField
              floatingLabelText={<Trans>Window title</Trans>}
              fullWidth
              type="text"
              value={this.state.windowTitle}
              onChange={(e, value) => this.setState({ windowTitle: value })}
            />
            <Checkbox
              checked={this.state.shouldStopSoundsOnStartup}
              label={<Trans>Stop music and sounds on startup</Trans>}
              onCheck={(e, check) =>
                this.setState({
                  shouldStopSoundsOnStartup: check,
                })
              }
            />
            <ColorField
              floatingLabelText={<Trans>Scene background color</Trans>}
              fullWidth
              disableAlpha
              color={rgbColorToRGBString(this.state.backgroundColor)}
              onChange={color =>
                this.setState({
                  backgroundColor: rgbStringAndAlphaToRGBColor(color),
                })
              }
            />
            {!some(propertiesEditors) && (
              <EmptyMessage>
                <Trans>
                  Any additional properties will appear here if you add
                  behaviors to objects, like Physics behavior.
                </Trans>
              </EmptyMessage>
            )}
            {propertiesEditors}
            {this.props.onOpenMoreSettings && (
              <RaisedButton
                label={<Trans>Open advanced settings</Trans>}
                fullWidth
                onClick={() => {
                  if (this.props.onOpenMoreSettings)
                    this.props.onOpenMoreSettings();
                  this.props.onClose();
                }}
              />
            )}
          </ColumnStackLayout>
        </ScrollView>
      </Dialog>
    );
  }
}
