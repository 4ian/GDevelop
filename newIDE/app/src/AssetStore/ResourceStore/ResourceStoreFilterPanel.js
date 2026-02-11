// @flow
import * as React from 'react';
import { t, Trans } from '@lingui/macro';
import {
  DurationResourceStoreSearchFilter,
  AudioTypeResourceStoreSearchFilter,
  AlphabetSupportResourceStoreSearchFilter,
} from './ResourceStoreSearchFilter';
import FlatButton from '../../UI/FlatButton';
import { Accordion, AccordionHeader, AccordionBody } from '../../UI/Accordion';
import { Line, Column } from '../../UI/Grid';
import { ResourceStoreContext } from './ResourceStoreContext';
import { RangeFilter } from '../AssetStoreFilterPanel';
import { formatDuration } from '../../Utils/Duration';
import Text from '../../UI/Text';
import CompactSelectField from '../../UI/CompactSelectField';
import SelectOption from '../../UI/SelectOption';
import TagChips from '../../UI/TagChips';
import { languageNames } from '../../Utils/LanguageName';

const languageChoices = [
  { value: '', label: '', disabled: true },
  ...Object.keys(languageNames).map(locale => ({
    value: locale,
    label: languageNames[locale].languageNativeName,
  })),
];

type Choice = {|
  label: React.Node,
  value: string,
  disabled?: boolean,
|};
type ValueWithLabel = {|
  label: React.Node,
  value: string,
|};

type SingleChoiceFilterProps = {|
  filterKey: string,
  title: ?React.Node,
  choices: Choice[],
  value: string,
  onChange: (newValue: string) => void,
|};

const SingleChoiceFilter = ({
  filterKey,
  title,
  choices,
  value,
  onChange,
}: SingleChoiceFilterProps) => {
  return (
    <Accordion key={filterKey} defaultExpanded>
      <AccordionHeader>
        <Text displayInlineAsSpan>{title}</Text>
      </AccordionHeader>
      <AccordionBody>
        <Column expand noMargin>
          <CompactSelectField value={value} onChange={onChange}>
            {choices.map(choice => (
              <SelectOption
                key={choice.value}
                value={choice.value}
                label={choice.label}
              />
            ))}
          </CompactSelectField>
        </Column>
      </AccordionBody>
    </Accordion>
  );
};

const durationMarks = DurationResourceStoreSearchFilter.durationMarks.map(
  duration => ({
    value: duration ? Math.log10(duration) : duration,
    label:
      duration < 60
        ? duration
        : formatDuration(duration, { noNullDuration: false }),
  })
);

type MultipleChoiceWithClosableTagsFilterProps = {|
  filterKey: string,
  title: ?React.Node,
  choices: Choice[],
  values: ValueWithLabel[],
  onChange: (newValue: ValueWithLabel[]) => void,
|};

const MultipleChoiceWithClosableTagsFilter = ({
  filterKey,
  title,
  choices,
  values,
  onChange,
}: MultipleChoiceWithClosableTagsFilterProps) => {
  const onSelect = (value: string) => {
    const userChoice = choices.find(choice => choice.value === value);
    const newValues = [
      ...values,
      userChoice
        ? { label: userChoice.label, value: userChoice.value }
        : undefined,
    ].filter(Boolean);
    onChange(newValues);
  };
  const onRemove = (value: string) => {
    const valueIndex = values.findIndex(
      valueWithLabel => valueWithLabel.value === value
    );
    if (valueIndex >= 0) {
      const newValues: ValueWithLabel[] = [...values];
      newValues.splice(valueIndex, 1);

      onChange(newValues);
    }
  };
  return (
    <Accordion key={filterKey} defaultExpanded>
      <AccordionHeader>
        <Text displayInlineAsSpan>{title}</Text>
      </AccordionHeader>
      <AccordionBody>
        <Column expand noMargin>
          <CompactSelectField value={''} onChange={onSelect}>
            {choices.map(choice => {
              if (
                values.findIndex(
                  valueWithLabel => valueWithLabel.value === choice.value
                ) >= 0
              ) {
                return (
                  <SelectOption
                    key={choice.value}
                    value={choice.value}
                    label={
                      typeof choice.label === 'string'
                        ? choice.label + ' ✓'
                        : choice.label
                    }
                    disabled
                  />
                );
              }
              return (
                <SelectOption
                  key={choice.value}
                  value={choice.value}
                  label={choice.label}
                />
              );
            })}
          </CompactSelectField>
          <TagChips tagsWithLabel={values} onRemove={onRemove} />
        </Column>
      </AccordionBody>
    </Accordion>
  );
};

export const ResourceStoreFilterPanel = ({
  resourceKind,
}: {
  resourceKind: 'audio' | 'font',
}) => {
  const {
    audioFiltersState,
    fontFiltersState,
    clearAllFilters,
  } = React.useContext(ResourceStoreContext);

  return (
    <Column noMargin expand>
      {resourceKind === 'audio' && (
        <>
          <SingleChoiceFilter
            title={<Trans>Audio type</Trans>}
            filterKey="AudioType"
            choices={[
              { value: '', label: t`All` },
              { value: 'music', label: t`Music` },
              { value: 'sound', label: t`Sound` },
            ]}
            value={audioFiltersState.audioTypeFilter.type || ''}
            onChange={newValue =>
              audioFiltersState.setAudioTypeFilter(
                new AudioTypeResourceStoreSearchFilter(
                  // $FlowIgnore - We are confident the select only uses value from the options.
                  newValue || null
                )
              )
            }
          />
          <RangeFilter
            filterKey="Duration"
            title={<Trans>Duration</Trans>}
            min={durationMarks[0].value}
            max={durationMarks[durationMarks.length - 1].value}
            step={null}
            scale={x => (x ? Math.round(10 ** x) : x)}
            range={[
              audioFiltersState.durationFilter.durationMin
                ? Math.log10(audioFiltersState.durationFilter.durationMin)
                : audioFiltersState.durationFilter.durationMin,
              audioFiltersState.durationFilter.durationMax
                ? Math.log10(audioFiltersState.durationFilter.durationMax)
                : audioFiltersState.durationFilter.durationMax,
            ]}
            setRange={range => {
              audioFiltersState.setDurationFilter(
                new DurationResourceStoreSearchFilter(
                  10 ** range[0],
                  10 ** range[1]
                )
              );
            }}
            valueLabelFormat={value =>
              formatDuration(value, { noNullDuration: false })
            }
            marks={durationMarks}
          />
        </>
      )}
      {resourceKind === 'font' && (
        <MultipleChoiceWithClosableTagsFilter
          filterKey="AlphabetSupport"
          title={<Trans>Alphabet</Trans>}
          choices={languageChoices}
          onChange={newValues =>
            fontFiltersState.setAlphabetSupportFilter(
              new AlphabetSupportResourceStoreSearchFilter(
                newValues.map(value => value.value)
              )
            )
          }
          values={fontFiltersState.alphabetSupportFilter.alphabets.map(
            alphabet => ({
              value: alphabet,
              label: languageNames[alphabet].languageNativeName,
            })
          )}
        />
      )}

      <Line justifyContent="center">
        <FlatButton
          label={<Trans>Clear all filters</Trans>}
          primary={false}
          onClick={clearAllFilters}
        />
      </Line>
    </Column>
  );
};
