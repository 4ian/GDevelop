// @flow
import * as React from 'react';
import { type ExtensionShortHeader } from '../../Utils/GDevelopServices/Extension';
import ButtonBase from '@material-ui/core/ButtonBase';
import Text from '../../UI/Text';
import Chip from '@material-ui/core/Chip';
import { Trans } from '@lingui/macro';
import { Column, Line } from '../../UI/Grid';
import { IconContainer } from '../../UI/IconContainer';

const styles = {
  container: {
    display: 'flex',
    textAlign: 'left',
    overflow: 'hidden',
    padding: 8,
  },
  authors: {
    marginTop: 0,
    marginBottom: 0,
  },
  chip: {
    marginRight: 2,
  },
};

type Props = {|
  project: gdProject,
  extensionShortHeader: ExtensionShortHeader,
  onChoose: () => void,
  onHeightComputed: number => void,
|};

export const ExtensionListItem = ({
  project,
  extensionShortHeader,
  onChoose,
  onHeightComputed,
}: Props) => {
  const alreadyInstalled = project.hasEventsFunctionsExtensionNamed(
    extensionShortHeader.name
  );

  // Report the height of the item once it's known.
  const containerRef = React.useRef<?HTMLDivElement>(null);
  React.useLayoutEffect(() => {
    if (containerRef.current)
      onHeightComputed(containerRef.current.getBoundingClientRect().height);
  });

  return (
    <ButtonBase onClick={onChoose} focusRipple>
      <div style={styles.container} ref={containerRef}>
        <Line>
          <IconContainer
            alt={extensionShortHeader.fullName}
            src={extensionShortHeader.previewIconUrl}
            size={64}
          />
          <Column expand>
            <Text noMargin>
              {extensionShortHeader.fullName}{' '}
              {alreadyInstalled && <Trans> (already installed)</Trans>}
            </Text>
            <div style={styles.authors}>
              {extensionShortHeader.authors && (
                <>
                  {extensionShortHeader.authors.map(author =>
                    <Chip size="small" style={styles.chip} label={author} key={author} />
                  )}
                </>
              )}
            </div>
            <Text noMargin size="body2">
              {extensionShortHeader.shortDescription}
            </Text>
          </Column>
        </Line>
      </div>
    </ButtonBase>
  );
};
