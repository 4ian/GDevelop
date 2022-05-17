// @flow
import * as React from 'react';
import { I18n } from '@lingui/react';
import { Accordion, AccordionHeader, AccordionBody } from '../UI/Accordion';
import Text from '../UI/Text';
import InlineCheckbox from '../UI/InlineCheckbox';
import { ColumnStackLayout } from '../UI/Layout';
import { TagSearchFilter } from '../UI/Search/UseSearchItem';
import { TagAssetStoreSearchFilter } from './AssetStoreSearchFilter';

type Tag = {|
  label: ?React.Node,
  value: string,
|};

type TagFilterProps = {|
  filterKey: string,
  title: ?React.Node,
  tags: Tag[],
  tagSearchFilter: TagAssetStoreSearchFilter,
  setTagSearchFilter: TagAssetStoreSearchFilter => void,
  onFilterChange: () => void,
|};

export const TagFilter = ({
  filterKey,
  title,
  tags,
  tagSearchFilter,
  setTagSearchFilter,
  onFilterChange,
}: TagFilterProps) => {
  return (
    <I18n>
      {({ i18n }) => (
        <Accordion key={filterKey} defaultExpanded>
          <AccordionHeader>
            <Text displayInlineAsSpan>{title}</Text>
          </AccordionHeader>
          <AccordionBody>
            <ColumnStackLayout>
              {tags.map(tag => (
                <InlineCheckbox
                  key={tag.value}
                  label={i18n._(tag.label)}
                  checked={tagSearchFilter.tags.has(tag.value)}
                  onCheck={() => {
                    if (tagSearchFilter.tags.has(tag.value)) {
                      tagSearchFilter.tags.delete(tag.value);
                    } else {
                      tagSearchFilter.tags.add(tag.value);
                    }
                    setTagSearchFilter(
                      new TagAssetStoreSearchFilter(tagSearchFilter.tags)
                    );
                    onFilterChange();
                  }}
                />
              ))}
            </ColumnStackLayout>
          </AccordionBody>
        </Accordion>
      )}
    </I18n>
  );
};
