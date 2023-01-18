// @flow
import * as React from 'react';
import {
  type Announcement,
  listAllAnnouncements,
} from '../Utils/GDevelopServices/Announcement';

type AnnouncementsFeedState = {|
  announcements: ?(Announcement[]),
  error: ?Error,
  fetchAnnouncements: () => void,
|};

export const AnnouncementsFeedContext = React.createContext<AnnouncementsFeedState>(
  {
    announcements: null,
    error: null,
    fetchAnnouncements: () => {},
  }
);

type AnnouncementsFeedStateProviderProps = {|
  children: React.Node,
|};

export const AnnouncementsFeedStateProvider = ({
  children,
}: AnnouncementsFeedStateProviderProps) => {
  const [announcements, setAnnouncements] = React.useState<?(Announcement[])>(
    null
  );
  const [error, setError] = React.useState<?Error>(null);
  const isLoading = React.useRef<boolean>(false);

  const fetchAnnouncements = React.useCallback(
    () => {
      if (isLoading.current) return;

      (async () => {
        setError(null);
        isLoading.current = true;

        try {
          const announcements = await listAllAnnouncements();

          setAnnouncements(announcements);
        } catch (error) {
          console.error(
            `Unable to load the announcements from the api:`,
            error
          );
          setError(error);
        }

        isLoading.current = false;
      })();
    },
    [isLoading]
  );

  // Preload the announcements when the app loads.
  React.useEffect(
    () => {
      // Don't attempt to load again announcements if they
      // were loaded already.
      if (announcements || isLoading.current) return;

      const timeoutId = setTimeout(() => {
        console.info('Pre-fetching announcements from the api...');
        fetchAnnouncements();
      }, 1000);
      return () => clearTimeout(timeoutId);
    },
    [fetchAnnouncements, announcements, isLoading]
  );

  const announcementsFeedState = React.useMemo(
    () => ({
      announcements,
      error,
      fetchAnnouncements,
    }),
    [announcements, error, fetchAnnouncements]
  );

  return (
    <AnnouncementsFeedContext.Provider value={announcementsFeedState}>
      {children}
    </AnnouncementsFeedContext.Provider>
  );
};
