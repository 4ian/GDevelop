// @flow
import * as React from 'react';
import { I18nProvider } from '@lingui/react';
import { setupI18n } from '@lingui/core';
import catalogEn from '../../locales/en/messages';
import catalogFr from '../../locales/fr/messages';
import { getTranslationFunction } from './getTranslationFunction';
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
  i18n: ?any, //TODO
  catalogs: Catalogs,
};

export default class GDI18nProvider extends React.Component<Props, State> {
  state = {
    catalogs: { en: catalogEn, fr: catalogFr },
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

    return import(/* webpackMode: "lazy", webpackChunkName: "locales-[index]-messages" */
    `../../locales/${language}/messages`).then(
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
    const { i18n } = this.state;
    const { language, children } = this.props;

    if (!i18n) return null; // Skip rendering when catalog isn't loaded.

    return (
      <I18nProvider i18n={i18n} language={language}>
        {children}
      </I18nProvider>
    );
  }
}
