// @flow
import * as React from 'react';
import { type BehaviorShortHeader } from '../../Utils/GDevelopServices/Extension';
import { isCompatibleWithGDevelopVersion } from '../../Utils/Extension/ExtensionCompatibilityChecker.js';
import ButtonBase from '@material-ui/core/ButtonBase';
import Text from '../../UI/Text';
import { Trans } from '@lingui/macro';
import HighlightedText from '../../UI/Search/HighlightedText';
import { type SearchMatch } from '../../UI/Search/UseSearchStructuredItem';
import Chip from '../../UI/Chip';
import Tooltip from '@material-ui/core/Tooltip';
import CircledInfo from '../../UI/CustomSvgIcons/SmallCircledInfo';
import IconButton from '../../UI/IconButton';
import ListIcon from '../../UI/ListIcon';
import GDevelopThemeContext from '../../UI/Theme/GDevelopThemeContext';
import { Line } from '../../UI/Grid';
import { UserPublicProfileChip } from '../../UI/User/UserPublicProfileChip';
import { getIDEVersion } from '../../Version';

const gd: libGDevelop = global.gd;

const styles = {
  container: {
    paddingTop: 4,
    paddingRight: 1,
    paddingBottom: 4,
    paddingLeft: 1,
    boxSizing: 'border-box',
  },
  button: {
    width: '100%',
    display: 'block',
    aspectRatio: '1 / 0.88',
  },
  cardContainer: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    height: '100%',
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
    transition: 'background-color 0.2s ease-in-out',
  },
  detailsButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    zIndex: 2,
  },
  ribbonBadge: {
    position: 'absolute',
    top: 16,
    left: -34,
    transform: 'rotate(-45deg)',
    color: '#ffffff',
    padding: '4px 38px',
    fontSize: '0.65rem',
    fontWeight: 700,
    textAlign: 'center',
    lineHeight: '1.2',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
    zIndex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6c5ce7',
    textShadow: '0 1px 3px rgba(0, 0, 0, 0.8)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
  },
  iconContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    paddingBottom: 10,
    minHeight: 86,
  },
  contentContainer: {
    flex: 1,
    padding: 10,
    paddingTop: 52,
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  },
  chipsContainer: {
    display: 'flex',
    gap: 4,
    justifyContent: 'center',
    flexWrap: 'wrap',
    minHeight: 24,
  },
  description: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    display: '-webkit-box',
    WebkitLineClamp: 5,
    WebkitBoxOrient: 'vertical',
    textAlign: 'center',
    lineHeight: '1.35',
  },
};

type Props = {|
  id?: string,
  objectType: string,
  objectBehaviorsTypes: Array<string>,
  isChildObject: boolean,
  behaviorShortHeader: BehaviorShortHeader,
  matches: ?Array<SearchMatch>,
  onChoose: () => void,
  onShowDetails: () => void,
  onHeightComputed: number => void,
  platform: gdPlatform,
|};

