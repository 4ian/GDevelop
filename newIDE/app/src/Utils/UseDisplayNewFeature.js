// @flow

import * as React from 'react';
import PreferencesContext from '../MainFrame/Preferences/PreferencesContext';
import { getProgramOpeningCount } from './Analytics/LocalStats';

const featuresDisplaySettings = {
  gamesDashboardInProjectManager: {
    count: 2,
    intervalInDays: 7,
    minimumProgramOpeningCount: 10,
  },
  gamesDashboardInHomePage: {
    count: 2,
    intervalInDays: 7,
    minimumProgramOpeningCount: 10,
  },
};

const ONE_DAY = 24 * 3600 * 1000;

type Feature = string;

const useDisplayNewFeature = () => {
  const {
    values: { newFeaturesAcknowledgements },
    setNewFeaturesAcknowledgements,
  } = React.useContext(PreferencesContext);

  const shouldDisplayNewFeatureHighlighting = React.useCallback(
    ({ featureId }: { featureId: Feature }): boolean => {
      const programOpeningCount = getProgramOpeningCount();
      const settings = featuresDisplaySettings[featureId];
      if (!settings) return false;

      const { count, intervalInDays, minimumProgramOpeningCount } = settings;

      const acknowledgments = newFeaturesAcknowledgements[featureId];
      if (!acknowledgments)
        return programOpeningCount > minimumProgramOpeningCount;

      const { dates } = acknowledgments;
      if (dates.length >= count) return false;

      const lastDate = dates[dates.length - 1];

      return (
        programOpeningCount > minimumProgramOpeningCount &&
        Date.now() > lastDate + intervalInDays * ONE_DAY
      );
    },
    [newFeaturesAcknowledgements]
  );

  const acknowledgeNewFeature = React.useCallback(
    ({ featureId }: { featureId: Feature }) => {
      if (!featuresDisplaySettings[featureId]) return;

      const acknowledgments = newFeaturesAcknowledgements[featureId];
      if (!acknowledgments) {
        setNewFeaturesAcknowledgements({
          ...newFeaturesAcknowledgements,
          [featureId]: { dates: [Date.now()] },
        });
        return;
      }
      setNewFeaturesAcknowledgements({
        ...newFeaturesAcknowledgements,
        [featureId]: {
          ...acknowledgments,
          dates: [...acknowledgments.dates, Date.now()],
        },
      });
    },
    [newFeaturesAcknowledgements, setNewFeaturesAcknowledgements]
  );

  return {
    shouldDisplayNewFeatureHighlighting,
    acknowledgeNewFeature,
  };
};

export default useDisplayNewFeature;
