// @flow
import { Trans } from '@lingui/macro';
import * as React from 'react';
import { Line, Column } from '../../UI/Grid';
import ElementWithMenu from '../../UI/Menu/ElementWithMenu';
import { enumerateEventsMetadata } from '../EnumerateEventsMetadata';

const styles = {
  addButton: {
    cursor: 'pointer',
  },
};

type Props = {|
  onAddEvent: (eventType: string) => void,
|};

const makeMenuTemplateBuilderForEvents =
  (onAddEvent: (eventType: string) => void) => () =>
    enumerateEventsMetadata().map((metadata) => {
      return {
        label: metadata.fullName,
        click: () => onAddEvent(metadata.type),
      };
    });

export default function BottomButtons({ onAddEvent }: Props) {
  return (
    <Column>
      <Line justifyContent="space-between">
        <ElementWithMenu
          openMenuWithSecondaryClick
          element={
            <button
              style={styles.addButton}
              className="add-link"
              onClick={() => onAddEvent('BuiltinCommonInstructions::Standard')}
              id="add-event-button"
            >
              <Trans>Add a new event</Trans>
            </button>
          }
          buildMenuTemplate={makeMenuTemplateBuilderForEvents(onAddEvent)}
        />
        <ElementWithMenu
          element={
            <button style={styles.addButton} className="add-link">
              <Trans>Add...</Trans>
            </button>
          }
          buildMenuTemplate={makeMenuTemplateBuilderForEvents(onAddEvent)}
        />
      </Line>
    </Column>
  );
}
