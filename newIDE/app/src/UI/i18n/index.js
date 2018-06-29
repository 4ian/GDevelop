import i18n from 'i18next';

i18n.init({
  fallbackLng: 'en',

  // allow keys to be phrases having `:`, `.`
  nsSeparator: false,
  keySeparator: false,

  interpolation: {
    escapeValue: false, // Not needed for react
  },
});

export default i18n;
