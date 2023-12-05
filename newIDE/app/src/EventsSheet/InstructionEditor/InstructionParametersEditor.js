// @flow
import { Trans } from '@lingui/macro';
import { t } from '@lingui/macro';
import { I18n } from '@lingui/react';
import { type I18n as I18nType } from '@lingui/core';

import * as React from 'react';
import Toggle from '../../UI/Toggle';
import { mapFor } from '../../Utils/MapFor';
import EmptyMessage from '../../UI/EmptyMessage';
import ParameterRenderingService from '../ParameterRenderingService';
import HelpButton from '../../UI/HelpButton';
import { type ResourceManagementProps } from '../../ResourcesList/ResourceSource';
import { Column, Line, Spacer } from '../../UI/Grid';
import AlertMessage from '../../UI/AlertMessage';
import DismissableAlertMessage from '../../UI/DismissableAlertMessage';
import Window from '../../Utils/Window';
import { getExtraInstructionInformation } from '../../Hints';
import DismissableTutorialMessage from '../../Hints/DismissableTutorialMessage';
import { isAnEventFunctionMetadata } from '../../EventsFunctionsExtensionsLoader';
import { type EventsScope } from '../../InstructionOrExpression/EventsScope.flow';
import { getObjectParameterIndex } from '../../InstructionOrExpression/EnumerateInstructions';
import Text from '../../UI/Text';
import { getInstructionMetadata } from './InstructionEditor';
import { ColumnStackLayout } from '../../UI/Layout';
import { setupInstructionParameters } from '../../InstructionOrExpression/SetupInstructionParameters';
import ScrollView from '../../UI/ScrollView';
import { getInstructionTutorialIds } from '../../Utils/GDevelopServices/Tutorial';
import useForceUpdate from '../../Utils/UseForceUpdate';
import GDevelopThemeContext from '../../UI/Theme/GDevelopThemeContext';
import FlatButton from '../../UI/FlatButton';
import {
  type ParameterFieldInterface,
  type FieldFocusFunction,
} from '../ParameterFields/ParameterFieldCommons';
import Edit from '../../UI/CustomSvgIcons/Edit';

const gd: libGDevelop = global.gd;

const styles = {
  // When displaying the empty message, center the message:
  emptyContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  parametersContainer: {
    flex: 1,
  },
  icon: {
    width: 24,
    height: 24,
    marginRight: 8,
    paddingTop: 6,
    flexShrink: 0,
  },
  invertToggle: {
    marginTop: 8,
  },
  description: {
    whiteSpace: 'pre-wrap',
  },
};

export type InstructionParametersEditorInterface = {|
  focus: FieldFocusFunction,
|};

type Props = {|
  project: gdProject,
  scope: EventsScope,
  globalObjectsContainer: gdObjectsContainer,
  objectsContainer: gdObjectsContainer,
  objectName?: ?string,
  instruction: gdInstruction,
  isCondition: boolean,
  focusOnMount?: boolean,
  resourceManagementProps: ResourceManagementProps,
  style?: Object,
  openInstructionOrExpression: (
    extension: gdPlatformExtension,
    type: string
  ) => void,
  noHelpButton?: boolean,
|};

const isParameterVisible = (
  parameterMetadata: gdParameterMetadata,
  parameterIndex: number,
  objectParameterIndex: ?number
) => {
  // Hide parameters that are used only for code generation
  if (parameterMetadata.isCodeOnly()) return false;

  // For objects, hide the first object parameter, which is by convention the object name.
  if (parameterIndex === objectParameterIndex) return false;

  return true;
};

const InstructionParametersEditor = React.forwardRef<
  Props,
  InstructionParametersEditorInterface
