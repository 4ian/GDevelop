// @flow
import * as React from 'react';
import { type BehaviorShortHeader } from '../../Utils/GDevelopServices/Extension';
import ButtonBase from '@material-ui/core/ButtonBase';
import Text from '../../UI/Text';
import { Trans } from '@lingui/macro';
import { Line, Column } from '../../UI/Grid';
import { IconContainer } from '../../UI/IconContainer';
import HighlightedText from '../../UI/Search/HighlightedText';
import { type SearchMatch } from '../../UI/Search/UseSearchStructuredItem';
import Chip from '../../UI/Chip';
import { LineStackLayout } from '../../UI/Layout';
import { type SearchableBehaviorMetadata } from './BehaviorStoreContext';
import { UserPublicProfileChip } from '../../UI/User/UserPublicProfileChip';
import Tooltip from '@material-ui/core/Tooltip';
import CircledInfo from '../../UI/CustomSvgIcons/SmallCircledInfo';
import IconButton from '../../UI/IconButton';

const gd: libGDevelop = global.gd;

const styles = {
  button: { width: '100%' },
  container: {
    display: 'flex',
    textAlign: 'left',
    overflow: 'hidden',
    width: '100%',
  },
};

type Props = {|
  id?: string,
  objectType: string,
  objectBehaviorsTypes: Array<string>,
  behaviorShortHeader: BehaviorShortHeader | SearchableBehaviorMetadata,
  matches: ?Array<SearchMatch>,
  onChoose: () => void,
  onShowDetails: () => void,
  onHeightComputed: number => void,
  platform: gdPlatform,
|};

export const BehaviorListItem = ({
  id,
  objectType,
  objectBehaviorsTypes,
  behaviorShortHeader,
  matches,
  onChoose,
  onShowDetails,
  onHeightComputed,
  platform,
}: Props) => {
  const alreadyAdded = objectBehaviorsTypes.includes(behaviorShortHeader.type);
  // An empty object type means the base object, i.e: any object.
  const isObjectCompatible =
    (!behaviorShortHeader.objectType ||
      objectType === behaviorShortHeader.objectType) &&
    behaviorShortHeader.allRequiredBehaviorTypes.every(requiredBehaviorType => {
      const behaviorMetadata = gd.MetadataProvider.getBehaviorMetadata(
        platform,
        requiredBehaviorType
      );
      return (
        !behaviorMetadata.isHidden() ||
        objectBehaviorsTypes.includes(requiredBehaviorType)
      );
    });

  // Report the height of the item once it's known.
  const containerRef = React.useRef<?HTMLDivElement>(null);
  React.useLayoutEffect(() => {
    if (containerRef.current)
      onHeightComputed(containerRef.current.getBoundingClientRect().height);
  });

  const renderField = (field: 'description' | 'fullName') => {
    const originalField = behaviorShortHeader[field];

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

  const isEnabled = !alreadyAdded && isObjectCompatible;

  const chooseBehavior = React.useCallback(
    () => {
      if (isEnabled) {
        onChoose();
      }
    },
    [isEnabled, onChoose]
  );

  const hasChip =
    alreadyAdded ||
    !isObjectCompatible ||
    behaviorShortHeader.tier === 'community' ||
    (behaviorShortHeader.isDeprecated || false);
  const hasInfoButton = behaviorShortHeader.authors || false;
  const iconStyle = {
    paddingTop: hasInfoButton ? 10 : hasChip ? 6 : 4,
  };

  return (
    <ButtonBase
      id={id}
      onClick={chooseBehavior}
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
          <div style={iconStyle}>
            <IconContainer
              alt={behaviorShortHeader.fullName}
              src={behaviorShortHeader.previewIconUrl}
              size={32}
            />
          </div>
          <Column expand>
            <LineStackLayout noMargin alignItems="center">
              <Text
                noMargin
                allowBrowserAutoTranslate={false}
                displayInlineAsSpan // Important to avoid the text to use a "p" which causes crashes with automatic translation tools with the highlighted text.
              >
                {renderField('fullName')}
              </Text>
              {alreadyAdded && (
                <Chip
                  size="small"
                  label={<Trans>Already added</Trans>}
                  color="secondary"
                  variant="outlined"
                />
              )}
              {!isObjectCompatible && (
                <Chip
                  size="small"
                  label={<Trans>Incompatible with the object</Trans>}
                  color="secondary"
                  variant="outlined"
                />
              )}
              {behaviorShortHeader.tier === 'community' && (
                <Chip
                  size="small"
                  label={<Trans>Community-made</Trans>}
                  color="primary"
                />
              )}
              {behaviorShortHeader.isDeprecated && (
                <Chip
                  size="small"
                  label={<Trans>Deprecated</Trans>}
                  color="primary"
                />
              )}
              {behaviorShortHeader.authors && (
                <Tooltip
                  title={
                    behaviorShortHeader.authors.length > 0 ? (
                      <Line>
                        <div style={{ flexWrap: 'wrap' }}>
                          {behaviorShortHeader.authors.map(author => (
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
