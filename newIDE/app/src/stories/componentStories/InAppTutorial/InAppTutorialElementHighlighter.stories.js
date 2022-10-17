// @flow

import * as React from 'react';
import { action } from '@storybook/addon-actions';
import paperDecorator from '../../PaperDecorator';
import muiDecorator from '../../ThemeDecorator';
import InAppTutorialElementHighlighter from '../../../InAppTutorial/InAppTutorialElementHighlighter';
import InAppTutorialTooltipDisplayer from '../../../InAppTutorial/InAppTutorialTooltipDisplayer';
import RaisedButton from '../../../UI/RaisedButton';
import ScrollView from '../../../UI/ScrollView';
import SemiControlledTextField from '../../../UI/SemiControlledTextField';
import {
  ResponsiveLineStackLayout,
  ColumnStackLayout,
} from '../../../UI/Layout';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FixedHeightFlexContainer from '../../FixedHeightFlexContainer';
import { List, ListItem } from '../../../UI/List';

export default {
  title: 'In-app tutorial/ElementHighlighterAndTooltipDisplayer',
  component: InAppTutorialElementHighlighter,
  decorators: [paperDecorator, muiDecorator],
};

const elementIdToTooltip = {
  '#add-parameter-button': {
    title: 'This is the title',
    description: 'This is the description',
    placement: 'bottom',
  },
  '#add-event-primary-button': {
    title: 'Title only',
    placement: 'right',
  },
  '#input': {
    description: 'Description only',
    placement: 'left',
  },
  'element-in-list': {
    description:
      'It should disappear when element not visible, and an **arrow** should appear to show the direction where to scroll.',
  },
};

export const Default = () => {
  const [listItemRef, setListItemRef] = React.useState<any>(null);
  const [elementToHighlight, setElementToHighlight] = React.useState<any>(null);
  const [textFieldValue, setTextFieldValue] = React.useState<string>(
    'Object.Variable'
  );
  const [
    elementToHighlightId,
    setElementToHighlightId,
  ] = React.useState<string>('#add-parameter-button');

  const handleSelect = event => {
    const {
      target: { value },
    } = event;
    setElementToHighlightId(event.target.value);
    if (value === 'element-in-list') {
      console.log(listItemRef);
      setElementToHighlight(listItemRef);
    }
  };

  React.useEffect(
    () => {
      if (elementToHighlightId.startsWith('#')) {
        setElementToHighlight(document.querySelector(elementToHighlightId));
      }
    },
    [elementToHighlightId]
  );

  console.log(elementToHighlight);
  return (
    <>
      <ColumnStackLayout useLargeSpacer>
        <RadioGroup
          aria-label="gender"
          name="gender1"
          value={elementToHighlightId}
          onChange={handleSelect}
          style={{ flexDirection: 'row' }}
        >
          <FormControlLabel
            value="#add-parameter-button"
            control={<Radio />}
            label="Parameter button"
          />
          <FormControlLabel
            value="#add-event-primary-button"
            control={<Radio />}
            label="Event button"
          />
          <FormControlLabel
            value="#input"
            control={<Radio />}
            label="Textfield"
          />
          <FormControlLabel
            value="element-in-list"
            control={<Radio />}
            label="Element in list"
          />
        </RadioGroup>
        <ResponsiveLineStackLayout useLargeSpacer>
          <ColumnStackLayout expand>
            <RaisedButton
              id="add-parameter-button"
              label="Add parameter"
              onClick={() => action('onClick parameter')()}
            />
            <RaisedButton
              primary
              id="add-event-primary-button"
              label="Add event"
              onClick={() => action('onClick event')()}
            />
          </ColumnStackLayout>
          <ColumnStackLayout expand>
            <SemiControlledTextField
              id="input"
              onChange={setTextFieldValue}
              value={textFieldValue}
            />
          </ColumnStackLayout>
        </ResponsiveLineStackLayout>
        <ResponsiveLineStackLayout>
          <FixedHeightFlexContainer height={150}>
            <ScrollView>
              <List>
                <ListItem primaryText="First choice" />
                <ListItem primaryText="Another choice" />
                <ListItem primaryText="Choice paradox hits" />
                <ListItem
                  primaryText="I want this one"
                  ref={ref => setListItemRef(ref)}
                />
                <ListItem primaryText="Why not me?" />
                <ListItem primaryText="There's a choice to do?" />
                <ListItem primaryText="No one told me" />
                <ListItem primaryText="I don't have time for that" />
                <ListItem primaryText="Near the end" />
                <ListItem primaryText="Last but not least" />
              </List>
            </ScrollView>
          </FixedHeightFlexContainer>
        </ResponsiveLineStackLayout>
      </ColumnStackLayout>

      {elementToHighlight && (
        <>
          <InAppTutorialElementHighlighter element={elementToHighlight} />
          <InAppTutorialTooltipDisplayer
            anchorElement={elementToHighlight}
            tooltip={elementIdToTooltip[elementToHighlightId]}
          />
        </>
      )}
    </>
  );
};
