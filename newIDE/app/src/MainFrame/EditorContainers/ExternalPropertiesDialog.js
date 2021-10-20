// @flow
import { Trans } from '@lingui/macro';
import * as React from 'react';
import FlatButton from '../../UI/FlatButton';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import Dialog from '../../UI/Dialog';
import { mapFor } from '../../Utils/MapFor';
import Text from '../../UI/Text';
import BackgroundText from '../../UI/BackgroundText';
import { Line, Column } from '../../UI/Grid';

const previewRenderingTypes = [
  {
    value: 'KEEP_SCENE_OBJECTS',
    text:
      'Inside the scene (the scene objects will be created as well - recommended)',
  },
  {
    value: 'CLEAR_SCENE_OBJECTS',
    text: 'Standalone (the scene objects will not be created)',
  },
];

export type ExternalProperties = {|
  layoutName: string,
  previewRenderingType?: string,
|};

type Props = {|
  open: boolean,
  onChoose: ExternalProperties => void,
  layoutName?: ?string,
  previewRenderingType?: ?string,
  onClose: () => void,
  project: gdProject,
  title?: React.Node,
  helpText?: React.Node,
  allowPreviewRenderingTypeSelection?: boolean,
|};

/**
 * Update the title bar according to the project and the current theme.
 */
export default function ExternalPropertiesDialog({
  open,
  onChoose,
  layoutName,
  previewRenderingType,
  onClose,
  project,
  title,
  helpText,
  allowPreviewRenderingTypeSelection,
}: Props) {
  const initialLayoutName = layoutName || '';
  const [selectedLayoutName, setSelectedLayoutName] = React.useState<string>(
    initialLayoutName
  );
  const initialPreviewRenderingType = previewRenderingType || '';
  const [
    selectedPreviewRenderingType,
    setSelectedPreviewRenderingType,
  ] = React.useState<string>(initialPreviewRenderingType);

  const onClick = React.useCallback(
    () => {
      const externalProperties: ExternalProperties = {
        layoutName: selectedLayoutName,
      };
      if (allowPreviewRenderingTypeSelection) {
        externalProperties.previewRenderingType = selectedPreviewRenderingType;
      }
      onChoose(externalProperties);
    },
    [
      onChoose,
      selectedLayoutName,
      selectedPreviewRenderingType,
      allowPreviewRenderingTypeSelection,
    ]
  );

  const actions = [
    <FlatButton
      key="cancel"
      label={<Trans>Cancel</Trans>}
      primary={false}
      onClick={onClose}
    />,
    <FlatButton
      key="choose"
      label={<Trans>Choose</Trans>}
      primary
      keyboardFocused
      onClick={onClick}
      disabled={!selectedLayoutName}
    />,
  ];

  const layoutNames = mapFor(0, project.getLayoutsCount(), i => {
    return project.getLayoutAt(i).getName();
  });

  return (
    <Dialog
      actions={actions}
      open={open}
      title={title}
      onRequestClose={onClose}
      cannotBeDismissed={false}
      maxWidth="sm"
    >
      <Column>
        {helpText && (
          <Line>
            <BackgroundText>{helpText}</BackgroundText>
          </Line>
        )}
        <Line>
          <Text>
            <Trans>Choose the associated scene</Trans>
          </Text>
        </Line>
        <RadioGroup
          aria-label="Associated scene"
          name="associated-layout"
          value={selectedLayoutName}
          onChange={event => setSelectedLayoutName(event.target.value)}
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
      </Column>
      {allowPreviewRenderingTypeSelection && (
        <Column>
          <Line>
            <Text>
              <Trans>Choose the preview rendering type</Trans>
            </Text>
          </Line>
          <RadioGroup
            aria-label="Preview rendering type"
            name="preview-rendering-type"
            value={selectedPreviewRenderingType}
            onChange={event =>
              setSelectedPreviewRenderingType(event.target.value)
            }
          >
            {previewRenderingTypes.map(type => (
              <FormControlLabel
                key={type.value}
                value={type.value}
                control={<Radio color="primary" />}
                label={type.text}
              />
            ))}
          </RadioGroup>
        </Column>
      )}
    </Dialog>
  );
}
