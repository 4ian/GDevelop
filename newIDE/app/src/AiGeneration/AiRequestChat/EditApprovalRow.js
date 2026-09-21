// @flow
import * as React from 'react';
import { Trans } from '@lingui/macro';
import Text from '../../UI/Text';
import Check from '../../UI/CustomSvgIcons/Check';
import Cross from '../../UI/CustomSvgIcons/Cross';
import Edit from '../../UI/CustomSvgIcons/Edit';
import Sparkle from '../../UI/CustomSvgIcons/Sparkle';
import { ChatActionButton } from './ChatActionButton';
import { type EditApprovalRequest } from '../Utils';
import classes from './EditApprovalRow.module.css';

type Props = {|
  pendingEditApproval: EditApprovalRequest,
  onResolveEditApproval: (accepted: boolean) => void,
  onAcceptAndEnableAutoEdit: () => void,
|};

const styles = {
  label: {
    // Anywhere because the label can contain long object or scene names.
    overflowWrap: 'anywhere',
    fontWeight: 'bold',
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
  <div className={classes.container}>
    <div className={classes.header}>
      <span className={classes.iconBadge}>
        <Edit fontSize="inherit" />
      </span>
      <Text noMargin size="body-small" color="secondary">
        <Trans>The AI wants to edit your project</Trans>
      </Text>
    </div>
    <Text
      noMargin
      size="body-small"
      // $FlowFixMe[incompatible-type]
      style={styles.label}
    >
      {pendingEditApproval.label}
    </Text>
    <div className={classes.actions}>
      <ChatActionButton
        emphasis="primary"
        icon={<Check fontSize="inherit" />}
        label={<Trans>Apply</Trans>}
        onClick={() => onResolveEditApproval(true)}
      />
      <ChatActionButton
        icon={<Sparkle fontSize="inherit" />}
        label={<Trans>Always apply</Trans>}
        tooltip={
          <Trans>
            Apply this change and turn on auto edit, so the next changes are
            applied without asking.
          </Trans>
        }
        onClick={onAcceptAndEnableAutoEdit}
      />
      <ChatActionButton
        emphasis="quiet"
        icon={<Cross fontSize="inherit" />}
        label={<Trans>Don't apply</Trans>}
        onClick={() => onResolveEditApproval(false)}
      />
    </div>
  </div>
);
