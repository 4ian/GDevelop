// @flow
import * as React from 'react';
import { Trans } from '@lingui/macro';
import {
  Accordion,
  AccordionBody,
  AccordionHeader,
} from '../../../UI/Accordion';
import Chip from '../../../UI/Chip';
import Text from '../../../UI/Text';
import { Column } from '../../../UI/Grid';
import type { GlobalSearchGroup } from '../../../Utils/EventsGlobalSearchScanner';
import { getGroupIcon } from './utils';
import { styles } from './styles';
import { RenderMatchRowList } from './RenderMatchRowList';

export type GroupItemProps = { group: GlobalSearchGroup };

export const GroupItem: React.ComponentType<GroupItemProps> = React.memo(
  ({ group }: GroupItemProps): React.Node => {
    const [isOpen, setIsOpen] = React.useState<boolean>(true);
    const handleChangeExpands = () => {
      setIsOpen(prev => !prev);
    };

    const totalMatches = group.matches.length;

    return (
      <Accordion expanded={isOpen} onChange={handleChangeExpands} noMargin>
        <AccordionHeader
          actions={[
            <Chip
              key="count"
              size="small"
              variant="outlined"
              color="secondary"
              label={
                totalMatches === 1 ? (
                  <Trans>1 match</Trans>
                ) : (
                  <Trans>{totalMatches} matches</Trans>
                )
              }
              style={styles.matchCountChip}
            />,
          ]}
        >
          <div style={styles.groupHeaderContent}>
            <div style={styles.groupHeaderIcon}>{getGroupIcon(group)}</div>
            <Text
              noMargin
              allowSelection
              style={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                flex: 1,
              }}
              size="block-title"
            >
              {group.label}
            </Text>
          </div>
        </AccordionHeader>
        <AccordionBody disableGutters>
          <Column noMargin expand>
            <RenderMatchRowList group={group} />
          </Column>
        </AccordionBody>
      </Accordion>
    );
  }
);
