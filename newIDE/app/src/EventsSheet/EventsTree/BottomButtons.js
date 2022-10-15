// @flow
import { Trans } from '@lingui/macro';
import * as React from 'react';
import { Line, Column } from '../../UI/Grid';
import ElementWithMenu from '../../UI/Menu/ElementWithMenu';
import { enumerateEventsMetadata } from '../EnumerateEventsMetadata';
import { type DropTargetComponent } from '../../UI/DragAndDrop/DropTarget';
import { type SortableTreeNode } from '.';
import { moveEventToEventsList } from './helpers';
import GDevelopThemeContext from '../../UI/Theme/ThemeContext';

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

export default function BottomButtons({
  onAddEvent,
  DnDComponent,
  draggedNode,
  rootEventsList,
}: Props) {
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
  );
}
