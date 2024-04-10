// @flow

import * as React from 'react';
import { ColumnStackLayout, ResponsiveLineStackLayout } from '../UI/Layout';
import Toggle from '../UI/Toggle';
import InAppTutorialElementHighlighter from '../InAppTutorial/InAppTutorialElementHighlighter';
import CompactSelectField from '../UI/CompactSelectField';
import { Column } from '../UI/Grid';

type Props = {|
  elements: {| label: string, id: string |}[],
  children: React.Node,
|};

const ElementHighlighterProvider = (props: Props) => {
  const [
    shouldHighlightField,
    setShouldHighlightField,
  ] = React.useState<boolean>(false);
  const [
    elementToHighlightId,
    setElementToHighlightId,
  ] = React.useState<?string>(props.elements[0] ? props.elements[0].id : null);
  const [elementToHighlight, setElementToHighlight] = React.useState<any>(null);
  React.useEffect(
    () => {
      if (!shouldHighlightField) {
        setElementToHighlight(null);
        return;
      }
      const element = elementToHighlightId
        ? document.getElementById(elementToHighlightId)
        : null;
      setElementToHighlight(element);
    },
    [elementToHighlightId, shouldHighlightField]
  );

  return (
    <>
      <ColumnStackLayout noMargin>
        {props.children}
        <ResponsiveLineStackLayout noMargin expand noColumnMargin>
          <Column expand noMargin justifyContent="center">
            <Toggle
              label="Highlight field"
              labelPosition="right"
              toggled={shouldHighlightField}
              onToggle={(e, active) => setShouldHighlightField(active)}
            />
          </Column>
          <Column expand noMargin justifyContent="center">
            <CompactSelectField
              value={elementToHighlightId || ''}
              onChange={setElementToHighlightId}
            >
              {props.elements.map(element => (
                <option
                  label={element.label}
                  value={element.id}
                  key={element.id}
                />
              ))}
            </CompactSelectField>
          </Column>
        </ResponsiveLineStackLayout>
      </ColumnStackLayout>
      {elementToHighlight && (
        <InAppTutorialElementHighlighter element={elementToHighlight} />
      )}
    </>
  );
};

export default ElementHighlighterProvider;
