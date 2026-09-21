// @flow
import { Trans } from '@lingui/macro';

import * as React from 'react';
import classNames from 'classnames';
import flatMap from 'lodash/flatMap';
import { type ProfilerMeasuresSection } from '..';
import ChevronArrowRight from '../../UI/CustomSvgIcons/ChevronArrowRight';
import ChevronArrowBottom from '../../UI/CustomSvgIcons/ChevronArrowBottom';
import classes from './Profiler.module.css';

type Props = {|
  profilerMeasures: ?ProfilerMeasuresSection,
|};

type ProfilerRowData = {|
  name: string,
  time: string,
  parentPercent: string,
  totalPercent: string,
  /** The share of the total time, drawn as a bar behind its value. */
  totalShare: number,
  depth: number,
  hasSubsections: boolean,
  path: string,
  isCollapsed: boolean,
|};

const MeasuresTable = ({ profilerMeasures }: Props): null | React.Node => {
  const [collapsedPaths, setCollapsedPaths] = React.useState({});

  const isSectionCollapsed = (path: string) => {
    // $FlowFixMe[invalid-computed-prop]
    return !!collapsedPaths[path];
  };

  const toggleSection = (path: string) => {
    // $FlowFixMe[incompatible-type]
    setCollapsedPaths({
      ...collapsedPaths,
      // $FlowFixMe[invalid-computed-prop]
      [path]: !collapsedPaths[path],
    });
  };

  const convertToDataRows = (
    name: string,
    parentSection: ?ProfilerMeasuresSection,
    section: ProfilerMeasuresSection,
    depth: number = 0,
    path: string = ''
  ): Array<ProfilerRowData> => {
    const parentPercent =
      parentSection && section.time && parentSection.time !== 0
        ? (section.time / parentSection.time) * 100
        : 100;
    const totalPercent =
      profilerMeasures && section.time && profilerMeasures.time !== 0
        ? (section.time / profilerMeasures.time) * 100
        : 100;
    const isCollapsed = isSectionCollapsed(path);
    // A section that was never entered has no time, and so no share of the
    // time of the frame either.
    const hasTime = !!section.time;

    return [
      {
        name,
        time: hasTime ? `${section.time.toFixed(2)}ms` : '?',
        parentPercent: hasTime ? `${parentPercent.toFixed(1)}%` : '-',
        totalPercent: hasTime ? `${totalPercent.toFixed(1)}%` : '-',
        totalShare: hasTime ? Math.max(0, Math.min(100, totalPercent)) : 0,
        depth,
        hasSubsections: !!Object.keys(section.subsections).length,
        path,
        isCollapsed,
      },
      ...(isCollapsed
        ? []
        : flatMap(section.subsections, (subsection, subsectionName) =>
            convertToDataRows(
              subsectionName,
              section,
              subsection,
              depth + 1,
              `${path}>${depth}.${subsectionName}`
            )
          )),
    ];
  };

  if (!profilerMeasures) return null;

  const dataRows = convertToDataRows('All', null, profilerMeasures);

  return (
    <div className={classes.measuresTable}>
      <div className={classNames(classes.row, classes.headerRow)}>
        <span className={classes.nameCell}>
          <Trans>Section name</Trans>
        </span>
        <span className={classes.numberCell}>
          <Trans>Time (ms)</Trans>
        </span>
        <span className={classes.numberCell}>
          <Trans>% of parent</Trans>
        </span>
        <span className={classes.numberCell}>
          <Trans>% of total</Trans>
        </span>
      </div>
      {dataRows.map(row => (
        <div
          key={row.path}
          className={classNames({
            [classes.row]: true,
            [classes.bodyRow]: true,
            [classes.rootRow]: row.depth === 0,
          })}
          style={{ '--profiler-share': `${row.totalShare}%` }}
        >
          <span
            className={classes.nameCell}
            style={{ paddingLeft: row.depth * 12 }}
          >
            {row.hasSubsections ? (
              <button
                type="button"
                className={classes.toggle}
                onClick={() => toggleSection(row.path)}
              >
                {row.isCollapsed ? (
                  <ChevronArrowRight />
                ) : (
                  <ChevronArrowBottom />
                )}
              </button>
            ) : (
              <span className={classes.togglePlaceholder} />
            )}
            {/*
              The name is wrapped in a span to prevent crashes when Google Translate
              translates the website. See https://github.com/4ian/GDevelop/issues/3453.
            */}
            <span className={classes.name} title={row.name}>
              {row.name}
            </span>
          </span>
          <span className={classes.numberCell}>{row.time}</span>
          <span className={classes.numberCell}>{row.parentPercent}</span>
          <span className={classes.numberCell}>{row.totalPercent}</span>
        </div>
      ))}
    </div>
  );
};

export default MeasuresTable;
