// @flow

import * as React from 'react';
import { I18n } from '@lingui/react';
import { Trans, t } from '@lingui/macro';
import { type I18n as I18nType } from '@lingui/core';
import { type FilledCloudProjectVersion } from '../Utils/GDevelopServices/Project';
import {
  getUserPublicProfilesByIds,
  type UserPublicProfileByIds,
} from '../Utils/GDevelopServices/User';
import { Column } from '../UI/Grid';
import ContextMenu, { type ContextMenuInterface } from '../UI/Menu/ContextMenu';
import FlatButton from '../UI/FlatButton';
import { DayGroupRow } from './ProjectVersionRow';

type VersionsGroupedByDay = {|
  [day: number]: Array<FilledCloudProjectVersion>,
|};

const groupVersionsByDay = (
  versions: Array<FilledCloudProjectVersion>
): VersionsGroupedByDay => {
  if (versions.length === 0) return {};

  const versionsGroupedByDay = {};
  versions.forEach(version => {
    const dayDate = new Date(version.createdAt.slice(0, 10)).getTime();
    if (!versionsGroupedByDay[dayDate]) {
      versionsGroupedByDay[dayDate] = [version];
    } else {
      versionsGroupedByDay[dayDate].push(version);
    }
  });
  return versionsGroupedByDay;
};

type Props = {|
  versions: Array<FilledCloudProjectVersion>,
  onRenameVersion: (
    FilledCloudProjectVersion,
    {| label: string |}
  ) => Promise<void>,
  onLoadMore: () => Promise<void>,
  canLoadMore: boolean,
  onCheckoutVersion: FilledCloudProjectVersion => void,
|};

const VersionHistory = ({
  versions,
  onRenameVersion,
  onLoadMore,
  canLoadMore,
  onCheckoutVersion,
}: Props) => {
  const [
    usersPublicProfileByIds,
    setUsersPublicProfileByIds,
  ] = React.useState<?UserPublicProfileByIds>();
  const [editedVersionId, setEditedVersionId] = React.useState<?string>(null);
  const [
    isLoadingMoreVersions,
    setIsLoadingMoreVersions,
  ] = React.useState<boolean>(false);
  const contextMenuRef = React.useRef<?ContextMenuInterface>(null);

  const userIdsToFetch = React.useMemo(
    () => versions.map(version => version.userId).filter(Boolean),
    [versions]
  );

  const versionsGroupedByDay = React.useMemo(
    () => groupVersionsByDay(versions),
    [versions]
  );
  const days = Object.keys(versionsGroupedByDay)
    .map(dayStr => Number(dayStr))
    .sort()
    .reverse();

  React.useEffect(
    () => {
      (async () => {
        if (!userIdsToFetch) return;
        if (userIdsToFetch.length === 0) {
          setUsersPublicProfileByIds({});
          return;
        }
        const _usersPublicProfileByIds = await getUserPublicProfilesByIds(
          userIdsToFetch
        );
        setUsersPublicProfileByIds(_usersPublicProfileByIds);
      })();
    },
    [userIdsToFetch]
  );

  const buildVersionMenuTemplate = React.useCallback(
    (i18n: I18nType, options: { version: FilledCloudProjectVersion }) => {
      return [
        {
          label: i18n._(options.version.label ? t`Edit name` : t`Name version`),
          click: () => {
            setEditedVersionId(options.version.id);
          },
        },
        {
          label: i18n._(t`Checkout version`),
          click: () => {
            onCheckoutVersion(options.version);
          },
        },
      ];
    },
    [onCheckoutVersion]
  );

  const renameVersion = React.useCallback(
    (version: FilledCloudProjectVersion, newName: string) => {
      onRenameVersion(version, { label: newName });
      setEditedVersionId(null);
    },
    [onRenameVersion]
  );

  const onCancelRenaming = React.useCallback(() => {
    setEditedVersionId(null);
  }, []);

  const openContextMenu = React.useCallback(
    (event: PointerEvent, version: FilledCloudProjectVersion) => {
      const { current: contextMenu } = contextMenuRef;
      if (!contextMenu) return;
      contextMenu.open(event.clientX, event.clientY, { version });
    },
    []
  );

  const loadMore = React.useCallback(
    async () => {
      setIsLoadingMoreVersions(true);
      try {
        await onLoadMore();
      } finally {
        setIsLoadingMoreVersions(false);
      }
    },
    [onLoadMore]
  );

  if (!usersPublicProfileByIds) return null;

  return (
    <>
      <I18n>
        {({ i18n }) => (
          <Column>
            {days.map(day => {
              const dayVersions = versionsGroupedByDay[day];
              if (!dayVersions || dayVersions.length === 0) return null;
              return (
                <DayGroupRow
                  key={day}
                  versions={dayVersions}
                  day={day}
                  usersPublicProfileByIds={usersPublicProfileByIds}
                  onRenameVersion={renameVersion}
                  onCancelRenaming={onCancelRenaming}
                  onContextMenu={openContextMenu}
                  editedVersionId={editedVersionId}
                />
              );
            })}
            <FlatButton
              primary
              disabled={isLoadingMoreVersions || !canLoadMore}
              label={
                canLoadMore ? (
                  isLoadingMoreVersions ? (
                    <Trans>Loading...</Trans>
                  ) : (
                    <Trans>Show older</Trans>
                  )
                ) : (
                  <Trans>All versions loaded</Trans>
                )
              }
              onClick={loadMore}
            />
          </Column>
        )}
      </I18n>
      <ContextMenu
        ref={contextMenuRef}
        buildMenuTemplate={buildVersionMenuTemplate}
      />
    </>
  );
};

export default VersionHistory;
