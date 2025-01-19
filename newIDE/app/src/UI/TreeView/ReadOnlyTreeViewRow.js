// @flow

import * as React from 'react';
import { areEqual } from 'react-window';
import IconButton from '../IconButton';
import ArrowHeadBottom from '../CustomSvgIcons/ArrowHeadBottom';
import ArrowHeadRight from '../CustomSvgIcons/ArrowHeadRight';
import Folder from '../CustomSvgIcons/Folder';
import ListIcon from '../ListIcon';
import classes from './TreeView.module.css';
import { type ItemBaseAttributes } from './ReadOnlyTreeView';
import { type ItemData } from './ReadOnlyTreeView';
import { dataObjectToProps } from '../../Utils/HTMLDataset';
import classNames from 'classnames';
import RaisedButton from '../RaisedButton';

const iconSize = 24;

type Props<Item> = {|
  index: number,
  style: any,
  data: ItemData<Item>,
  /** Used by react-window. */
  isScrolling?: boolean,
|};

const TreeViewRow = <Item: ItemBaseAttributes>(props: Props<Item>) => {
  const { data, index, style } = props;
  const { flattenedData, onOpen, onClick, onSelect, getItemHtmlId } = data;
  const node = flattenedData[index];
  const left = node.depth * 16;
  const containerRef = React.useRef<?HTMLDivElement>(null);

  const onClickItem = React.useCallback(
    event => {
      if (!node || node.item.isPlaceholder) return;
      if (
        (node.item.isRoot || node.item.openWithSingleClick) &&
        !node.disableCollapse
      ) {
        onOpen(node, index);
        return;
      }
      onSelect({ node, exclusive: !(event.metaKey || event.ctrlKey) });
      onClick(node);
    },
    [onClick, onSelect, node, onOpen, index]
  );

  const onDoubleClickItem = React.useCallback(
    e => {
      if (!node || !node.hasChildren || node.disableCollapse) return;
      onOpen(node, index);
    },
    [node, onOpen, index]
  );

  if (node.item.displayAsPrimaryButton) {
    return (
      <div style={style} ref={containerRef}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
          }}
        >
          <RaisedButton primary onClick={onClickItem} label={node.name} />
        </div>
      </div>
    );
  }

  const displayAsFolder = node.canHaveChildren;

  return (
    <div style={style} ref={containerRef}>
      <div
        style={{ paddingLeft: left }}
        className={classNames(classes.fullHeightFlexContainer, {
          [classes.withDivider]: node.item.isRoot && index > 0,
        })}
      >
        <div
          id={getItemHtmlId ? getItemHtmlId(node.item, index) : undefined}
          onClick={onClickItem}
          onDoubleClick={onDoubleClickItem}
          className={classNames(classes.rowContainer, {
            [classes.selected]: node.selected,
          })}
          aria-selected={node.selected}
          aria-expanded={displayAsFolder ? !node.collapsed : false}
          {...dataObjectToProps(node.dataset)}
        >
          <div className={classes.fullSpaceContainer}>
            <div className={classes.rowContent}>
              <div
                className={classNames(classes.rowContentSide, {
                  [classes.rowContentSideLeft]: !node.item.isRoot,
                  [classes.rowContentExtraPadding]: !displayAsFolder,
                })}
              >
                {displayAsFolder ? (
                  <>
                    <IconButton
                      size="small"
                      onClick={e => {
                        e.stopPropagation();
                        onOpen(node, index);
                      }}
                      disabled={node.disableCollapse}
                    >
                      {node.collapsed ? (
                        <ArrowHeadRight fontSize="small" />
                      ) : (
                        <ArrowHeadBottom fontSize="small" />
                      )}
                    </IconButton>
                    {!node.thumbnailSrc ||
                    node.thumbnailSrc === 'NONE' ? null : node.thumbnailSrc !==
                      'FOLDER' ? (
                      <div className={classes.thumbnail}>
                        <ListIcon iconSize={iconSize} src={node.thumbnailSrc} />
                      </div>
                    ) : (
                      !node.item.isRoot && (
                        <Folder className={classes.folderIcon} />
                      )
                    )}
                  </>
                ) : node.thumbnailSrc ? (
                  <div className={classes.thumbnail}>
                    <ListIcon iconSize={iconSize} src={node.thumbnailSrc} />
                  </div>
                ) : null}
                <div className={classNames(classes.itemTextContainer)}>
                  <span
                    className={classNames(
                      classes.itemName,
                      {
                        [classes.rootFolder]: node.item.isRoot,
                        [classes.placeholder]: node.item.isPlaceholder,
                      },
                      node.extraClass
                    )}
                  >
                    {node.name}
                  </span>
                  {node.description && (
                    <span className={classNames(classes.itemDescription)}>
                      {node.description}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// $FlowFixMe - memo does not support having a generic in the props.
export default React.memo<Props>(TreeViewRow, areEqual);
