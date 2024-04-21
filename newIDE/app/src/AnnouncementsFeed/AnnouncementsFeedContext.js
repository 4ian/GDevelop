// @flow
import * as React from 'react';
import {
  type Announcement,
  type Promotion,
  listAllAnnouncements,
  listAllPromotions,
} from '../Utils/GDevelopServices/Announcement';
import { ANNOUNCEMENTS_FETCH_TIMEOUT } from '../Utils/GlobalFetchTimeouts';

// NOTE: For the moment, we store announcements and promotions in the same context,
// as previously both were mixed under the announcements endpoint.
// This is to allow filtering announcements that are now promotions, in the same request.
// Once enough users are on the 5.3.190, and promotions are displayed to them,
// we can split them into 2 contexts.

type AnnouncementsFeedState = {|
  announcements: ?(Announcement[]),
  promotions: ?(Promotion[]),
  error: ?Error,
  fetchAnnouncementsAndPromotions: () => Promise<void>,
|};

export const AnnouncementsFeedContext = React.createContext<AnnouncementsFeedState>(
  {
    announcements: null,
    promotions: null,
    error: null,
    fetchAnnouncementsAndPromotions: async () => {},
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
  const [promotions, setPromotions] = React.useState<?(Promotion[])>(null);
  const isLoading = React.useRef<boolean>(false);

  const fetchAnnouncementsAndPromotions = React.useCallback(async () => {
    if (isLoading.current) return;

    setError(null);
    isLoading.current = true;

    try {
      const [fetchedAnnouncements, fetchedPromotions] = await Promise.all([
        listAllAnnouncements(),
        listAllPromotions(),
      ]);

      // Logic to remove once promotions are displayed to enough users.
      // For now, we filter out promotions from the announcements.
      const filteredAnnouncements = fetchedAnnouncements.filter(
        announcement =>
          !fetchedPromotions.find(promotion => promotion.id === announcement.id)
      );

      setAnnouncements(filteredAnnouncements);
      setPromotions(fetchedPromotions);
    } catch (error) {
      console.error(`Unable to load the announcements from the api:`, error);
      setError(error);
    }

    isLoading.current = false;
  }, []);

  // Preload the announcements and promotions when the app loads.
  React.useEffect(
    () => {
      // Don't attempt to load again announcements if they
      // were loaded already.
      if (announcements || isLoading.current) return;

      const timeoutId = setTimeout(() => {
        console.info('Pre-fetching announcements from the api...');
        fetchAnnouncementsAndPromotions();
      }, ANNOUNCEMENTS_FETCH_TIMEOUT);
      return () => clearTimeout(timeoutId);
    },
    [fetchAnnouncementsAndPromotions, announcements, isLoading]
  );

  const announcementsFeedState = React.useMemo(
    () => ({
      announcements,
      promotions,
      error,
      fetchAnnouncementsAndPromotions,
    }),
    [announcements, promotions, error, fetchAnnouncementsAndPromotions]
  );

  return (
    <AnnouncementsFeedContext.Provider value={announcementsFeedState}>
      {children}
    </AnnouncementsFeedContext.Provider>
  );
};
