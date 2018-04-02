// flow-typed signature: 6c6a5771bbdffe188d60637063b5f9a4
// flow-typed version: 6533cd10ce/react-i18next_v6.x.x/flow_>=v0.53.x

declare module "react-i18next" {
  declare type TFunction = (key?: ?string, data?: ?Object) => string;
  declare type Locales = string | Array<string>;

  declare type TranslatorProps = {
    t: TFunction,
    i18nLoadedAt: Date,
    i18n: Object
  };

  declare type Translator<OP, P> = (
    component: React$ComponentType<P>
  ) => Class<React$Component<OP, *>>;

  declare type TranslateOptions = $Shape<{
    wait: boolean,
    nsMode: "default" | "fallback",
    bindi18n: false | string,
    bindStore: false | string,
    withRef: boolean,
    translateFuncName: string,
    i18n: Object
  }>;

  declare function translate<OP, P>(
    locales?: Locales,
    options?: TranslateOptions
  ): Translator<OP, P>;

  declare type I18nProps = {
    i18n?: Object,
    ns?: string | Array<string>,
    children: (t: TFunction, { i18n: Object, t: TFunction }) => React$Node,
    initialI18nStore?: Object,
    initialLanguage?: string
  };
  declare var I18n: React$ComponentType<I18nProps>;

  declare type InterpolateProps = {
    className?: string,
    dangerouslySetInnerHTMLPartElement?: string,
    i18n?: Object,
    i18nKey?: string,
    options?: Object,
    parent?: string,
    style?: Object,
    t?: TFunction,
    useDangerouslySetInnerHTML?: boolean
  };
  declare var Interpolate: React$ComponentType<InterpolateProps>;

  declare type TransProps = {
    count?: number,
    parent?: string,
    i18n?: Object,
    i18nKey?: string,
    t?: TFunction
  };
  declare var Trans: React$ComponentType<TransProps>;

  declare type ProviderProps = { i18n: Object, children: React$Element<*> };
  declare var I18nextProvider: React$ComponentType<ProviderProps>;

  declare type NamespacesProps = {
    components: Array<React$ComponentType<*>>,
    i18n: { loadNamespaces: Function }
  };
  declare function loadNamespaces(props: NamespacesProps): Promise<void>;

  declare var reactI18nextModule: {
    type: "3rdParty",
    init: (instance: Object) => void
  };

  declare var defaultOptions: {
    wait: false,
    withRef: false,
    bindI18n: "languageChanged loaded",
    bindStore: "added removed",
    translateFuncName: "t",
    nsMode: "default"
  };

  declare function setDefaults(options: TranslateOptions): void;

  declare function getDefaults(): TranslateOptions;

  declare function getI18n(): Object;

  declare function setI18n(instance: Object): void;
}
