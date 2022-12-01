// @flow
import * as React from 'react';
import { Column, Line } from '../../../UI/Grid';
import { useResponsiveWindowWidth } from '../../../UI/Reponsive/ResponsiveWindowMeasurer';
import Text from '../../../UI/Text';
import ArrowLeft from '../../../UI/CustomSvgIcons/ArrowLeft';
import TextButton from '../../../UI/TextButton';
import { Trans } from '@lingui/macro';
import Paper from '../../../UI/Paper';

export const SECTION_PADDING = 30;

const styles = {
  mobileScrollContainer: {
    paddingTop: 10,
    paddingLeft: 5,
    paddingRight: 5,
  },
  desktopScrollContainer: {
    paddingTop: SECTION_PADDING,
    paddingLeft: SECTION_PADDING,
    paddingRight: SECTION_PADDING,
  },
  mobileFooter: {
    padding: 5,
  },
  desktopFooter: {
    paddingLeft: SECTION_PADDING,
  },
  rowContainer: {
    display: 'flex',
    flexDirection: 'column',
    paddingBottom: SECTION_PADDING,
  },
  scrollContainer: {
    flex: 1,
    overflowY: 'auto',
  },
};

type Props = {|
  children: React.Node,
  title: React.Node,
  subtitleText?: React.Node,
  renderSubtitle?: () => React.Node,
  backAction?: () => void,
  flexBody?: boolean,
  renderFooter?: () => React.Node,
|};

const SectionContainer = ({
  children,
  title,
  subtitleText,
  renderSubtitle,
  backAction,
  flexBody,
  renderFooter,
}: Props) => {
  const windowWidth = useResponsiveWindowWidth();

  return (
    <Column useFullHeight noMargin expand>
      <Paper
        style={{
          ...styles.scrollContainer,
          display: flexBody ? 'flex' : 'block',
          ...(windowWidth === 'small'
            ? styles.mobileScrollContainer
            : styles.desktopScrollContainer),
        }}
        square
        background="dark"
      >
        <Column expand>
          <SectionRow>
            {backAction && (
              <Line>
                <TextButton
                  onClick={backAction}
                  icon={<ArrowLeft fontSize="small" />}
                  label={<Trans>Back</Trans>}
                />
              </Line>
            )}
            <Line noMargin>
              <Text size="bold-title" noMargin>
                {title}
              </Text>
            </Line>
            {subtitleText && (
              <Line noMargin>
                <Text noMargin>{subtitleText}</Text>
              </Line>
            )}
            {renderSubtitle && renderSubtitle()}
          </SectionRow>
          {children}
        </Column>
      </Paper>
      {renderFooter && (
        <Paper
          style={
            windowWidth === 'small' ? styles.mobileFooter : styles.desktopFooter
          }
          square
          background="dark"
        >
          {renderFooter()}
        </Paper>
      )}
    </Column>
  );
};

export const SectionRow = ({
  children,
  expand,
}: {
  children: React.Node,
  expand?: boolean,
}) => (
  <div
    style={{ ...styles.rowContainer, ...(expand ? { flex: 1 } : undefined) }}
  >
    {children}
  </div>
);

export default SectionContainer;
