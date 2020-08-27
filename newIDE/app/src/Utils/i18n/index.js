import * as Lingui from '@lingui/react';
import { rtl } from './languages';

const { I18n } = Lingui;

const $I18n = I18n.prototype;

$I18n.getI18n = function() {
  const lingui = this.context?.linguiPublisher ?? {};
  const _i18n = lingui.i18n ?? {};

  const i18n = Object.create(_i18n);
  i18n.lang = /^\w{2}/.exec(_i18n.language ?? 'en')[0];
  i18n.rtl = rtl.has(i18n.lang);
  i18n.css = i18n.rtl ? 'is-rtl' : '';
  
  lingui.i18n = i18n;
  
  return lingui;
};

export * from '@lingui/react';
