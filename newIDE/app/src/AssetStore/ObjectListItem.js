// @flow
import * as React from 'react';
import { type ObjectShortHeader } from '../Utils/GDevelopServices/Extension';
import { isCompatibleWithGDevelopVersion } from '../Utils/Extension/ExtensionCompatibilityChecker.js';
import ButtonBase from '@material-ui/core/ButtonBase';
import Text from '../UI/Text';
import { Trans } from '@lingui/macro';
import { Line, Column } from '../UI/Grid';
import { IconContainer } from '../UI/IconContainer';
import HighlightedText from '../UI/Search/HighlightedText';
import { type SearchMatch } from '../UI/Search/UseSearchStructuredItem';
import Chip from '../UI/Chip';
import { LineStackLayout } from '../UI/Layout';
import { UserPublicProfileChip } from '../UI/User/UserPublicProfileChip';
import Tooltip from '@material-ui/core/Tooltip';
import CircledInfo from '../UI/CustomSvgIcons/SmallCircledInfo';
import IconButton from '../UI/IconButton';
import { getIDEVersion } from '../Version';
import ListIcon from '../UI/ListIcon';

const styles = {
  button: { width: '100%' },
  container: {
    display: 'flex',
    textAlign: 'left',
    overflow: 'hidden',
    width: '100%',
    paddingLeft: 16,
  },
};

type Props = {|
  id?: string,
  objectShortHeader: ObjectShortHeader,
  matches: ?Array<SearchMatch>,
  onChoose: () => void,
  onShowDetails: () => void,
  onHeightComputed: number => void,
  platform: gdPlatform,
|};

export const ObjectListItem = ({
  id,
  objectShortHeader,
  matches,
  onChoose,
  onShowDetails,
  onHeightComputed,
  platform,
}: Props) => {
  const isEngineCompatible = isCompatibleWithGDevelopVersion(
    getIDEVersion(),
    objectShortHeader.gdevelopVersion
  );

  // Report the height of the item once it's known.
  const containerRef = React.useRef<?HTMLDivElement>(null);
  React.useLayoutEffect(() => {
    if (containerRef.current)
      onHeightComputed(containerRef.current.getBoundingClientRect().height);
  });

  const renderField = (field: 'description' | 'fullName') => {
    const originalField = objectShortHeader[field];

    if (!matches) return originalField;
    const nameMatches = matches.filter(match => match.key === field);
    if (nameMatches.length === 0) return originalField;

    return (
      <HighlightedText
        text={originalField}
        matchesCoordinates={nameMatches[0].indices}
      />
    );
  };

  const isEnabled = isEngineCompatible;

  const chooseObject = React.useCallback(
    () => {
      if (isEnabled) {
        onChoose();
      }
    },
    [isEnabled, onChoose]
  );

  const hasChip =
    !isEngineCompatible || objectShortHeader.tier === 'experimental';
  const hasInfoButton = objectShortHeader.authors || false;
  const iconStyle = {
    paddingTop: hasInfoButton ? 10 : hasChip ? 6 : 4,
  };

  return (
    <ButtonBase
      id={id}
      onClick={chooseObject}
      focusRipple
      style={styles.button}
    >
      <div
        style={
          isEnabled ? styles.container : { ...styles.container, opacity: 0.384 }
        }
        ref={containerRef}
      >
        <LineStackLayout>
          <ListIcon
            src={objectShortHeader.previewIconUrl}
            iconSize={32}
            padding={4}
            useExactIconSize
          />
          <Column expand>
            <LineStackLayout noMargin expand alignItems="center">
              <Text
                noMargin
                allowBrowserAutoTranslate={false}
                displayInlineAsSpan // Important to avoid the text to use a "p" which causes crashes with automatic translation tools with the highlighted text.
              >
                {renderField('fullName')}
              </Text>
              {objectShortHeader.tier === 'experimental' && (
                <Chip
                  size="small"
                  label={<Trans>Experimental</Trans>}
                  color="primary"
                />
              )}
              {objectShortHeader.authors && (
                <Tooltip
                  title={
                    objectShortHeader.authors.length > 0 ? (
                      <Line>
                        <div style={{ flexWrap: 'wrap' }}>
                          {objectShortHeader.authors.map(author => (
                            <UserPublicProfileChip
                              user={author}
                              key={author.id}
                              variant="outlined"
                            />
                          ))}
                        </div>
                      </Line>
                    ) : (
                      ''
                    )
                  }
                >
                  <IconButton
                    size="small"
                    onClick={e => {
                      e.stopPropagation();
                      onShowDetails();
                    }}
                  >
                    <CircledInfo />
                  </IconButton>
                </Tooltip>
              )}
            </LineStackLayout>
            <Text
              noMargin
              size="body2"
              allowBrowserAutoTranslate={false}
              displayInlineAsSpan // Important to avoid the text to use a "p" which causes crashes with automatic translation tools with the highlighted text.
            >
              {renderField('description')}
            </Text>
          </Column>
        </LineStackLayout>
      </div>
    </ButtonBase>
  );
};
