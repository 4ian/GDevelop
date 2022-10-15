// @flow
import * as React from 'react';
import { I18n } from '@lingui/react';
import { t, Trans } from '@lingui/macro';
import { Accordion, AccordionHeader, AccordionBody } from '../UI/Accordion';
import Text from '../UI/Text';
import InlineCheckbox from '../UI/InlineCheckbox';
import { ColumnStackLayout } from '../UI/Layout';
import {
  TagAssetStoreSearchFilter,
  AnimatedAssetStoreSearchFilter,
  ObjectTypeAssetStoreSearchFilter,
  LicenseAssetStoreSearchFilter,
  DimensionAssetStoreSearchFilter,
  ColorAssetStoreSearchFilter,
} from './AssetStoreSearchFilter';
import { type AssetFiltersState } from './AssetStoreContext';
import FlatButton from '../UI/FlatButton';
import { Line, Column } from '../UI/Grid';
import { type RGBColor } from '../Utils/ColorTransformer';
import { HexColorField } from './HexColorField';
import Slider from '../UI/Slider';

type Choice = {|
  label: React.Node,
  value: string,
|};

type MultipleChoiceFilterProps = {|
  filterKey: string,
  title: ?React.Node,
  choices: Choice[],
  isChoiceChecked: (choice: string) => boolean,
  setChoiceChecked: (choice: string, checked: boolean) => void,
|};

const MultipleChoiceFilter = ({
  filterKey,
  title,
  choices,
  isChoiceChecked,
  setChoiceChecked,
}: MultipleChoiceFilterProps) => {
  return (
    <I18n>
      {({ i18n }) => (
        <Accordion key={filterKey} defaultExpanded>
          <AccordionHeader>
            <Text displayInlineAsSpan>{title}</Text>
          </AccordionHeader>
          <AccordionBody>
            <ColumnStackLayout>
              {choices.map(tag => (
                <InlineCheckbox
                  key={tag.value}
                  label={i18n._(tag.label)}
                  checked={isChoiceChecked(tag.value)}
                  onCheck={(e, checked) => setChoiceChecked(tag.value, checked)}
                />
              ))}
            </ColumnStackLayout>
          </AccordionBody>
        </Accordion>
      )}
    </I18n>
  );
};

type SetFilterProps = {|
  filterKey: string,
  title: ?React.Node,
  choices: Choice[],
  values: Set<string>,
  setValues: (Set<string>) => void,
|};

const SetFilter = ({
  filterKey,
  title,
  choices,
  values,
  setValues,
}: SetFilterProps) => {
  return (
    <MultipleChoiceFilter
      filterKey={filterKey}
      title={title}
      choices={choices}
      isChoiceChecked={choice => values.has(choice)}
      setChoiceChecked={(choice, checked) => {
        if (checked) {
          values.add(choice);
        } else {
          values.delete(choice);
        }
        setValues(values);
      }}
    />
  );
};

type TagFilterProps = {|
  filterKey: string,
  title: ?React.Node,
  choices: Choice[],
  searchFilter: TagAssetStoreSearchFilter,
  setSearchFilter: TagAssetStoreSearchFilter => void,
  onFilterChange: () => void,
|};

const TagFilter = ({
  filterKey,
  title,
  choices,
  searchFilter,
  setSearchFilter,
  onFilterChange,
}: TagFilterProps) => {
  return (
    <SetFilter
      filterKey={filterKey}
      title={title}
      choices={choices}
      values={searchFilter.tags}
      setValues={values => {
        setSearchFilter(new TagAssetStoreSearchFilter(values));
        onFilterChange();
      }}
    />
  );
};

type RangeFilterProps = {|
  filterKey: string,
  title: ?React.Node,
  min: number,
  max: number,
  step: number,
  scale: number => number,
  range: [number, number],
  setRange: ([number, number]) => void,
|};

const RangeFilter = ({
  filterKey,
  title,
  min,
  max,
  scale,
  step,
  range,
  setRange,
}: RangeFilterProps) => {
  return (
    <I18n>
      {({ i18n }) => (
        <Accordion key={filterKey} defaultExpanded>
          <AccordionHeader>
            <Text displayInlineAsSpan>{title}</Text>
          </AccordionHeader>
          <AccordionBody>
            <Column expand>
              <Line noMargin>
                <Slider
                  value={range}
                  min={min}
                  max={max}
                  step={step}
                  scale={scale}
                  marks={true}
                  valueLabelDisplay="auto"
                  onChange={newValue => setRange(newValue)}
                />
              </Line>
            </Column>
          </AccordionBody>
        </Accordion>
      )}
    </I18n>
  );
};

type ColorFilterProps = {|
  filterKey: string,
  title: ?React.Node,
  color: RGBColor | null,
  setColor: (RGBColor | null) => void,
|};

const ColorFilter = ({
  filterKey,
  title,
  color,
  setColor,
}: ColorFilterProps) => {
  return (
    <I18n>
      {({ i18n }) => (
        <Accordion key={filterKey} defaultExpanded>
          <AccordionHeader>
            <Text displayInlineAsSpan>{title}</Text>
          </AccordionHeader>
          <AccordionBody>
            <Column expand>
              <Line noMargin>
                <HexColorField
                  disableAlpha
                  fullWidth
                  color={color}
                  onChange={setColor}
                />
              </Line>
            </Column>
          </AccordionBody>
        </Accordion>
      )}
    </I18n>
  );
};

