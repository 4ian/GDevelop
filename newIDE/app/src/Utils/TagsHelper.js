// @flow

// Helpers to manipulate tags. See also EditTagsDialog.js

export type Tags = Array<string>;
export type SelectedTags = Tags;

export const removeTag = (tags: Tags, tag: string): Tags => {
  return tags.filter((selectedTag) => selectedTag !== tag);
};

export const addTags = (tags: Tags, newTags: Tags): Tags => {
  return Array.from(new Set([...tags, ...newTags]));
};

export type BuildTagsMenuTemplateOptions = {|
  noTagLabel: string,
  getAllTags: () => Array<string>,
  selectedTags: SelectedTags,
  onChange: (SelectedTags) => void,
  onEditTags?: () => void,
  editTagsLabel?: string,
|};

export const buildTagsMenuTemplate = ({
  noTagLabel,
  getAllTags,
  selectedTags,
  onChange,
  onEditTags,
  editTagsLabel,
}: BuildTagsMenuTemplateOptions): Array<any> => {
  const allTags = getAllTags();
  const footerMenuItems =
    onEditTags && editTagsLabel
      ? [
          {
            type: 'separator',
          },
          {
            label: editTagsLabel,
            click: onEditTags,
          },
        ]
      : [];

  if (!allTags.length) {
    return [
      {
        label: noTagLabel,
        enabled: false,
      },
      ...footerMenuItems,
    ];
  }

  return allTags
    .map((tag) => ({
      type: 'checkbox',
      label: tag,
      checked: selectedTags.includes(tag),
      click: () => {
        if (selectedTags.includes(tag)) {
          onChange(removeTag(selectedTags, tag));
        } else {
          onChange(addTags(selectedTags, [tag]));
        }
      },
    }))
    .concat(footerMenuItems);
};

export const getTagsFromString = (tagsString: string): Tags => {
  if (tagsString.trim() === '') return [];

  return tagsString.split(',').map((tag) => tag.trim());
};

export const getStringFromTags = (tags: Tags): string => {
  return tags.join(', ');
};

export const hasStringAllTags = (tagsString: string, tags: Tags) => {
  for (const tag of tags) {
    if (tagsString.indexOf(tag) === -1) return false;
  }

  return true;
};
