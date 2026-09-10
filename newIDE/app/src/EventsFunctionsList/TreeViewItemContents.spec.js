// @flow

import { EventsFunctionTreeViewItemContent } from './EventsFunctionTreeViewItemContent';
import { EventsBasedObjectTreeViewItemContent } from './EventsBasedObjectTreeViewItemContent';
import { EventsBasedBehaviorTreeViewItemContent } from './EventsBasedBehaviorTreeViewItemContent';

// Transitively imported, but shipped as untransformed ESM that Jest cannot
// load. jest.mock is hoisted above imports by babel-jest.
jest.mock('three/src/math/MathUtils', () => ({
  generateUUID: () => 'mock-uuid',
}));

// Selection must stay side-effect free: the tree view also selects
// programmatically, notably when a drag starts. Opening is done on click.
describe('EventsFunctionsList item contents', () => {
  describe('EventsFunctionTreeViewItemContent', () => {
    const makeContent = () => {
      const eventsFunction = { name: 'MyFunction' };
      const props: any = {
        onSelectEventsFunction: jest.fn(),
        eventsBasedBehavior: { name: 'MyBehavior' },
        eventsBasedObject: { name: 'MyObject' },
      };
      const functionFolderOrFunction: any = {
        getFunction: () => eventsFunction,
      };
      return {
        content: new EventsFunctionTreeViewItemContent(
          functionFolderOrFunction,
          props
        ),
        props,
        eventsFunction,
      };
    };

    it('does not open the function on selection', () => {
      const { content, props } = makeContent();
      content.onSelect();
      expect(props.onSelectEventsFunction).not.toHaveBeenCalled();
    });

    it('opens the function on click', () => {
      const { content, props, eventsFunction } = makeContent();
      content.onClick();
      expect(props.onSelectEventsFunction).toHaveBeenCalledWith(
        eventsFunction,
        props.eventsBasedBehavior,
        props.eventsBasedObject
      );
    });
  });

  describe('EventsBasedObjectTreeViewItemContent', () => {
    const makeContent = () => {
      const eventsBasedObject: any = { name: 'MyEventsBasedObject' };
      const props: any = {
        onSelectEventsBasedObject: jest.fn(),
      };
      return {
        content: new EventsBasedObjectTreeViewItemContent(
          eventsBasedObject,
          props
        ),
        props,
        eventsBasedObject,
      };
    };

    it('does not open the object on selection', () => {
      const { content, props } = makeContent();
      content.onSelect();
      expect(props.onSelectEventsBasedObject).not.toHaveBeenCalled();
    });

    it('opens the object on click', () => {
      const { content, props, eventsBasedObject } = makeContent();
      content.onClick();
      expect(props.onSelectEventsBasedObject).toHaveBeenCalledWith(
        eventsBasedObject
      );
    });
  });

  describe('EventsBasedBehaviorTreeViewItemContent', () => {
    const makeContent = () => {
      const eventsBasedBehavior: any = { name: 'MyEventsBasedBehavior' };
      const props: any = {
        onSelectEventsBasedBehavior: jest.fn(),
      };
      return {
        content: new EventsBasedBehaviorTreeViewItemContent(
          eventsBasedBehavior,
          props
        ),
        props,
        eventsBasedBehavior,
      };
    };

    it('does not open the behavior on selection', () => {
      const { content, props } = makeContent();
      content.onSelect();
      expect(props.onSelectEventsBasedBehavior).not.toHaveBeenCalled();
    });

    it('opens the behavior on click', () => {
      const { content, props, eventsBasedBehavior } = makeContent();
      content.onClick();
      expect(props.onSelectEventsBasedBehavior).toHaveBeenCalledWith(
        eventsBasedBehavior
      );
    });
  });
});
