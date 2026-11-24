// @flow
import * as React from 'react';
import { Trans, t } from '@lingui/macro';
import { I18n } from '@lingui/react';
import { type MessageDescriptor } from '../../Utils/i18n/MessageDescriptor.flow';
import Dialog, { DialogPrimaryButton } from '../Dialog';
import FlatButton from '../FlatButton';
import Text from '../Text';
import TextField from '../TextField';
import AlertMessage from '../AlertMessage';
import { Accordion, AccordionBody, AccordionHeader } from '../Accordion';
import { ColumnStackLayout, ResponsiveLineStackLayout } from '../Layout';
import { useResponsiveWindowSize } from '../Responsive/ResponsiveWindowMeasurer';
import { formatCubicBezier, type CubicBezierPoints } from '../../Utils/Easings';
import {
  findNamedEasingNameWithSamePoints,
  validateNamedEasingName,
} from '../../Utils/NamedEasings';
import useAlertDialog from '../Alert/useAlertDialog';
import CubicBezierCurveEditor from './CubicBezierCurveEditor';
import CubicBezierAnimatedPreview from './CubicBezierAnimatedPreview';
import CubicBezierFrame, { getFramedSize } from './CubicBezierFrame';
import CubicBezierPresetGrid, {
  presetGridWidth,
} from './CubicBezierPresetGrid';
import CubicBezierValueFields from './CubicBezierValueFields';
import { useCubicBezierCurveSize } from './UseCubicBezierCurveSize';

export type NamedEasingEditorProps = {|
  name: string,
  onApplyNamedEasing: (name: string, cubicBezier: string) => void,
  onDeleteNamedEasing: () => void,
  onDetachAsCustomCurve?: (cubicBezier: string) => void,
|};

type Props = {|
  initialPoints: CubicBezierPoints,
  onApply: (cubicBezier: string) => void,
  onClose: () => void,
  existingNamedEasingNames?: Array<string>,
  existingNamedEasingPointsByName?: { [string]: CubicBezierPoints },
  onSaveAsNamedEasing?: (name: string, cubicBezier: string) => void,
  namedEasing?: ?NamedEasingEditorProps,
|};

const presetFrameWidth = getFramedSize(presetGridWidth);

