// @flow
export type TagsTreeNode = {|
  name: string,
  children: Array<TagsTreeNode>,
  allChildrenTags: Array<string>,

  /**
   * If true, this node is a container of tags only, not a tag per itself (i.e:
   * this is not a tag that can contain other tags).
   */
  isTagContainerOnly?: boolean,
|};

export type Filters = {|
  allTags: Array<string>,
  defaultTags: Array<string>,
  tagsTree: Array<TagsTreeNode>,
|};
