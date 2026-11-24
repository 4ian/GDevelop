// @flow

import * as React from 'react';
import Text from '../UI/Text';
import { Separator } from '../CompactPropertiesEditor';
import ShareExternal from '../UI/CustomSvgIcons/ShareExternal';
import ChevronArrowDownWithRoundedBorder from '../UI/CustomSvgIcons/ChevronArrowDownWithRoundedBorder';
import ChevronArrowRightWithRoundedBorder from '../UI/CustomSvgIcons/ChevronArrowRightWithRoundedBorder';
import { Column, Line } from '../UI/Grid';
import IconButton from '../UI/IconButton';
import { LineStackLayout } from '../UI/Layout';
import Add from '../UI/CustomSvgIcons/Add';
import { textEllipsisStyle } from '../UI/TextEllipsis';
import { styles } from '../ObjectEditor/CompactObjectPropertiesEditor';

type Props = {
  title: React.Node,
  isFolded: boolean,
  toggleFolded: () => void,
  renderContent: () => React.Node,
  renderContentAsHiddenWhenFolded?: boolean,
  noContentMargin?: boolean,
  onOpenFullEditor?: () => void,
  onAdd?: (() => void) | null,
};

export const TopLevelCollapsibleSection = ({
  title,
  isFolded,
  toggleFolded,
  renderContent,
  renderContentAsHiddenWhenFolded,
  noContentMargin,
  onOpenFullEditor,
  onAdd,
}: Props): React.Node => (
  <>
    <Separator />
    <Column noOverflowParent>
      <LineStackLayout alignItems="center" justifyContent="space-between">
        <LineStackLayout noMargin alignItems="center">
          <IconButton size="small" onClick={toggleFolded}>
            {isFolded ? (
              <ChevronArrowRightWithRoundedBorder style={styles.icon} />
            ) : (
              <ChevronArrowDownWithRoundedBorder style={styles.icon} />
            )}
          </IconButton>
          <Text size="sub-title" noMargin style={textEllipsisStyle}>
            {title}
          </Text>
        </LineStackLayout>
        <Line alignItems="center" noMargin>
          {onOpenFullEditor && (
            <IconButton size="small" onClick={onOpenFullEditor}>
              <ShareExternal style={styles.icon} />
            </IconButton>
          )}
          {onAdd && (
            <IconButton size="small" onClick={onAdd}>
              <Add style={styles.icon} />
            </IconButton>
          )}
        </Line>
      </LineStackLayout>
    </Column>
    <Column noMargin={noContentMargin}>
      {isFolded ? (
        renderContentAsHiddenWhenFolded ? (
          <div style={styles.hiddenContent}>{renderContent()}</div>
        ) : null
      ) : (
        renderContent()
      )}
    </Column>
  </>
);
