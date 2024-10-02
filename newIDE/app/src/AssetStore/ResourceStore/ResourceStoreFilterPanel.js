// @flow
import * as React from 'react';
import { I18n } from '@lingui/react';
import { t, Trans } from '@lingui/macro';
import {
  DurationResourceStoreSearchFilter,
  AudioTypeResourceStoreSearchFilter,
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

type Choice = {|
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
    <I18n>
      {({ i18n }) => (
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
      )}
    </I18n>
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

export const ResourceStoreFilterPanel = ({
  resourceKind,
}: {
  resourceKind: 'audio' | 'font',
}) => {
  const { audioFiltersState, clearAllFilters } = React.useContext(
    ResourceStoreContext
  );

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
      {resourceKind === 'font' && <>Salut</>}

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