>(
  (
    {
      instruction,
      project,
      globalObjectsContainer,
      objectsContainer,
      noHelpButton,
      objectName,
      isCondition,
      scope,
      focusOnMount,
      style,
      openInstructionOrExpression,
      resourceManagementProps,
    },
    ref
  ) => {
    const firstVisibleField = React.useRef<?ParameterFieldInterface>(null);
    const [isDirty, setIsDirty] = React.useState<boolean>(false);
    const {
      palette: { type: paletteType },
    } = React.useContext(GDevelopThemeContext);

    const forceUpdate = useForceUpdate();

    const focus: FieldFocusFunction = React.useCallback(
      options => {
        // Verify that there is a field to focus.
        if (
          getVisibleParametersCount(
            getInstructionMetadata({
              instructionType: instruction.getType(),
              isCondition,
              project,
            }),
            objectName
          ) !== 0
        ) {
          if (firstVisibleField.current && firstVisibleField.current.focus) {
            firstVisibleField.current.focus(options);
          }
        }
      },
      [project, objectName, instruction, isCondition]
    );

    React.useImperativeHandle(ref, () => ({
      focus,
    }));

    const getVisibleParametersCount = (
      instructionMetadata: ?gdInstructionMetadata,
      objectName: ?string
    ) => {
      if (!instructionMetadata) return 0;

      const objectParameterIndex = objectName
        ? getObjectParameterIndex(instructionMetadata)
        : -1;

      return mapFor(0, instructionMetadata.getParametersCount(), i => {
        if (!instructionMetadata) return false;
        const parameterMetadata = instructionMetadata.getParameter(i);

        return isParameterVisible(parameterMetadata, i, objectParameterIndex);
      }).filter(isVisible => isVisible).length;
    };

    const openExtension = (i18n: I18nType) => {
      if (isDirty) {
        const answer = Window.showConfirmDialog(
          i18n._(
            t`You've made some changes here. Are you sure you want to discard them and open the function?`
          )
        );
        if (!answer) return;
      }

      const instructionType = instruction.getType();
      if (!instructionType) return null;

      const extension = isCondition
        ? gd.MetadataProvider.getExtensionAndConditionMetadata(
            project.getCurrentPlatform(),
            instructionType
          ).getExtension()
        : gd.MetadataProvider.getExtensionAndActionMetadata(
            project.getCurrentPlatform(),
            instructionType
          ).getExtension();

      openInstructionOrExpression(extension, instructionType);
    };

    const renderEmpty = () => {
      return <div style={{ ...styles.emptyContainer, ...style }} />;
    };

    React.useEffect(
      () => {
        if (focusOnMount) {
          const timeoutId = setTimeout(() => {
            focus();
          }, 300); // Let the time to the dialog that is potentially containing the InstructionParametersEditor to finish its transition.
          return () => clearTimeout(timeoutId);
        }
      },
      [focus, focusOnMount]
    );

    const instructionType = instruction.getType();
    const instructionMetadata = getInstructionMetadata({
      instructionType,
      isCondition,
      project,
    });
    if (!instructionMetadata) return renderEmpty();

    const helpPage = instructionMetadata.getHelpPath();
    const instructionExtraInformation = getExtraInstructionInformation(
      instructionType
    );
    const tutorialIds = getInstructionTutorialIds(instructionType);
    const objectParameterIndex = objectName
      ? getObjectParameterIndex(instructionMetadata)
      : -1;

    setupInstructionParameters(
      globalObjectsContainer,
      objectsContainer,
      instruction,
      instructionMetadata,
      objectName
    );

    // For some reason, iconFileName can sometimes be undefined. see https://github.com/4ian/GDevelop/issues/5958.
    const iconFilename = instructionMetadata.getIconFilename() || '';
    const shouldInvertGrayScale =
      paletteType === 'dark' &&
      (iconFilename.startsWith('data:image/svg+xml') ||
        iconFilename.includes('_black'));

    let parameterFieldIndex = 0;
    return (
      <I18n>
        {({ i18n }) => (
          <ScrollView autoHideScrollbar>
            <Column expand>
              <Line alignItems="flex-start">
                <img
                  src={iconFilename}
                  alt=""
                  style={{
                    ...styles.icon,
                    filter: shouldInvertGrayScale
                      ? 'grayscale(1) invert(1)'
                      : undefined,
                  }}
                />
                <Column expand>
                  <Text style={styles.description}>
                    {instructionMetadata.getDescription()}
                  </Text>
                </Column>
              </Line>
              {instructionExtraInformation && (
                <Line>
                  {instructionExtraInformation.identifier === undefined ? (
                    <AlertMessage kind={instructionExtraInformation.kind}>
                      {i18n._(instructionExtraInformation.message)}
                    </AlertMessage>
                  ) : (
                    <DismissableAlertMessage
                      kind={instructionExtraInformation.kind}
                      identifier={instructionExtraInformation.identifier}
                    >
                      {i18n._(instructionExtraInformation.message)}
                    </DismissableAlertMessage>
                  )}
                </Line>
              )}
              {tutorialIds.length ? (
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
              <Spacer />
              <div
                key={instructionType}
                style={styles.parametersContainer}
                id="instruction-parameters-container"
              >
                <ColumnStackLayout noMargin>
                  {mapFor(0, instructionMetadata.getParametersCount(), i => {
                    const parameterMetadata = instructionMetadata.getParameter(
                      i
                    );
                    if (
                      !isParameterVisible(
                        parameterMetadata,
                        i,
                        objectParameterIndex
                      )
                    )
                      return null;

                    const parameterMetadataType = parameterMetadata.getType();
                    const ParameterComponent = ParameterRenderingService.getParameterComponent(
                      parameterMetadataType
                    );

                    // Track the field count on screen, to affect the ref to the
                    // first visible field.
                    const isFirstVisibleParameterField =
                      parameterFieldIndex === 0;
                    parameterFieldIndex++;

                    return (
                      <ParameterComponent
                        instructionMetadata={instructionMetadata}
                        instruction={instruction}
                        parameterMetadata={parameterMetadata}
                        parameterIndex={i}
                        value={instruction.getParameter(i).getPlainString()}
                        onChange={value => {
                          if (
                            instruction.getParameter(i).getPlainString() !==
                            value
                          ) {
                            instruction.setParameter(i, value);
                            setIsDirty(true);
                            forceUpdate();
                          }
                        }}
                        project={project}
                        scope={scope}
                        globalObjectsContainer={globalObjectsContainer}
                        objectsContainer={objectsContainer}
                        key={i}
                        parameterRenderingService={ParameterRenderingService}
                        resourceManagementProps={resourceManagementProps}
                        ref={field => {
                          if (isFirstVisibleParameterField) {
                            firstVisibleField.current = field;
                          }
                        }}
                      />
                    );
                  })}
                </ColumnStackLayout>
                {getVisibleParametersCount(instructionMetadata, objectName) ===
                  0 && (
                  <EmptyMessage>
                    <Trans>There is nothing to configure.</Trans>
                  </EmptyMessage>
                )}
                {isCondition && (
                  <Toggle
                    label={<Trans>Invert condition</Trans>}
                    labelPosition="right"
                    toggled={instruction.isInverted()}
                    style={styles.invertToggle}
                    onToggle={(e, enabled) => {
                      instruction.setInverted(enabled);
                      forceUpdate();
                    }}
                  />
                )}
                {instructionMetadata.isOptionallyAsync() && (
                  <Toggle
                    label={
                      <Trans>
                        Wait for the action to end before executing the actions
                        (and subevents) following it
                      </Trans>
                    }
                    labelPosition="right"
                    toggled={instruction.isAwaited()}
                    style={styles.invertToggle}
                    onToggle={(e, enabled) => {
                      instruction.setAwaited(enabled);
                      forceUpdate();
                    }}
                  />
                )}
                {isAnEventFunctionMetadata(instructionMetadata) && (
                  <Line>
                    <FlatButton
                      key={'open-extension'}
                      label={
                        isCondition ? (
                          <Trans>Edit this condition events</Trans>
                        ) : (
                          <Trans>Edit this action events</Trans>
                        )
                      }
                      onClick={() => {
                        openExtension(i18n);
                      }}
                      leftIcon={<Edit />}
                    />
                  </Line>
                )}
              </div>
              <Line>
                {!noHelpButton && helpPage && (
                  <HelpButton
                    helpPagePath={instructionMetadata.getHelpPath()}
                    label={
                      isCondition ? (
                        <Trans>Help for this condition</Trans>
                      ) : (
                        <Trans>Help for this action</Trans>
                      )
                    }
                  />
                )}
              </Line>
            </Column>
          </ScrollView>
        )}
      </I18n>
    );
  }
);

export default InstructionParametersEditor;
