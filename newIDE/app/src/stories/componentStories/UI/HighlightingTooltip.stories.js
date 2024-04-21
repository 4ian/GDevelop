// @flow
import * as React from 'react';
import { action } from '@storybook/addon-actions';

import paperDecorator from '../../PaperDecorator';

import HighlightingTooltip from '../../../UI/HighlightingTooltip';
import FixedHeightFlexContainer from '../../FixedHeightFlexContainer';
import Text from '../../../UI/Text';
import Link from '../../../UI/Link';
import Window from '../../../Utils/Window';
import TreeLeaves from '../../../UI/CustomSvgIcons/TreeLeaves';

export default {
  title: 'UI Building Blocks/HighlightingTooltip',
  component: HighlightingTooltip,
  decorators: [paperDecorator],
};

export const WithThumbnailSetByHref = () => {
  const [anchorEl, setAnchorEl] = React.useState<?HTMLDivElement>(null);
  return (
    <FixedHeightFlexContainer height={300}>
      <div
        style={{
          width: 150,
          border: '1px solid blue',
          borderRadius: 5,
          height: 30,
          padding: 3,
          display: 'flex',
          justifyContent: 'center',
        }}
        ref={ref => setAnchorEl(ref)}
      >
        Anchor
      </div>
      {anchorEl && (
        <HighlightingTooltip
          title={'Games dashboard'}
          anchorElement={anchorEl}
          placement="right"
          content={[
            <Text noMargin key="paragraph">
              Follow your game’s online performance, manage published versions,
              and collect player feedback.
            </Text>,
            <Text noMargin key="link">
              <Link
                href="https://gdevelop.io"
                onClick={() => Window.openExternalURL('https://gdevelop.io')}
              >
                Learn more
              </Link>
            </Text>,
          ]}
          thumbnailSource="https://resources.gdevelop-app.com/tutorials/images/best-practices-when-making-games.png?gdUsage=img"
          onClose={action('onClose')}
          closeWithBackdropClick={false}
        />
      )}
    </FixedHeightFlexContainer>
  );
};

export const WithThumbnailSetInContent = () => {
  const [anchorEl, setAnchorEl] = React.useState<?HTMLDivElement>(null);
  return (
    <FixedHeightFlexContainer height={300}>
      <div
        style={{
          width: 150,
          border: '1px solid blue',
          borderRadius: 5,
          height: 30,
          padding: 3,
          display: 'flex',
          justifyContent: 'center',
        }}
        ref={ref => setAnchorEl(ref)}
      >
        Anchor
      </div>
      {anchorEl && (
        <HighlightingTooltip
          title={'Games dashboard'}
          anchorElement={anchorEl}
          placement="bottom"
          content={[
            <TreeLeaves style={{ height: 80, width: '100%' }} />,

            <Text noMargin>
              Follow your game’s online performance, manage published versions,
              and collect player feedback.
            </Text>,
            <Text noMargin>
              <Link
                href="https://gdevelop.io"
                onClick={() => Window.openExternalURL('https://gdevelop.io')}
              >
                Learn more
              </Link>
            </Text>,
          ]}
          onClose={action('onClose')}
          closeWithBackdropClick={false}
        />
      )}
    </FixedHeightFlexContainer>
  );
};
