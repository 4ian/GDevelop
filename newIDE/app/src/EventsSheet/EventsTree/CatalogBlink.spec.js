// @flow
import { makeTestProject } from '../../fixtures/TestProject';
import {
  catalogBlinkEvenClassName,
  catalogBlinkOddClassName,
  getCatalogBlinkClassName,
  shouldBlinkEventFromCatalog,
} from './CatalogBlink';

const gd: libGDevelop = global.gd;

describe('EventsSheet/EventsTree/CatalogBlink', () => {
  it('matches only the selected catalog event and alternates animation classes', () => {
    const { project, testLayout } = makeTestProject(gd);
    try {
      const firstEvent = testLayout.getEvents().getEventAt(0);
      const secondEvent = testLayout.getEvents().getEventAt(1);

      expect(
        shouldBlinkEventFromCatalog({
          catalogBlinkEvent: firstEvent,
          event: firstEvent,
        })
      ).toBe(true);
      expect(
        shouldBlinkEventFromCatalog({
          catalogBlinkEvent: firstEvent,
          event: secondEvent,
        })
      ).toBe(false);
      expect(
        shouldBlinkEventFromCatalog({
          catalogBlinkEvent: null,
          event: firstEvent,
        })
      ).toBe(false);

      expect(getCatalogBlinkClassName(0)).toBe(catalogBlinkEvenClassName);
      expect(getCatalogBlinkClassName(1)).toBe(catalogBlinkOddClassName);
      expect(getCatalogBlinkClassName(2)).toBe(catalogBlinkEvenClassName);
    } finally {
      project.delete();
    }
  });
});
