// @flow

import * as React from 'react';
import Tooltip from '@material-ui/core/Tooltip';
import { LineStackLayout } from '../UI/Layout';
import Text from '../UI/Text';
import { MarkdownText } from '../UI/MarkdownText';
import { tooltipEnterDelay } from '../UI/Tooltip';
import PortalContainerContext from '../UI/PortalContainerContext';

const styles = {
  leftColumn: { flex: 2, minWidth: 0, maxWidth: 150 },
  rightColumn: { flex: 3, minWidth: 25 },
  label: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    lineHeight: '17px',
    maxHeight: 34, // 2 * lineHeight to limit to 2 lines.
  },
};
type Props = {|
  label: string,
  markdownDescription?: ?string,
  field: React.Node,
  labelColor?: 'primary' | 'secondary',
  labelMaxWidth?: number,
|};

const CompactPropertiesEditorRowField = (props: Props): React.Node => {
  const portalContainer = React.useContext(PortalContainerContext);
  const title = !props.markdownDescription
    ? props.label
    : [
        props.label,
        ' - ',
        <MarkdownText key="markdown-desc" source={props.markdownDescription} />,
      ];
  return (
    <LineStackLayout noMargin alignItems="center" expand>
      <div
        style={
          props.labelMaxWidth
            ? { ...styles.leftColumn, maxWidth: props.labelMaxWidth }
            : styles.leftColumn
        }
      >
        <Tooltip
          title={title}
          enterDelay={tooltipEnterDelay}
          placement="bottom"
          PopperProps={{
            // Passing PopperProps replaces the theme default container (see FullThemeProvider).
            container: portalContainer,
            modifiers: {
              offset: {
                enabled: true,
                /**
                 * It does not seem possible to get the tooltip closer to the anchor
                 * when positioned on top. So it is positioned on bottom with a negative offset.
                 */
                offset: '0,-20',
              },
            },
          }}
        >
          <Text
            noMargin
            // $FlowFixMe[incompatible-type]
            style={styles.label}
            color={props.labelColor === 'primary' ? 'primary' : 'secondary'}
          >
            {props.label}
          </Text>
        </Tooltip>
      </div>
      <div style={styles.rightColumn}>{props.field}</div>
    </LineStackLayout>
  );
};

export default CompactPropertiesEditorRowField;
