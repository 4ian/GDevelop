// @flow
import * as React from 'react';
import GDevelopThemeContext from '../UI/Theme/GDevelopThemeContext';
import ListIcon from '../UI/ListIcon';

const styles = {
  overlay: {
    position: 'absolute',
    inset: 0,
    zIndex: 2,
    pointerEvents: 'none',
  },
  backdrop: {
    position: 'absolute',
    inset: 0,
  },
  radialWrapper: {
    position: 'absolute',
    left: '50%',
    top: '50%',
    width: 'min(70vw, 360px)',
    height: 'min(70vw, 360px)',
    transform: 'translate(-50%, -50%)',
    borderRadius: '50%',
    overflow: 'hidden',
  },
  radialInnerHole: {
    position: 'absolute',
    inset: '28%',
    borderRadius: '50%',
  },
  radialOptionMarker: {
    position: 'absolute',
    width: 96,
    transform: 'translate(-50%, -50%)',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 4,
  },
  radialOptionLabel: {
    fontSize: 11,
    lineHeight: '14px',
  },
};

export type DroppedFileObjectSelectorOptionMarker = {|
  objectType: string,
  iconUrl: string,
  label: string,
  left: string,
  top: string,
|};

type Props = {|
  optionMarkers: Array<DroppedFileObjectSelectorOptionMarker>,
  highlightedObjectType: ?string,
  isLoading: boolean,
|};

const DroppedFileObjectSelectorOverlay: React.ComponentType<Props> = React.memo<Props>(
  ({ optionMarkers, highlightedObjectType, isLoading }) => {
    const gdevelopTheme = React.useContext(GDevelopThemeContext);

    const getSectorBackgroundColor = React.useCallback(
      (sectorObjectType: string): string =>
        highlightedObjectType === sectorObjectType
          ? gdevelopTheme.listItem.selectedBackgroundColor
          : gdevelopTheme.list.itemsBackgroundColor,
      [highlightedObjectType, gdevelopTheme]
    );

    return (
      <div style={styles.overlay}>
        <div
          style={{
            ...styles.backdrop,
            backgroundColor: gdevelopTheme.palette.canvasColor,
            opacity: 0.55,
          }}
        />
        <div style={styles.radialWrapper}>
          <div
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '50%',
              background: `conic-gradient(
                ${getSectorBackgroundColor('Sprite')} 0deg 120deg,
                ${getSectorBackgroundColor(
                  'PanelSpriteObject::PanelSprite'
                )} 120deg 240deg,
                ${getSectorBackgroundColor(
                  'TiledSpriteObject::TiledSprite'
                )} 240deg 360deg
              )`,
              opacity: isLoading ? 0.35 : 0.88,
            }}
          />
          <div
            style={{
              ...styles.radialInnerHole,
              backgroundColor: gdevelopTheme.paper.backgroundColor.dark,
              opacity: 0.85,
            }}
          />
          {optionMarkers.map(optionMarker => (
            <div
              key={optionMarker.objectType}
              style={{
                ...styles.radialOptionMarker,
                left: optionMarker.left,
                top: optionMarker.top,
                opacity:
                  highlightedObjectType === optionMarker.objectType ? 1 : 0.78,
              }}
            >
              <ListIcon
                src={optionMarker.iconUrl}
                iconSize={28}
                padding={4}
                useExactIconSize
              />
              <div
                style={{
                  ...styles.radialOptionLabel,
                  color: gdevelopTheme.text.color.primary,
                }}
              >
                {optionMarker.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
);

export default DroppedFileObjectSelectorOverlay;
