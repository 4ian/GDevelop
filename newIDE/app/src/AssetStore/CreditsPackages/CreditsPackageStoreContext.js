// @flow
import * as React from 'react';
import {
  listListedCreditsPackages,
  type CreditsPackageListingData,
} from '../../Utils/GDevelopServices/Shop';
import CreditsPackagesDialog from '../../Credits/CreditsPackagesDialog';
import CreditsUsageDialog from '../../Credits/CreditsUsageDialog';

type CreditsUsageDialogOptions = {|
  title: React.Node,
  message: React.Node,
  onConfirm: () => Promise<void>,
  successMessage: React.Node,
|};

type CreditsPackageStoreState = {|
  fetchCreditsPackages: () => void,
  creditsPackageListingDatas: ?Array<CreditsPackageListingData>,
  error: ?Error,
  openCreditsPackageDialog: (
    options: ?{ missingCredits?: number, showCalloutTip?: boolean }
  ) => void,
  closeCreditsPackageDialog: () => void,
  openCreditsUsageDialog: CreditsUsageDialogOptions => void,
|};

export const CreditsPackageStoreContext = React.createContext<CreditsPackageStoreState>(
  {
    fetchCreditsPackages: () => {},
    creditsPackageListingDatas: null,
    error: null,
    openCreditsPackageDialog: () => {},
    closeCreditsPackageDialog: () => {},
    openCreditsUsageDialog: () => {},
  }
);

// Ids are in the form "amount_credits" (e.g: "500_credits").
export const getCreditsAmountFromId = (id: string) => {
  return parseInt(id.split('_')[0], 10);
};

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
  const [
    isCreditsPackageDialogOpen,
    setIsCreditsPackageDialogOpen,
  ] = React.useState<boolean>(false);
  const [missingCredits, setMissingCredits] = React.useState<?number>(null);
  const [showCalloutTip, setShowCalloutTip] = React.useState<boolean>(false);

  const [
    isCreditsUsageDialogOpen,
    setIsCreditsUsageDialogOpen,
  ] = React.useState<boolean>(false);
  const [
    creditsUsageDialogConfig,
    setCreditsUsageDialogConfig,
  ] = React.useState<?CreditsUsageDialogOptions>(null);

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
    [creditsPackageListingDatas]
  );

  React.useEffect(
    () => {
      if (isLoading.current) return;

      const timeoutId = setTimeout(() => {
        console.info('Pre-fetching credit packages from the store...');
        fetchCreditsPackages();
      }, 8000);
      return () => clearTimeout(timeoutId);
    },
    [fetchCreditsPackages]
  );

  const openCreditsPackageDialog = React.useCallback(
    (options: ?{ missingCredits?: number, showCalloutTip?: boolean }) => {
      if (!creditsPackageListingDatas) return;

      setMissingCredits(
        options && options.missingCredits ? options.missingCredits : 0
      );
      setShowCalloutTip(
        options && options.showCalloutTip ? options.showCalloutTip : false
      );
      setIsCreditsPackageDialogOpen(true);
    },
    [creditsPackageListingDatas]
  );

  const suggestedPackage: ?CreditsPackageListingData = React.useMemo(
    () => {
      if (!missingCredits || !creditsPackageListingDatas) return null;
      let creditsPackageListingDataWithShorterPositiveDifferenceInCredits = null;
      creditsPackageListingDatas.forEach(creditsPackageListingData => {
        const packageCreditsAmount = getCreditsAmountFromId(
          creditsPackageListingData.id
        );
        const selectedPackageCreditsAmount = creditsPackageListingDataWithShorterPositiveDifferenceInCredits
          ? getCreditsAmountFromId(
              creditsPackageListingDataWithShorterPositiveDifferenceInCredits.id
            )
          : null;
        if (
          packageCreditsAmount > missingCredits &&
          (!selectedPackageCreditsAmount ||
            packageCreditsAmount - missingCredits <
              selectedPackageCreditsAmount - missingCredits)
        ) {
          creditsPackageListingDataWithShorterPositiveDifferenceInCredits = creditsPackageListingData;
        }
      });

      // If no package with more credits than missingCredits is found, return the package with the most credits.
      if (!creditsPackageListingDataWithShorterPositiveDifferenceInCredits) {
        creditsPackageListingDataWithShorterPositiveDifferenceInCredits = creditsPackageListingDatas.reduce(
          (a, b) => {
            return getCreditsAmountFromId(a.id) > getCreditsAmountFromId(b.id)
              ? a
              : b;
          }
        );
      }

      return creditsPackageListingDataWithShorterPositiveDifferenceInCredits;
    },
    [creditsPackageListingDatas, missingCredits]
  );

  const closeCreditsPackageDialog = React.useCallback(() => {
    setIsCreditsPackageDialogOpen(false);
  }, []);

  const openCreditsUsageDialog = React.useCallback(
    (options: CreditsUsageDialogOptions) => {
      setCreditsUsageDialogConfig(options);
      setIsCreditsUsageDialogOpen(true);
    },
    []
  );

  const CreditsPackageStoreState = React.useMemo(
    () => ({
      creditsPackageListingDatas,
      fetchCreditsPackages,
      openCreditsPackageDialog,
      closeCreditsPackageDialog,
      error,
      openCreditsUsageDialog,
    }),
    [
      creditsPackageListingDatas,
      fetchCreditsPackages,
      openCreditsPackageDialog,
      closeCreditsPackageDialog,
      error,
      openCreditsUsageDialog,
    ]
  );

  return (
    <CreditsPackageStoreContext.Provider value={CreditsPackageStoreState}>
      {children}
      {isCreditsPackageDialogOpen && (
        <CreditsPackagesDialog
          onClose={() => setIsCreditsPackageDialogOpen(false)}
          suggestedPackage={suggestedPackage}
          missingCredits={missingCredits}
          showCalloutTip={showCalloutTip}
        />
      )}
      {isCreditsUsageDialogOpen && creditsUsageDialogConfig && (
        <CreditsUsageDialog
          onClose={() => setIsCreditsUsageDialogOpen(false)}
          message={creditsUsageDialogConfig.message}
          title={creditsUsageDialogConfig.title}
          onConfirm={creditsUsageDialogConfig.onConfirm}
          successMessage={creditsUsageDialogConfig.successMessage}
        />
      )}
    </CreditsPackageStoreContext.Provider>
  );
};
