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
import EmptyMessage from '../UI/EmptyMessage';

const anonymousAvatars = [
  { src: 'res/avatar/green-hero.svg', alt: 'Green hero avatar' },
  { src: 'res/avatar/red-hero.svg', alt: 'Red hero avatar' },
  { src: 'res/avatar/ghost.svg', alt: 'Ghost avatar' },
  { src: 'res/avatar/pink-cloud.svg', alt: 'Pink cloud avatar' },
];

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

export type OpenedVersionStatus = {|
  id: string,
  status: 'opened' | 'unsavedChanges' | 'saving' | 'saved',
|};

type Props = {|
  projectId: string,
  versions: Array<FilledCloudProjectVersion>,
  onRenameVersion: (
    FilledCloudProjectVersion,
    {| label: string |}
  ) => Promise<void>,
  openedVersionStatus: ?OpenedVersionStatus,
  onLoadMore: () => Promise<void>,
  canLoadMore: boolean,
  onCheckoutVersion: FilledCloudProjectVersion => Promise<void>,
  isVisible: boolean,
|};

const VersionHistory = React.memo<Props>(
  ({
    projectId,
    versions,
    onRenameVersion,
    openedVersionStatus,
    onLoadMore,
    canLoadMore,
    onCheckoutVersion,
  }) => {
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
      () => new Set(versions.map(version => version.userId).filter(Boolean)),
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
          if (userIdsToFetch.size === 0) {
            setUsersPublicProfileByIds({});
            return;
          }
          const _usersPublicProfileByIds = await getUserPublicProfilesByIds(
            Array.from(userIdsToFetch)
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
            label: i18n._(
              options.version.label ? t`Edit name` : t`Name version`
            ),
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

    const getAnonymousAvatar = React.useCallback(
      () => {
        let projectIdAsNumber = 0;
        projectId.split('').forEach(character => {
          projectIdAsNumber += projectId.charCodeAt(0);
        });
        return anonymousAvatars[projectIdAsNumber % anonymousAvatars.length];
      },
      [projectId]
    );

    if (!usersPublicProfileByIds) return null;

    return (
      <>
        <I18n>
          {({ i18n }) => (
            <Column noMargin>
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
                    getAnonymousAvatar={getAnonymousAvatar}
                    openedVersionStatus={openedVersionStatus}
                  />
                );
              })}
              {canLoadMore ? (
                <FlatButton
                  primary
                  disabled={isLoadingMoreVersions || !canLoadMore}
                  label={
                    isLoadingMoreVersions ? (
                      <Trans>Loading...</Trans>
                    ) : (
                      <Trans>Show older</Trans>
                    )
                  }
                  onClick={loadMore}
                />
              ) : (
                <EmptyMessage>
                  <Trans>This is the end of the version history.</Trans>
                </EmptyMessage>
              )}
            </Column>
          )}
        </I18n>
        <ContextMenu
          ref={contextMenuRef}
          buildMenuTemplate={buildVersionMenuTemplate}
        />
      </>
    );
  },
  (prevProps, nextProps) => !prevProps.isVisible && !nextProps.isVisible
);

export default VersionHistory;
