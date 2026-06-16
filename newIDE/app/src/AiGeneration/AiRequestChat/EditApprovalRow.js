// @flow
import * as React from 'react';
import { Trans } from '@lingui/macro';
import Text from '../../UI/Text';
import RaisedButton from '../../UI/RaisedButton';
import FlatButton from '../../UI/FlatButton';
import { ColumnStackLayout, LineStackLayout } from '../../UI/Layout';
import HelpQuestion from '../../UI/CustomSvgIcons/HelpQuestion';
import { type EditApprovalRequest } from '../Utils';

type Props = {|
  pendingEditApproval: EditApprovalRequest,
  onResolveEditApproval: (accepted: boolean) => void,
  onAcceptAndEnableAutoEdit: () => void,
|};

const styles = {
  icon: {
    fontSize: 14,
    flexShrink: 0,
    marginTop: 1,
  },
};

/**
 * Inline confirmation shown in the chat when auto-edit is off and the AI is
 * about to modify the project.
 */
export const EditApprovalRow = ({
  pendingEditApproval,
  onResolveEditApproval,
  onAcceptAndEnableAutoEdit,
}: Props): React.Node => (
  <ColumnStackLayout noMargin>
    <LineStackLayout noMargin alignItems="flex-start">
      <HelpQuestion style={styles.icon} />
      <Text noMargin size="body-small" color="secondary">
        <Trans>Apply this change:</Trans> {pendingEditApproval.label}
      </Text>
    </LineStackLayout>
    <ColumnStackLayout noMargin alignItems="flex-start">
      <RaisedButton
        primary
        label={<Trans>Yes, just this change</Trans>}
        onClick={() => onResolveEditApproval(true)}
      />
      <FlatButton
        label={<Trans>Yes, and enable auto-edit</Trans>}
        onClick={onAcceptAndEnableAutoEdit}
      />
      <FlatButton
        label={<Trans>No</Trans>}
        onClick={() => onResolveEditApproval(false)}
      />
    </ColumnStackLayout>
  </ColumnStackLayout>
);
