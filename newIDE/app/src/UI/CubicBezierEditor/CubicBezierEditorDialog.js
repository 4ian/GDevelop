// @flow
import * as React from 'react';
import { Trans } from '@lingui/macro';
import Dialog, { DialogPrimaryButton } from '../Dialog';
import FlatButton from '../FlatButton';
import Text from '../Text';
import { Accordion, AccordionBody, AccordionHeader } from '../Accordion';
import { ColumnStackLayout, ResponsiveLineStackLayout } from '../Layout';
import { useResponsiveWindowSize } from '../Responsive/ResponsiveWindowMeasurer';
import { formatCubicBezier, type CubicBezierPoints } from '../../Utils/Easings';
import CubicBezierCurveEditor from './CubicBezierCurveEditor';
import CubicBezierAnimatedPreview from './CubicBezierAnimatedPreview';
import CubicBezierFrame, { getFramedSize } from './CubicBezierFrame';
import CubicBezierPresetGrid, {
  presetGridWidth,
} from './CubicBezierPresetGrid';
import CubicBezierValueFields from './CubicBezierValueFields';
import { useCubicBezierCurveSize } from './UseCubicBezierCurveSize';

type Props = {|
  initialPoints: CubicBezierPoints,
  onApply: (cubicBezier: string) => void,
  onClose: () => void,
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

const CubicBezierEditorDialog = ({
  initialPoints,
  onApply,
  onClose,
}: Props): React.Node => {
  const { isMobile } = useResponsiveWindowSize();
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

  const updateInvalidValueText = (text: string | null) => {
    invalidValueTextRef.current = text;
    setInvalidValueText(text);
  };

  const setCurvePoints = (nextPoints: CubicBezierPoints) => {
    pointsRef.current = nextPoints;
    setPoints(nextPoints);
    updateInvalidValueText(null);
  };

  const apply = () => {
    const element = document.activeElement;
    if (element instanceof HTMLElement) element.blur();
    if (invalidValueTextRef.current !== null) return;
    onApply(formatCubicBezier(pointsRef.current));
  };

  return (
    <Dialog
      open
      title={<Trans>Custom easing curve</Trans>}
      maxWidth="md"
      flexColumnBody
      onRequestClose={onClose}
      onApply={apply}
      actions={[
        <FlatButton
          key="cancel"
          label={<Trans>Cancel</Trans>}
          primary={false}
          onClick={onClose}
        />,
        <DialogPrimaryButton
          key="apply"
          label={<Trans>Apply</Trans>}
          primary
          onClick={apply}
        />,
      ]}
    >
      <ColumnStackLayout>
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
            <CubicBezierPresetGrid points={points} onSelect={setCurvePoints} />
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
  );
};

export default CubicBezierEditorDialog;