export const BehaviorGridItem = ({
  id,
  objectType,
  objectBehaviorsTypes,
  isChildObject,
  behaviorShortHeader,
  matches,
  onChoose,
  onShowDetails,
  onHeightComputed,
  platform,
}: Props): React.Node => {
  const gdevelopTheme = React.useContext(GDevelopThemeContext);

  const alreadyAdded = objectBehaviorsTypes.includes(behaviorShortHeader.type);

  const behaviorMetadata = gd.MetadataProvider.getBehaviorMetadata(
    platform,
    behaviorShortHeader.type
  );
  const isObjectCompatible =
    (!behaviorShortHeader.objectType ||
      objectType === behaviorShortHeader.objectType) &&
    (!isChildObject || behaviorMetadata.isRelevantForChildObjects()) &&
    behaviorShortHeader.allRequiredBehaviorTypes.every(requiredBehaviorType => {
      const requiredBehaviorMetadata = gd.MetadataProvider.getBehaviorMetadata(
        platform,
        requiredBehaviorType
      );
      return (
        (!isChildObject ||
          requiredBehaviorMetadata.isRelevantForChildObjects()) &&
        (!requiredBehaviorMetadata.isHidden() ||
          objectBehaviorsTypes.includes(requiredBehaviorType))
      );
    });

  const isEngineCompatible = isCompatibleWithGDevelopVersion(
    getIDEVersion(),
    behaviorShortHeader.gdevelopVersion
  );
  const isEnabled = !alreadyAdded && isObjectCompatible && isEngineCompatible;
  const canShowDetails = !!behaviorShortHeader.headerUrl;
  const hasStatusChip =
    !isObjectCompatible ||
    (!isEngineCompatible && !alreadyAdded && isObjectCompatible) ||
    behaviorShortHeader.tier === 'experimental' ||
    !!behaviorShortHeader.isDeprecated;

  const containerRef = React.useRef<?HTMLDivElement>(null);
  React.useLayoutEffect(() => {
    if (containerRef.current)
      onHeightComputed(
        Math.ceil(containerRef.current.getBoundingClientRect().height)
      );
  });

  const renderField = (field: 'description' | 'fullName') => {
    const originalField = behaviorShortHeader[field];

    if (!matches) return originalField;
    const fieldMatches = matches.filter(match => match.key === field);
    if (fieldMatches.length === 0) return originalField;

    return (
      <HighlightedText
        text={originalField}
        matchesCoordinates={fieldMatches[0].indices}
      />
    );
  };

  const chooseBehavior = React.useCallback(
    () => {
      if (isEnabled) {
        onChoose();
      }
    },
    [isEnabled, onChoose]
  );

  const [hover, setHover] = React.useState(false);

  return (
    <div ref={containerRef} style={styles.container}>
      <ButtonBase
        id={id}
        style={styles.button}
        onClick={chooseBehavior}
        focusRipple
      >
        <div
          style={{
            ...styles.cardContainer,
            backgroundColor: hover
              ? gdevelopTheme.list.hover.backgroundColor
              : gdevelopTheme.list.itemsBackgroundColor,
            opacity: isEnabled ? 1 : 0.384,
          }}
          onPointerEnter={() => setHover(true)}
          onPointerLeave={() => setHover(false)}
        >
          {alreadyAdded && <div style={styles.ribbonBadge}>ADDED</div>}

          {hover && canShowDetails && (
            <div style={styles.detailsButton}>
              <Tooltip
                title={
                  behaviorShortHeader.authors &&
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
                  onClick={event => {
                    event.stopPropagation();
                    onShowDetails();
                  }}
                >
                  <CircledInfo />
                </IconButton>
              </Tooltip>
            </div>
          )}

          <div style={styles.iconContainer}>
            <ListIcon
              src={behaviorShortHeader.previewIconUrl}
              iconSize={84}
              useExactIconSize
            />
          </div>

          <div style={styles.contentContainer}>
            <div style={{ minHeight: 32 }}>
              <Text
                noMargin
                allowBrowserAutoTranslate={false}
                displayInlineAsSpan
                size="body2"
                style={{
                  fontWeight: 500,
                  textAlign: 'center',
                  lineHeight: '1.3',
                }}
              >
                {renderField('fullName')}
              </Text>
            </div>

            {hasStatusChip && (
              <div style={styles.chipsContainer}>
                {!isObjectCompatible && (
                  <Chip
                    size="small"
                    label={<Trans>Incompatible with the object</Trans>}
                    color="secondary"
                    variant="outlined"
                  />
                )}
                {!isEngineCompatible && !alreadyAdded && isObjectCompatible && (
                  <Chip
                    size="small"
                    label={<Trans>Need latest GDevelop version</Trans>}
                    color="secondary"
                    variant="outlined"
                  />
                )}
                {behaviorShortHeader.tier === 'experimental' && (
                  <Chip
                    size="small"
                    label={<Trans>Experimental</Trans>}
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
              </div>
            )}

            <div style={{ flex: 1 }}>
              <Text
                noMargin
                size="body2"
                allowBrowserAutoTranslate={false}
                displayInlineAsSpan
                color="secondary"
                style={{ ...styles.description, marginTop: 6 }}
              >
                {renderField('description')}
              </Text>
            </div>
          </div>
        </div>
      </ButtonBase>
    </div>
  );
};
