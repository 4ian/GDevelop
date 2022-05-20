const themeData = {
  base: 'vs',
  inherit: true,
  rules: [
    {
      foreground: '8e908c',
      token: 'comment',
    },
    {
      foreground: '666969',
      token: 'keyword.operator.class',
    },
    {
      foreground: '666969',
      token: 'constant.other',
    },
    {
      foreground: '666969',
      token: 'source.php.embedded.line',
    },
    {
      foreground: 'c82829',
      token: 'variable',
    },
    {
      foreground: 'c82829',
      token: 'support.other.variable',
    },
    {
      foreground: 'c82829',
      token: 'string.other.link',
    },
    {
      foreground: 'c82829',
      token: 'string.regexp',
    },
    {
      foreground: 'c82829',
      token: 'entity.name.tag',
    },
    {
      foreground: 'c82829',
      token: 'entity.other.attribute-name',
    },
    {
      foreground: 'c82829',
      token: 'meta.tag',
    },
    {
      foreground: 'c82829',
      token: 'declaration.tag',
    },
    {
      foreground: 'f5871f',
      token: 'constant.numeric',
    },
    {
      foreground: 'f5871f',
      token: 'constant.language',
    },
    {
      foreground: 'f5871f',
      token: 'support.constant',
    },
    {
      foreground: 'f5871f',
      token: 'constant.character',
    },
    {
      foreground: 'f5871f',
      token: 'variable.parameter',
    },
    {
      foreground: 'f5871f',
      token: 'punctuation.section.embedded',
    },
    {
      foreground: 'f5871f',
      token: 'keyword.other.unit',
    },
    {
      foreground: 'c99e00',
      token: 'entity.name.class',
    },
    {
      foreground: 'c99e00',
      token: 'entity.name.type.class',
    },
    {
      foreground: 'c99e00',
      token: 'support.type',
    },
    {
      foreground: 'c99e00',
      token: 'support.class',
    },
    {
      foreground: '718c00',
      token: 'string',
    },
    {
      foreground: '718c00',
      token: 'constant.other.symbol',
    },
    {
      foreground: '718c00',
      token: 'entity.other.inherited-class',
    },
    {
      foreground: '718c00',
      token: 'markup.heading',
    },
    {
      foreground: '3e999f',
      token: 'keyword.operator',
    },
    {
      foreground: '3e999f',
      token: 'constant.other.color',
    },
    {
      foreground: '4271ae',
      token: 'entity.name.function',
    },
    {
      foreground: '4271ae',
      token: 'meta.function-call',
    },
    {
      foreground: '4271ae',
      token: 'support.function',
    },
    {
      foreground: '4271ae',
      token: 'keyword.other.special-method',
    },
    {
      foreground: '4271ae',
      token: 'meta.block-level',
    },
    {
      foreground: '8959a8',
      token: 'keyword',
    },
    {
      foreground: '8959a8',
      token: 'storage',
    },
    {
      foreground: '8959a8',
      token: 'storage.type',
    },
    {
      foreground: 'ffffff',
      background: 'c82829',
      token: 'invalid',
    },
    {
      foreground: 'ffffff',
      background: '4271ae',
      token: 'meta.separator',
    },
    {
      foreground: 'ffffff',
      background: '8959a8',
      token: 'invalid.deprecated',
    },
  ],
  colors: {
    'editor.foreground': '#4D4D4C',
    'editor.background': '#FFFFFF',
    'editor.selectionBackground': '#D6D6D6',
    'editor.lineHighlightBackground': '#EFEFEF',
    'editorCursor.foreground': '#AEAFAD',
    'editorWhitespace.foreground': '#D1D1D1',
  },
};

// eslint-disable-next-line import/no-anonymous-default-export
export default {
  name: 'Tomorrow',
  themeName: 'tomorrow',
  themeData,
};
