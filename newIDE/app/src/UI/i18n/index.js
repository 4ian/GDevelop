import i18n from 'i18next';

i18n.init({
  fallbackLng: 'en',

  interpolation: {
    escapeValue: false, // Not needed for react
  },
});

export default i18n;
