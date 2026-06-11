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
 * about to modify the project. The first line ("Apply this change: …", styled
 * like the chat's status line) wraps as needed; the second line holds the
 * No (suspends the request so the user can redirect) / Yes (runs the edit and
 * the rest of that edit agent's tools) buttons.
 */
export const EditApprovalRow = ({
  pendingEditApproval,
  onResolveEditApproval,
}: Props): React.Node => (
  <ColumnStackLayout noMargin>
    <LineStackLayout noMargin alignItems="flex-start">
      <HelpQuestion style={styles.icon} />
      <Text noMargin size="body-small" color="secondary">
        <Trans>Apply this change:</Trans> {pendingEditApproval.label}
      </Text>
    </LineStackLayout>
    <LineStackLayout noMargin alignItems="center">
      <FlatButton
        label={<Trans>No</Trans>}
        onClick={() => onResolveEditApproval(false)}
      />
      <RaisedButton
        primary
        label={<Trans>Yes</Trans>}
        onClick={() => onResolveEditApproval(true)}
      />
    </LineStackLayout>
  </ColumnStackLayout>
);
