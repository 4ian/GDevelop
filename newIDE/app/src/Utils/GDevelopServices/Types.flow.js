// @flow

export type TagsTreeNode = {|
  name: string,
  children: Array<TagsTreeNode>,
  allChildrenTags: Array<string>,
|};

export type Filters = {|
  allTags: Array<string>,
  defaultTags: Array<string>,
  tagsTree: Array<TagsTreeNode>,
|};
