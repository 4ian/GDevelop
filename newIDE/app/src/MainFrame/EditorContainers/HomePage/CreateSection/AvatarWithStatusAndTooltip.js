// @flow
import * as React from 'react';
import Avatar from '@material-ui/core/Avatar';
import Tooltip from '@material-ui/core/Tooltip';
import DotBadge from '../../../../UI/DotBadge';
import StatusIndicator from './StatusIndicator';

const styles = {
  avatar: {
    width: 20,
    height: 20,
  },
};

type AvatarWithStatusAndTooltipProps = {|
  avatarUrl: ?string,
  status: 'success' | 'error',
  tooltipMessage: ?string,
  hideStatus?: boolean,
|};

const AvatarWithStatusAndTooltip = ({
  avatarUrl,
  status,
  tooltipMessage,
  hideStatus,
}: AvatarWithStatusAndTooltipProps) =>
  !!avatarUrl ? (
    tooltipMessage ? (
      <DotBadge overlap="circle" color={status} invisible={hideStatus}>
        <Tooltip title={tooltipMessage}>
          <Avatar src={avatarUrl} style={styles.avatar} />
        </Tooltip>
      </DotBadge>
    ) : (
      <DotBadge overlap="circle" color={status} invisible={hideStatus}>
        <Avatar src={avatarUrl} style={styles.avatar} />
      </DotBadge>
    )
  ) : (
    <StatusIndicator status="success" />
  );

export default AvatarWithStatusAndTooltip;
