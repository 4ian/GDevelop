// @flow
import * as React from 'react';

import InspectorTreeView, {
  buildValueItems,
  makeSection,
} from '../../../Debugger/Inspectors/InspectorTreeView';
import FixedHeightFlexContainer from '../../FixedHeightFlexContainer';
import paperDecorator from '../../PaperDecorator';

export default {
  title: 'Debugger/InspectorTreeView',
  component: InspectorTreeView,
  decorators: [paperDecorator],
};

export const WithStructure = () => (
  <FixedHeightFlexContainer height={400}>
    <InspectorTreeView
      src={{
        Player: {
          Life: 100,
          Name: 'Player one',
          Inventory: { Sword: 1, Shield: 2, Potion: 5 },
          Positions: [{ X: 12, Y: 34 }, { X: 56, Y: 78 }],
        },
        Score: 9500,
        Level: 3,
        IsGameOver: false,
      }}
    />
  </FixedHeightFlexContainer>
);

export const WithArray = () => (
  <FixedHeightFlexContainer height={300}>
    <InspectorTreeView
      src={[
        { id: 0, name: 'Enemy A', health: 50 },
        { id: 1, name: 'Enemy B', health: 75 },
        { id: 2, name: 'Enemy C', health: 100 },
      ]}
    />
  </FixedHeightFlexContainer>
);

export const WithPrimitiveValues = () => (
  <FixedHeightFlexContainer height={200}>
    <InspectorTreeView
      src={{
        StringValue: 'Hello world',
        NumberValue: 42,
        BooleanTrue: true,
        BooleanFalse: false,
        NullValue: null,
      }}
    />
  </FixedHeightFlexContainer>
);

export const Empty = () => (
  <FixedHeightFlexContainer height={100}>
    <InspectorTreeView src={{}} />
  </FixedHeightFlexContainer>
);

export const UndefinedValue = () => (
  <FixedHeightFlexContainer height={100}>
    <InspectorTreeView src={undefined} />
  </FixedHeightFlexContainer>
);

export const WithCustomMissingLabel = () => (
  <FixedHeightFlexContainer height={100}>
    <InspectorTreeView
      src={null}
      missingValueLabel="No data available for this object"
    />
  </FixedHeightFlexContainer>
);

export const ScalarString = () => <InspectorTreeView src="Just a string" />;

export const ScalarNumber = () => <InspectorTreeView src={12345} />;

export const WithSections = () => (
  <FixedHeightFlexContainer height={500}>
    <InspectorTreeView
      items={[
        makeSection(
          'general',
          'General',
          buildValueItems('general', { 'X position': 12, 'Y position': 34 }),
          { isRoot: true }
        ),
        makeSection(
          'behaviors',
          'Behaviors',
          [
            makeSection('behaviors/Physics3D', 'Physics3D', [
              makeSection(
                'behaviors/Physics3D/properties',
                'Properties',
                buildValueItems('behaviors/Physics3D/properties', {
                  activated: true,
                  angularDamping: 0.1,
                  bodyType: 'Kinematic',
                })
              ),
              makeSection(
                'behaviors/Physics3D/expressions',
                'Expressions',
                buildValueItems('behaviors/Physics3D/expressions', {
                  'Angular damping': 0.1,
                  'Linear damping': 0.1,
                }),
                { openByDefault: false }
              ),
            ]),
          ],
          { isRoot: true }
        ),
        makeSection('timers', 'Timers', null, {
          isRoot: true,
          emptyHint: 'This object has no timer.',
        }),
      ]}
    />
  </FixedHeightFlexContainer>
);

const makeManyValues = (count: number) => {
  const values = {};
  for (let index = 0; index < count; index++) {
    values[`Value ${String(index).padStart(2, '0')}`] = index * 10;
  }
  return values;
};

/** Scroll the tree: the sections holding the first visible row stay on top. */
export const WithManyRows = () => (
  <FixedHeightFlexContainer height={250}>
    <InspectorTreeView
      items={[
        makeSection(
          'general',
          'General',
          [
            makeSection(
              'general/position',
              'Position',
              buildValueItems('general/position', makeManyValues(30))
            ),
          ],
          { isRoot: true }
        ),
        makeSection(
          'variables',
          'Variables',
          buildValueItems('variables', makeManyValues(30)),
          { isRoot: true }
        ),
      ]}
    />
  </FixedHeightFlexContainer>
);
