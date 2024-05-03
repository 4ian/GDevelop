// @flow
import { Trans } from '@lingui/macro';
import { t } from '@lingui/macro';
import { I18n } from '@lingui/react';
import * as React from 'react';
import { Line, Column } from '../../UI/Grid';
import ElementWithMenu from '../../UI/Menu/ElementWithMenu';
import { enumerateEventsMetadata } from '../EnumerateEventsMetadata';
import { type DropTargetComponent } from '../../UI/DragAndDrop/DropTarget';
import { type SortableTreeNode } from '.';
import { moveEventToEventsList } from './helpers';
import GDevelopThemeContext from '../../UI/Theme/GDevelopThemeContext';
import { useScreenType } from '../../UI/Responsive/ScreenTypeMeasurer';

const styles = {
  addButton: {
    cursor: 'pointer',
  },
  dropIndicator: {
    border: '2px solid black',
    outline: '1px solid white',
  },
};

type Props = {|
  onAddEvent: (eventType: string) => void,

  // Connect a drop target to be able to drop an event at the end of the sheet.
  DnDComponent: DropTargetComponent<SortableTreeNode>,
  draggedNode: ?SortableTreeNode,
  rootEventsList: gdEventsList,
|};

const makeMenuTemplateBuilderForEvents = (
  onAddEvent: (eventType: string) => void
) => () =>
  enumerateEventsMetadata().map(metadata => {
    return {
      label: metadata.fullName,
      click: () => onAddEvent(metadata.type),
    };
  });

const addButtonTooltipLabelMouse = t`Right-click for more events`;
const addButtonTooltipLabelTouch = t`Long press for more events`;

export default function BottomButtons({
  onAddEvent,
  DnDComponent,
  draggedNode,
  rootEventsList,
}: Props) {
  const screenType = useScreenType();
  const gdevelopTheme = React.useContext(GDevelopThemeContext);
  const onDrop = () => {
    draggedNode &&
      moveEventToEventsList({
        targetEventsList: rootEventsList,
        movingEvent: draggedNode.event,
        initialEventsList: draggedNode.eventsList,
        // Drops node at the end of root events list.
        toIndex: -1,
      });
  };
  return (
    <I18n>
      {({ i18n }) => (
        <DnDComponent canDrop={() => true} drop={onDrop}>
          {({ connectDropTarget, isOver }) =>
            connectDropTarget(
              <div>
                {isOver && (
                  <div
                    style={{
                      ...styles.dropIndicator,
                      borderColor: gdevelopTheme.dropIndicator.canDrop,
                      outlineColor: gdevelopTheme.dropIndicator.border,
                    }}
                  />
                )}
                <Column>
                  <Line justifyContent="space-between">
                    <ElementWithMenu
                      openMenuWithSecondaryClick
                      element={
                        <button
                          style={styles.addButton}
                          className="add-link"
                          onClick={() =>
                            onAddEvent('BuiltinCommonInstructions::Standard')
                          }
                          title={i18n._(
                            screenType === 'touch'
                              ? addButtonTooltipLabelTouch
                              : addButtonTooltipLabelMouse
                          )}
                        >
                          <Trans>Add a new event</Trans>
                        </button>
                      }
                      buildMenuTemplate={makeMenuTemplateBuilderForEvents(
                        onAddEvent
                      )}
                    />
                    <ElementWithMenu
                      element={
                        <button style={styles.addButton} className="add-link">
                          <Trans>Add...</Trans>
                        </button>
                      }
                      buildMenuTemplate={makeMenuTemplateBuilderForEvents(
                        onAddEvent
                      )}
                    />
                  </Line>
                </Column>
              </div>
            )
          }
        </DnDComponent>
      )}
    </I18n>
  );
}
