// @flow
import {
  MAX_SHOWN_INSTANCES_COUNT,
  buildChildrenItems,
  buildInstanceItems,
  buildWatchedItems,
  filterWatchedItems,
  getValueType,
} from './WatchedItems';

const gd: libGDevelop = global.gd;

const makeInstances = (count: number, objectName?: string) =>
  new Array(count).fill(null).map((_, index) => ({
    id: index + 1,
    objectName,
    result: `Value ${index + 1}`,
  }));

describe('WatchedItems', () => {
  describe('getValueType', () => {
    it('maps the values of the game to variable types', () => {
      expect(getValueType(12)).toBe(gd.Variable.Number);
      expect(getValueType(undefined)).toBe(gd.Variable.Number);
      expect(getValueType('Text')).toBe(gd.Variable.String);
      expect(getValueType(true)).toBe(gd.Variable.Boolean);
      expect(getValueType([1, 2])).toBe(gd.Variable.Array);
      expect(getValueType({ Life: 3 })).toBe(gd.Variable.Structure);
    });
  });

  describe('buildChildrenItems', () => {
    it('makes a row of each child, sorted by name, with path ids', () => {
      const children = buildChildrenItems(
        'root:Player',
        { life: 3, Inventory: { Sword: 1 } },
        false,
        1
      );
      if (!children) throw new Error('Children were expected.');

      expect(children.map(child => child.name)).toEqual(['Inventory', 'life']);
      expect(children[0].id).toBe('root:Player/Inventory');
      expect(children[0].depth).toBe(1);
      const grandChildren = children[0].children;
      if (!grandChildren) throw new Error('Grand children were expected.');
      expect(grandChildren[0].id).toBe('root:Player/Inventory/Sword');
      expect(grandChildren[0].depth).toBe(2);
    });

    it('names the children of an array by their index', () => {
      const children = buildChildrenItems('root:List', ['a', 'b'], false, 1);
      if (!children) throw new Error('Children were expected.');
      expect(children.map(child => child.name)).toEqual(['0', '1']);
    });

    it('has no children for a plain value or an empty tree', () => {
      expect(buildChildrenItems('root:Score', 12, false, 1)).toBeNull();
      expect(buildChildrenItems('root:Empty', {}, false, 1)).toBeNull();
    });
  });

  describe('buildInstanceItems', () => {
    it('names the instances by their id, and caps their count', () => {
      const items = buildInstanceItems(
        'root:Enemy.Life',
        makeInstances(MAX_SHOWN_INSTANCES_COUNT + 5),
        gd.VariablesContainer.Object,
        false,
        '',
        1
      );

      expect(items).toHaveLength(MAX_SHOWN_INSTANCES_COUNT + 1);
      expect(items[0].name).toBe('#1');
      expect(items[0].id).toBe('root:Enemy.Life/#1');
      const moreRow = items[items.length - 1];
      expect(moreRow.isMoreRow).toBe(true);
      expect(moreRow.hiddenInstancesCount).toBe(5);
    });

    it('names the instances after their object for a group', () => {
      const items = buildInstanceItems(
        'root:Enemies.Life',
        [
          { id: 1, objectName: 'Bat', result: 1 },
          { id: 2, objectName: 'Rat', result: 2 },
        ],
        gd.VariablesContainer.Object,
        false,
        '',
        1
      );

      expect(items.map(item => item.name)).toEqual(['Bat #1', 'Rat #2']);
    });

    it('keeps the instances matching the filter, by id or by value', () => {
      const instances = makeInstances(20);
      const matchingById = buildInstanceItems(
        'root:Enemy.Name',
        instances,
        gd.VariablesContainer.Object,
        false,
        '#12',
        1
      );
      expect(matchingById.map(item => item.name)).toEqual(['#12']);

      const matchingByValue = buildInstanceItems(
        'root:Enemy.Name',
        instances,
        gd.VariablesContainer.Object,
        false,
        'value 7',
        1
      );
      expect(matchingByValue.map(item => item.name)).toEqual(['#7']);
    });
  });

  describe('buildWatchedItems', () => {
    it('shows a watched variable with its value and its children', () => {
      const [item] = buildWatchedItems({
        watchedExpressions: [
          {
            expression: 'Player',
            sourceType: gd.VariablesContainer.Scene,
            isValid: true,
          },
        ],
        evaluations: {
          Player: { result: { Life: 3 }, variables: {} },
        },
        searchText: '',
      });

      expect(item.id).toBe('root:Player');
      expect(item.hasValue).toBe(true);
      expect(item.isMissing).toBe(false);
      expect((item.children || []).map(child => child.name)).toEqual(['Life']);
    });

    it('waits for the game before showing anything', () => {
      const [item] = buildWatchedItems({
        watchedExpressions: [
          {
            expression: 'Score',
            sourceType: gd.VariablesContainer.Scene,
            isValid: true,
          },
        ],
        evaluations: {},
        searchText: '',
      });

      expect(item.hasValue).toBe(false);
      expect(item.children).toBeNull();
    });

    it('strikes through what is unknown, invalid or not in the game', () => {
      const items = buildWatchedItems({
        watchedExpressions: [
          {
            expression: 'Unknown',
            sourceType: gd.VariablesContainer.Unknown,
            isValid: true,
          },
          {
            expression: 'Invalid',
            sourceType: gd.VariablesContainer.Scene,
            isValid: false,
          },
          {
            expression: 'NotInGame',
            sourceType: gd.VariablesContainer.Scene,
            isValid: true,
          },
          {
            expression: 'Random(10)',
            sourceType: gd.VariablesContainer.Unknown,
            isValid: true,
          },
        ],
        evaluations: {
          NotInGame: { result: undefined, variables: {} },
          'Random(10)': { result: 4, variables: {} },
        },
        searchText: '',
      });

      expect(items.map(item => item.isMissing)).toEqual([
        true,
        true,
        true,
        false,
      ]);
    });

    it('stands for the instances with a placeholder until they arrive', () => {
      const watchedExpressions = [
        {
          expression: 'Enemy.Life',
          sourceType: gd.VariablesContainer.Object,
          isValid: true,
        },
      ];
      const [itemBeforeInstances] = buildWatchedItems({
        watchedExpressions,
        evaluations: {
          'Enemy.Life': { result: 3, instancesCount: 4, variables: {} },
        },
        searchText: '',
      });
      const placeholders = itemBeforeInstances.children || [];
      expect(placeholders).toHaveLength(1);
      expect(placeholders[0].isPlaceholder).toBe(true);

      const [itemWithInstances] = buildWatchedItems({
        watchedExpressions,
        evaluations: {
          'Enemy.Life': {
            result: 3,
            instancesCount: 4,
            instances: makeInstances(4),
            variables: {},
          },
        },
        searchText: '',
      });
      expect(
        (itemWithInstances.children || []).map(child => child.name)
      ).toEqual(['#1', '#2', '#3', '#4']);
    });

    it('lists every instance when the search names the variable itself', () => {
      const [item] = buildWatchedItems({
        watchedExpressions: [
          {
            expression: 'Enemy.Life',
            sourceType: gd.VariablesContainer.Object,
            isValid: true,
          },
        ],
        evaluations: {
          'Enemy.Life': {
            result: 3,
            instancesCount: 4,
            instances: makeInstances(4),
            variables: {},
          },
        },
        searchText: 'enemy',
      });

      expect(item.children || []).toHaveLength(4);
    });
  });

  describe('filterWatchedItems', () => {
    it('keeps the variables matching the search, or holding a match', () => {
      const items = buildWatchedItems({
        watchedExpressions: [
          {
            expression: 'Score',
            sourceType: gd.VariablesContainer.Scene,
            isValid: true,
          },
          {
            expression: 'Enemy.Name',
            sourceType: gd.VariablesContainer.Object,
            isValid: true,
          },
          {
            expression: 'Lives',
            sourceType: gd.VariablesContainer.Scene,
            isValid: true,
          },
        ],
        evaluations: {
          Score: { result: 12, variables: {} },
          'Enemy.Name': {
            result: 'Value 1',
            instancesCount: 3,
            instances: makeInstances(3),
            variables: {},
          },
          Lives: { result: 3, variables: {} },
        },
        searchText: 'value 2',
      });

      expect(
        filterWatchedItems(items, 'value 2').map(item => item.name)
      ).toEqual(['Enemy.Name']);
      expect(filterWatchedItems(items, '')).toBe(items);
    });
  });
});
