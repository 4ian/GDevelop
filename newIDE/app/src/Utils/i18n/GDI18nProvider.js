// @flow
import * as React from 'react';
import { I18nProvider } from '@lingui/react';
import { setupI18n } from '@lingui/core';
import { getTranslationFunction } from './getTranslationFunction';
import { type I18n as I18nType } from '@lingui/core';
const gd = global.gd;

type Catalog = any;
type Catalogs = {
  [string]: Catalog,
};

type Props = {|
  language: string,
  children: React.Node,
|};

type State = {
  language: string,
  i18n: ?I18nType,
  catalogs: Catalogs,
};

export default class GDI18nProvider extends React.Component<Props, State> {
  state = {
    language: 'en',
    catalogs: {},
    i18n: null,
  };

  componentDidMount() {
    this._loadLanguage(this.props.language);
  }

  componentDidUpdate(prevProps: Props) {
    if (prevProps.language !== this.props.language) {
      this._loadLanguage(this.props.language);
    }
  }

  _loadCatalog = (language: string): Promise<Catalogs> => {
    if (this.state.catalogs[language]) {
      return Promise.resolve(this.state.catalogs);
    }

    return import(/* webpackMode: "lazy", webpackChunkName: "locales-[request]" */
    `../../locales/${language.replace('-', '_')}/messages`).then(
      catalog => {
        return { ...this.state.catalogs, [language]: catalog };
      },
      (error: Error) => {
        console.error('Error while loading language=' + language, error);
        return this.state.catalogs;
      }
    );
  };

  _loadLanguage(language: string) {
    this._loadCatalog(language).then(catalogs => {
      this.setState(
        {
          language,
          catalogs,
          i18n: setupI18n({
            language: language,
            catalogs,
          }),
        },
        () => {
          const { i18n } = this.state;
          gd.getTranslation = getTranslationFunction(i18n);
          console.info(`Loaded "${language}" language`);
        }
      );
    });
  }

  render() {
    // Use language from the state, as it is synchronized with the catalogs,
    // while the language from props is the "target language", and sometime
    // can be a language for which the catalog is not loaded yet (which would
    // create warning and a "flash" effect when changing language).
    const { i18n, catalogs, language } = this.state;
    const { children } = this.props;

    if (!i18n) return null; // Skip rendering when catalog isn't loaded.

    return (
      <I18nProvider i18n={i18n} language={language} catalogs={catalogs}>
        {children}
      </I18nProvider>
    );
  }
}
