// @flow

import * as React from 'react';
import { action } from '@storybook/addon-actions';
import paperDecorator from '../../PaperDecorator';
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
import { Column } from '../../../UI/Grid';
import { queryElementOrItsMostVisuallySignificantParent } from '../../../InAppTutorial/InAppTutorialStepDisplayer';
import SearchBar from '../../../UI/SearchBar';

export default {
  title: 'In-app tutorial/ElementHighlighterAndTooltipDisplayer',
  component: InAppTutorialElementHighlighter,
  decorators: [paperDecorator],
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
    description: 'Description only (without quit button)',
    placement: 'left',
  },
  '#multiline-input': {
    description: 'Description with `selectable [code]`.',
    placement: 'left',
  },
  '#search-bar': {
    description: 'Highlight a search bar.',
    placement: 'top',
  },
  'element-in-list': {
    description:
      'It should disappear when element not visible, and an **arrow** should appear to show the direction where to scroll.',
  },
};

const elementIdToShowQuitButton = {
  '#add-parameter-button': true,
  '#add-event-primary-button': true,
  '#input': false,
  'element-in-list': true,
};

export const Default = () => {
  const [listItemRef, setListItemRef] = React.useState<any>(null);
  const [elementToHighlight, setElementToHighlight] = React.useState<any>(null);
  const [textFieldValue, setTextFieldValue] = React.useState<string>(
    'Object.Variable'
  );
  const [searchValue, setSearchValue] = React.useState<string>('Search me');
  const [multilineInputValue, setMultilineInputValue] = React.useState<string>(
    "First layout\nThis is what we're gonna do"
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
      setElementToHighlight(listItemRef);
    }
  };

  React.useEffect(
    () => {
      if (elementToHighlightId.startsWith('#')) {
        setElementToHighlight(
          queryElementOrItsMostVisuallySignificantParent(elementToHighlightId)
        );
      }
    },
    [elementToHighlightId]
  );

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
            value="#multiline-input"
            control={<Radio />}
            label="Multiline textfield"
          />
          <FormControlLabel
            value="#search-bar"
            control={<Radio />}
            label="Search bar"
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
          <Column expand>
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
          </Column>
          <ColumnStackLayout expand>
            <SemiControlledTextField
              multiline
              floatingLabelText="Multiline input"
              id="multiline-input"
              onChange={setMultilineInputValue}
              value={multilineInputValue}
            />
            <SearchBar
              id="search-bar"
              onRequestSearch={() => action('search')()}
              onChange={setSearchValue}
              value={searchValue}
            />
          </ColumnStackLayout>
        </ResponsiveLineStackLayout>
      </ColumnStackLayout>

      {elementToHighlight && (
        <>
          <InAppTutorialElementHighlighter element={elementToHighlight} />
          <InAppTutorialTooltipDisplayer
            anchorElement={elementToHighlight}
            tooltip={elementIdToTooltip[elementToHighlightId]}
            showQuitButton={elementIdToShowQuitButton[elementToHighlightId]}
            progress={28}
            endTutorial={() => action('end tutorial')()}
            goToNextStep={() => action('go to next step')()}
          />
        </>
      )}
    </>
  );
};
