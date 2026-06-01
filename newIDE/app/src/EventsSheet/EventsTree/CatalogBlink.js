// @flow

export const catalogBlinkEvenClassName = 'catalog-blink-event-even';
export const catalogBlinkOddClassName = 'catalog-blink-event-odd';

export const getCatalogBlinkClassName = (blinkNonce: number): string =>
  blinkNonce % 2 === 0
    ? catalogBlinkEvenClassName
    : catalogBlinkOddClassName;

export const shouldBlinkEventFromCatalog = ({
  catalogBlinkEvent,
  event,
}: {|
  catalogBlinkEvent: ?gdBaseEvent,
  event: gdBaseEvent,
|}): boolean =>
  !!catalogBlinkEvent && catalogBlinkEvent.ptr === event.ptr;
