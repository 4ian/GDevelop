// @flow

import * as React from 'react';
import Tooltip from '@material-ui/core/Tooltip';
import { LineStackLayout } from '../UI/Layout';
import Text from '../UI/Text';
import { MarkdownText } from '../UI/MarkdownText';
import { tooltipEnterDelay } from '../UI/Tooltip';

const styles = {
  leftColumn: { flex: 2, minWidth: 0, maxWidth: 150 },
  rightColumn: { flex: 3, minWidth: 75 },
  label: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    lineHeight: '17px',
    maxHeight: 34, // 2 * lineHeight to limit to 2 lines.
    opacity: 0.7,
  },
};
type Props = {|
  label: string,
  markdownDescription?: ?string,
  field: React.Node,
|};

const CompactPropertiesEditorRowField = (props: Props) => {
  const title = !props.markdownDescription
    ? props.label
    : [props.label, ' - ', <MarkdownText source={props.markdownDescription} />];
  return (
    <LineStackLayout noMargin alignItems="center">
      <div style={styles.leftColumn}>
        <Tooltip
          title={title}
          enterDelay={tooltipEnterDelay}
          placement="bottom"
          PopperProps={{
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
          <Text noMargin style={styles.label}>
            {props.label}
          </Text>
        </Tooltip>
      </div>
      <div style={styles.rightColumn}>{props.field}</div>
    </LineStackLayout>
  );
};

export default CompactPropertiesEditorRowField;
