// @flow
import * as React from 'react';
import { type TagsTreeNode } from '../../Utils/GDevelopServices/Filters';
import TreeItem from '@material-ui/lab/TreeItem';
import { type ChosenCategory } from './FiltersChooser';
import ChevronArrowRight from '../CustomSvgIcons/ChevronArrowRight';
import ChevronArrowBottom from '../CustomSvgIcons/ChevronArrowBottom';

const nodeIdSeparator = ';-/>'; // A seemingly random string to ensure no clashes with tag names.
const toNodeId = (nodes: Array<TagsTreeNode>) =>
  nodes.map(node => node.name).join(nodeIdSeparator);

const TagsTreeItems = ({
  tagsTreeNodes,
  onChoose,
  parentNodes,
}: {|
  parentNodes: Array<TagsTreeNode>,
  tagsTreeNodes: Array<TagsTreeNode>,
  onChoose: ChosenCategory => void,
|}) => {
  if (!tagsTreeNodes.length) return null;

  return tagsTreeNodes.map(node => {
    const newParentNodes = [...parentNodes, node];
    return (
      <TreeItem
        nodeId={toNodeId(newParentNodes)}
        label={node.name}
        key={node.name}
        onLabelClick={() => onChoose({ node, parentNodes })}
        collapseIcon={node.children.length ? <ChevronArrowBottom /> : null}
        expandIcon={node.children.length ? <ChevronArrowRight /> : null}
      >
        <TagsTreeItems
          tagsTreeNodes={node.children}
          parentNodes={newParentNodes}
          onChoose={onChoose}
        />
      </TreeItem>
    );
  });
};
