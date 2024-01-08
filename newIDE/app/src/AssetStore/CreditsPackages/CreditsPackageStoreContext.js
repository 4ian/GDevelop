// @flow
import * as React from 'react';
import {
  listListedCreditsPackages,
  type CreditsPackageListingData,
} from '../../Utils/GDevelopServices/Shop';

type CreditsPackageStoreState = {|
  fetchCreditsPackages: () => void,
  creditsPackageListingDatas: ?Array<CreditsPackageListingData>,
  error: ?Error,
|};

export const CreditsPackageStoreContext = React.createContext<CreditsPackageStoreState>(
  {
    fetchCreditsPackages: () => {},
    creditsPackageListingDatas: null,
    error: null,
  }
);

type CreditsPackageStoreStateProviderProps = {|
  children: React.Node,
|};

export const CreditsPackageStoreStateProvider = ({
  children,
}: CreditsPackageStoreStateProviderProps) => {
  const [error, setError] = React.useState<?Error>(null);
  const [
    creditsPackageListingDatas,
    setCreditsPackageListingDatas,
  ] = React.useState<?Array<CreditsPackageListingData>>(null);

  const isLoading = React.useRef<boolean>(false);

  const fetchCreditsPackages = React.useCallback(
    () => {
      // If the credit packages are already loaded, don't load them again.
      if (isLoading.current || creditsPackageListingDatas) return;

      (async () => {
        setError(null);
        isLoading.current = true;

        try {
          const fetchedCreditsPackageListingDatas = await listListedCreditsPackages();

          console.info(
            `Loaded ${
              fetchedCreditsPackageListingDatas
                ? fetchedCreditsPackageListingDatas.length
                : 0
            } credit packages from the store.`
          );

          setCreditsPackageListingDatas(fetchedCreditsPackageListingDatas);
        } catch (error) {
          console.error(
            `Unable to load the credit packages from the store:`,
            error
          );
          setError(error);
        }

        isLoading.current = false;
      })();
    },
    [isLoading, creditsPackageListingDatas]
  );

  React.useEffect(
    () => {
      if (isLoading.current) return;

      const timeoutId = setTimeout(() => {
        console.info('Pre-fetching credit packages from the store...');
        fetchCreditsPackages();
      }, 5000);
      return () => clearTimeout(timeoutId);
    },
    [fetchCreditsPackages, isLoading]
  );
  const CreditsPackageStoreState = React.useMemo(
    () => ({
      creditsPackageListingDatas,
      fetchCreditsPackages,
      error,
    }),
    [creditsPackageListingDatas, error, fetchCreditsPackages]
  );

  return (
    <CreditsPackageStoreContext.Provider value={CreditsPackageStoreState}>
      {children}
    </CreditsPackageStoreContext.Provider>
  );
};