export const clearAllFilters = (assetFiltersState: AssetFiltersState): void => {
  assetFiltersState.setAnimatedFilter(new AnimatedAssetStoreSearchFilter());
  assetFiltersState.setViewpointFilter(new TagAssetStoreSearchFilter());
  assetFiltersState.setDimensionFilter(new DimensionAssetStoreSearchFilter());
  assetFiltersState.setObjectTypeFilter(new ObjectTypeAssetStoreSearchFilter());
  assetFiltersState.setColorFilter(new ColorAssetStoreSearchFilter());
  assetFiltersState.setLicenseFilter(new LicenseAssetStoreSearchFilter());
};

type AssetStoreFilterPanelProps = {|
  assetFiltersState: AssetFiltersState,
  onChoiceChange: () => void,
|};

export const AssetStoreFilterPanel = ({
  assetFiltersState,
  onChoiceChange,
}: AssetStoreFilterPanelProps) => {
  return (
    <Column>
      <MultipleChoiceFilter
        filterKey="Animation"
        title={<Trans>Animation</Trans>}
        choices={[
          { label: t`Multiple frames`, value: 'multiple-frames' },
          { label: t`Multiple states`, value: 'multiple-states' },
        ]}
        isChoiceChecked={choice =>
          (choice === 'multiple-frames' &&
            assetFiltersState.animatedFilter.mustBeAnimated) ||
          (choice === 'multiple-states' &&
            assetFiltersState.animatedFilter.mustHaveSeveralState)
        }
        setChoiceChecked={(choice, checked) => {
          const animatedFilter = assetFiltersState.animatedFilter;
          const mustBeAnimated =
            choice === 'multiple-frames'
              ? checked
              : animatedFilter.mustBeAnimated;
          const mustHaveSeveralState =
            choice === 'multiple-states'
              ? checked
              : animatedFilter.mustHaveSeveralState;
          assetFiltersState.setAnimatedFilter(
            new AnimatedAssetStoreSearchFilter(
              mustBeAnimated,
              mustHaveSeveralState
            )
          );
          onChoiceChange();
        }}
      />
      <TagFilter
        filterKey="Viewpoint"
        title={<Trans>Viewpoint</Trans>}
        choices={[
          { label: t`Top-down`, value: 'top-down' },
          { label: t`Side view`, value: 'side view' },
          { label: t`Isometric`, value: 'isometric' },
        ]}
        searchFilter={assetFiltersState.viewpointFilter}
        setSearchFilter={assetFiltersState.setViewpointFilter}
        onFilterChange={onChoiceChange}
      />
      <RangeFilter
        filterKey="PixelSize"
        title={<Trans>Pixel size</Trans>}
        min={Math.log2(DimensionAssetStoreSearchFilter.boundMin)}
        max={Math.log2(DimensionAssetStoreSearchFilter.boundMax)}
        step={0.5}
        scale={x => Math.round(2 ** x)}
        range={[
          Math.log2(assetFiltersState.dimensionFilter.dimensionMin),
          Math.log2(assetFiltersState.dimensionFilter.dimensionMax),
        ]}
        setRange={range => {
          assetFiltersState.setDimensionFilter(
            new DimensionAssetStoreSearchFilter(2 ** range[0], 2 ** range[1])
          );
          onChoiceChange();
        }}
      />
      <SetFilter
        filterKey="ObjectType"
        title={<Trans>Type of objects</Trans>}
        choices={[
          { label: t`Sprite`, value: 'sprite' },
          { label: t`Tiled sprite`, value: 'tiled' },
          { label: t`Panel sprite`, value: '9patch' },
        ]}
        values={assetFiltersState.objectTypeFilter.objectTypes}
        setValues={values => {
          assetFiltersState.setObjectTypeFilter(
            new ObjectTypeAssetStoreSearchFilter(values)
          );
          onChoiceChange();
        }}
      />
      <ColorFilter
        filterKey="Color"
        title={<Trans>Color</Trans>}
        color={assetFiltersState.colorFilter.color}
        setColor={color => {
          assetFiltersState.setColorFilter(
            new ColorAssetStoreSearchFilter(color)
          );
          onChoiceChange();
        }}
      />
      <MultipleChoiceFilter
        filterKey="License"
        title={<Trans>License</Trans>}
        choices={[
          {
            label: t`Exclude attribution requirements`,
            value: 'without-attribution',
          },
        ]}
        isChoiceChecked={choice =>
          assetFiltersState.licenseFilter.attributionFreeOnly
        }
        setChoiceChecked={(choice, checked) => {
          assetFiltersState.setLicenseFilter(
            new LicenseAssetStoreSearchFilter(checked)
          );
          onChoiceChange();
        }}
      />
      <Line justifyContent="center">
        <FlatButton
          label={<Trans>Clear all filters</Trans>}
          primary={false}
          onClick={() => {
            clearAllFilters(assetFiltersState);
            onChoiceChange();
          }}
        />
      </Line>
    </Column>
  );
};
