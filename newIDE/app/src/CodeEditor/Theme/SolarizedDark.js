const themeData = {
  base: 'vs-dark',
  inherit: true,
  rules: [
    {
      foreground: '657b83',
      fontStyle: 'italic',
      token: 'comment',
    },
    {
      foreground: '2aa198',
      token: 'string',
    },
    {
      foreground: 'd30102',
      token: 'string.regexp',
    },
    {
      foreground: 'd33682',
      token: 'constant.numeric',
    },
    {
      foreground: '268bd2',
      token: 'variable.language',
    },
    {
      foreground: '268bd2',
      token: 'variable.other',
    },
    {
      foreground: '859900',
      token: 'keyword',
    },
    {
      foreground: '93a1a1',
      fontStyle: 'bold',
      token: 'storage',
    },
    {
      foreground: 'cb4b16',
      token: 'entity.name.class',
    },
    {
      foreground: 'cb4b16',
      token: 'entity.name.type.class',
    },
    {
      foreground: '268bd2',
      token: 'entity.name.function',
    },
    {
      foreground: '859900',
      token: 'punctuation.definition.variable',
    },
    {
      foreground: 'd30102',
      token: 'punctuation.section.embedded.begin',
    },
    {
      foreground: 'd30102',
      token: 'punctuation.section.embedded.end',
    },
    {
      foreground: 'b58900',
      token: 'constant.language',
    },
    {
      foreground: 'b58900',
      token: 'meta.preprocessor',
    },
    {
      foreground: 'cb4b16',
      token: 'support.function.construct',
    },
    {
      foreground: 'cb4b16',
      token: 'keyword.other.new',
    },
    {
      foreground: 'cb4b16',
      token: 'constant.character',
    },
    {
      foreground: 'cb4b16',
      token: 'constant.other',
    },
    {
      foreground: '6c71c4',
      token: 'entity.other.inherited-class',
    },
    {
      foreground: '268bd2',
      fontStyle: 'bold',
      token: 'entity.name.tag',
    },
    {
      foreground: '657b83',
      token: 'punctuation.definition.tag',
    },
    {
      foreground: '93a1a1',
      token: 'entity.other.attribute-name',
    },
    {
      foreground: '268bd2',
      token: 'support.function',
    },
    {
      foreground: 'd30102',
      token: 'punctuation.separator.continuation',
    },
    {
      foreground: '859900',
      token: 'support.type',
    },
    {
      foreground: '859900',
      token: 'support.class',
    },
    {
      foreground: 'cb4b16',
      token: 'support.type.exception',
    },
  ],
  colors: {
    'editor.foreground': '#93A1A1',
    'editor.background': '#002B36',
    'editor.selectionBackground': '#073642',
    'editor.lineHighlightBackground': '#073642',
    'editorCursor.foreground': '#D30102',
    'editorWhitespace.foreground': '#93A1A1',
  },
};

// eslint-disable-next-line import/no-anonymous-default-export
export default {
  name: 'Solarized-Dark',
  themeName: 'solarized-dark',
  themeData,
};