const styles = {
  presetFrame: {
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  previewBody: {
    width: '100%',
    minWidth: 0,
  },
};

const NamedEasingFields = ({
  name,
  nameError,
  onChangeName,
  showSharedDefinitionWarning,
  autoFocus,
}: {|
  name: string,
  nameError: ?MessageDescriptor,
  onChangeName: string => void,
  showSharedDefinitionWarning: boolean,
  autoFocus?: 'desktop' | 'desktopAndMobileDevices',
|}): React.Node => (
  <I18n>
    {({ i18n }) => (
      <ColumnStackLayout noMargin>
        {showSharedDefinitionWarning ? (
          <AlertMessage kind="info">
            <Trans>
              Changing this named easing updates every event that uses it.
            </Trans>
          </AlertMessage>
        ) : null}
        <TextField
          floatingLabelText={<Trans>Name</Trans>}
          value={name}
          onChange={(event, text) => onChangeName(text)}
          errorText={nameError ? i18n._(nameError) : undefined}
          fullWidth
          autoFocus={autoFocus}
        />
      </ColumnStackLayout>
    )}
  </I18n>
);

const CubicBezierEditorDialog = ({
  initialPoints,
  onApply,
  onClose,
  existingNamedEasingNames = [],
  existingNamedEasingPointsByName = {},
  onSaveAsNamedEasing,
  namedEasing,
}: Props): React.Node => {
  const { isMobile } = useResponsiveWindowSize();
  const { showConfirmation } = useAlertDialog();
  const { graphFrameRef, curveSize } = useCubicBezierCurveSize({
    isMobile,
    besideWidth: presetFrameWidth,
  });
  const framedCurveSize = getFramedSize(curveSize);

  // Refs are read by `apply`, right after blurring a field synchronously
  // commits it, before React re-renders.
  const [points, setPoints] = React.useState<CubicBezierPoints>(initialPoints);
  const pointsRef = React.useRef<CubicBezierPoints>(initialPoints);
  const [invalidValueText, setInvalidValueText] = React.useState<string | null>(
    null
  );
  const invalidValueTextRef = React.useRef<string | null>(null);
  const [playToken, setPlayToken] = React.useState(0);
  const [name, setName] = React.useState<string>(
    namedEasing ? namedEasing.name : ''
  );
  const [isSaveAsDialogOpen, setIsSaveAsDialogOpen] = React.useState(false);
  const [hasSavedAsNamedEasing, setHasSavedAsNamedEasing] = React.useState(
    false
  );

  const updateInvalidValueText = (text: string | null) => {
    invalidValueTextRef.current = text;
    setInvalidValueText(text);
  };

  const setCurvePoints = (nextPoints: CubicBezierPoints) => {
    pointsRef.current = nextPoints;
    setPoints(nextPoints);
    updateInvalidValueText(null);
  };

  const nameError = validateNamedEasingName(name, {
    existingNames: existingNamedEasingNames,
    ignoredName: namedEasing ? namedEasing.name : undefined,
  });
  // An empty name is only an error once a named easing exists.
  const displayedNameError = namedEasing || name.trim() ? nameError : null;

  const commitPointsIfValid = (): ?string => {
    const element = document.activeElement;
    if (element instanceof HTMLElement) element.blur();
    if (invalidValueTextRef.current !== null) return null;
    return formatCubicBezier(pointsRef.current);
  };

  const apply = () => {
    const cubicBezier = commitPointsIfValid();
    if (!cubicBezier) return;
    if (namedEasing) {
      if (nameError) return;
      namedEasing.onApplyNamedEasing(name.trim(), cubicBezier);
      return;
    }
    onApply(cubicBezier);
  };

  const duplicateCurveName = findNamedEasingNameWithSamePoints(
    points,
    existingNamedEasingPointsByName,
    namedEasing ? namedEasing.name : undefined
  );

  const closeSaveAsDialog = () => {
    setIsSaveAsDialogOpen(false);
    if (!namedEasing) setName('');
  };

  const openSaveAsDialog = () => {
    if (!commitPointsIfValid()) return;
    setName('');
    setIsSaveAsDialogOpen(true);
  };

  const saveAsNamedEasing = () => {
    const cubicBezier = commitPointsIfValid();
    if (!cubicBezier || !onSaveAsNamedEasing || nameError) return;
    const savedName = name.trim();
    onSaveAsNamedEasing(savedName, cubicBezier);
    setHasSavedAsNamedEasing(true);
    setIsSaveAsDialogOpen(false);
    setName(savedName);
  };

  const namedEasingName = namedEasing ? namedEasing.name : null;
  React.useEffect(
    () => {
      if (namedEasingName) {
        setName(namedEasingName);
      }
    },
    [namedEasingName]
  );

  const onDetachAsCustomCurve = namedEasing
    ? namedEasing.onDetachAsCustomCurve
    : null;
  const detachAsCustomCurve = () => {
    if (!onDetachAsCustomCurve) return;
    const cubicBezier = commitPointsIfValid();
    if (!cubicBezier) return;
    onDetachAsCustomCurve(cubicBezier);
    onClose();
  };

  const deleteNamedEasing = async () => {
    if (!namedEasing) return;
    const confirmed = await showConfirmation({
      title: t`Delete named easing`,
      message: t`Delete this named easing? Events that still use it will keep the name and show a warning.`,
      confirmButtonLabel: t`Delete`,
      level: 'warning',
    });
    if (!confirmed) return;
    namedEasing.onDeleteNamedEasing();
    onClose();
  };

  const secondaryActions: Array<?React.Node> | void = namedEasing
    ? [
        <FlatButton
          key="delete-named-easing"
          label={<Trans>Delete</Trans>}
          primary={false}
          onClick={deleteNamedEasing}
        />,
        onDetachAsCustomCurve ? (
          <FlatButton
            key="detach-as-custom-curve"
            label={<Trans>Detach as custom curve</Trans>}
            primary={false}
            onClick={detachAsCustomCurve}
          />
        ) : null,
      ]
    : onSaveAsNamedEasing
    ? [
        <FlatButton
          key="save-as-named-easing"
          label={<Trans>Save as named easing...</Trans>}
          primary={false}
          onClick={openSaveAsDialog}
        />,
      ]
    : undefined;

  return (
    <>
      <Dialog
        open
        title={
          namedEasing ? (
            <Trans>Named easing</Trans>
          ) : (
            <Trans>Custom easing curve</Trans>
          )
        }
        maxWidth="md"
        flexColumnBody
        onRequestClose={onClose}
        onApply={apply}
        secondaryActions={secondaryActions}
        actions={[
          <FlatButton
            key="cancel"
            label={
              hasSavedAsNamedEasing ? (
                <Trans>Close</Trans>
              ) : (
                <Trans>Cancel</Trans>
              )
            }
            primary={false}
            onClick={onClose}
          />,
          <DialogPrimaryButton
            key="apply"
            label={<Trans>Apply</Trans>}
            primary
            disabled={!!namedEasing && !!nameError}
            onClick={apply}
          />,
        ]}
      >
        <ColumnStackLayout>
          {namedEasing ? (
            <NamedEasingFields
              name={name}
              nameError={displayedNameError}
              onChangeName={setName}
              showSharedDefinitionWarning
            />
          ) : null}
          <ResponsiveLineStackLayout alignItems="flex-start" noMargin>
            <CubicBezierFrame
              ref={graphFrameRef}
              style={
                isMobile
                  ? { flexShrink: 0, width: 'fit-content' }
                  : { flex: '1 1 0px', minWidth: 200 }
              }
            >
              <CubicBezierCurveEditor
                points={points}
                onChange={setCurvePoints}
                onRelease={() => setPlayToken(token => token + 1)}
                size={curveSize}
              />
            </CubicBezierFrame>
            <CubicBezierFrame
              style={{
                ...styles.presetFrame,
                height: framedCurveSize,
                ...(isMobile
                  ? { flexShrink: 0, width: '100%' }
                  : {
                      flex: `0 1 ${presetFrameWidth}px`,
                      width: presetFrameWidth,
                      maxWidth: '100%',
                      minWidth: 0,
                    }),
              }}
            >
              <CubicBezierPresetGrid
                points={points}
                onSelect={setCurvePoints}
              />
            </CubicBezierFrame>
          </ResponsiveLineStackLayout>
          <CubicBezierFrame>
            <CubicBezierValueFields
              points={points}
              invalidValueText={invalidValueText}
              onChangePoints={setCurvePoints}
              onInvalidValue={updateInvalidValueText}
            />
          </CubicBezierFrame>
          <CubicBezierFrame>
            <Accordion noMargin defaultExpanded>
              <AccordionHeader noMargin>
                <Text noMargin>
                  <Trans>Preview</Trans>
                </Text>
              </AccordionHeader>
              <AccordionBody>
                <div style={styles.previewBody}>
                  <CubicBezierAnimatedPreview
                    points={points}
                    playToken={playToken}
                  />
                </div>
              </AccordionBody>
            </Accordion>
          </CubicBezierFrame>
        </ColumnStackLayout>
      </Dialog>
      {isSaveAsDialogOpen && onSaveAsNamedEasing ? (
        <Dialog
          open
          id="save-as-named-easing-dialog"
          title={<Trans>Save as named easing</Trans>}
          maxWidth="xs"
          onRequestClose={closeSaveAsDialog}
          onApply={saveAsNamedEasing}
          actions={[
            <FlatButton
              key="cancel"
              label={<Trans>Cancel</Trans>}
              primary={false}
              onClick={closeSaveAsDialog}
            />,
            <DialogPrimaryButton
              key="save"
              id="confirm-save-as-named-easing"
              label={<Trans>Save</Trans>}
              primary
              disabled={!!nameError}
              onClick={saveAsNamedEasing}
            />,
          ]}
        >
          <ColumnStackLayout>
            {duplicateCurveName ? (
              <AlertMessage kind="warning">
                <Trans>
                  This curve is already saved as {duplicateCurveName}.
                </Trans>
              </AlertMessage>
            ) : null}
            <NamedEasingFields
              name={name}
              nameError={displayedNameError}
              onChangeName={setName}
              showSharedDefinitionWarning={false}
              autoFocus="desktopAndMobileDevices"
            />
          </ColumnStackLayout>
        </Dialog>
      ) : null}
    </>
  );
};

export default CubicBezierEditorDialog;
