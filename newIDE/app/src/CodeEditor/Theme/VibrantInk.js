const themeData = {
  base: 'vs-dark',
  inherit: true,
  rules: [
    {
      foreground: 'ffffff',
      background: '0f0f0f',
      token: 'text',
    },
    {
      background: '000000',
      token: 'source.ruby.rails.embedded.html',
    },
    {
      foreground: 'ffffff',
      background: '101010',
      token: 'text.html.ruby',
    },
    {
      foreground: 'ccff33',
      background: '000000',
      token: 'invalid',
    },
    {
      foreground: 'ccff33',
      background: '000000',
      token: 'invalid.deprecated',
    },
    {
      foreground: '99cc99',
      token: 'constant.numeric',
    },
    {
      foreground: 'ffffff',
      background: '000000',
      token: 'source',
    },
    {
      foreground: '9933cc',
      token: 'comment',
    },
    {
      foreground: '339999',
      token: 'constant',
    },
    {
      foreground: 'ff6600',
      token: 'keyword',
    },
    {
      foreground: 'edf8f9',
      token: 'keyword.preprocessor',
    },
    {
      foreground: 'ffffff',
      token: 'keyword.preprocessor directive',
    },
    {
      foreground: 'ffcc00',
      token: 'entity.name.function',
    },
    {
      foreground: 'ffcc00',
      token: 'storage.type.function.js',
    },
    {
      fontStyle: 'italic',
      token: 'variable.parameter',
    },
    {
      foreground: '772cb7',
      background: '070707',
      token: 'source comment.block',
    },
    {
      foreground: 'ffffff',
      token: 'variable.other',
    },
    {
      foreground: 'ffcc00',
      token: 'support.function',
    },
    {
      foreground: '66ff00',
      token: 'string',
    },
    {
      foreground: 'aaaaaa',
      token: 'string constant.character.escape',
    },
    {
      foreground: '000000',
      background: 'cccc33',
      token: 'string.interpolated',
    },
    {
      foreground: '44b4cc',
      token: 'string.regexp',
    },
    {
      foreground: 'cccc33',
      token: 'string.literal',
    },
    {
      foreground: '555555',
      token: 'string.interpolated constant.character.escape',
    },
    {
      fontStyle: 'underline',
      token: 'entity.name.class',
    },
    {
      fontStyle: 'underline',
      token: 'support.class.js',
    },
    {
      fontStyle: 'italic underline',
      token: 'entity.other.inherited-class',
    },
    {
      foreground: 'ff6600',
      token: 'meta.tag.inline.any.html',
    },
    {
      foreground: 'ff6600',
      token: 'meta.tag.block.any.html',
    },
    {
      foreground: '99cc99',
      fontStyle: 'italic',
      token: 'entity.other.attribute-name',
    },
    {
      foreground: 'dde93d',
      token: 'keyword.other',
    },
    {
      foreground: 'ff6600',
      token: 'meta.selector.css',
    },
    {
      foreground: 'ff6600',
      token: 'entity.other.attribute-name.pseudo-class.css',
    },
    {
      foreground: 'ff6600',
      token: 'entity.name.tag.wildcard.css',
    },
    {
      foreground: 'ff6600',
      token: 'entity.other.attribute-name.id.css',
    },
    {
      foreground: 'ff6600',
      token: 'entity.other.attribute-name.class.css',
    },
    {
      foreground: '999966',
      token: 'support.type.property-name.css',
    },
    {
      foreground: 'ffffff',
      token: 'keyword.other.unit.css',
    },
    {
      foreground: 'ffffff',
      token: 'constant.other.rgb-value.css',
    },
    {
      foreground: 'ffffff',
      token: 'constant.numeric.css',
    },
    {
      foreground: 'ffffff',
      token: 'support.function.event-handler.js',
    },
    {
      foreground: 'ffffff',
      token: 'keyword.operator.js',
    },
    {
      foreground: 'cccc66',
      token: 'keyword.control.js',
    },
    {
      foreground: 'ffffff',
      token: 'support.class.prototype.js',
    },
    {
      foreground: 'ff6600',
      token: 'object.property.function.prototype.js',
    },
  ],
  colors: {
    'editor.foreground': '#FFFFFF',
    'editor.background': '#0F0F0F',
    'editor.selectionBackground': '#6699CC',
    'editor.lineHighlightBackground': '#333333',
    'editorCursor.foreground': '#FFFFFF',
    'editorWhitespace.foreground': '#404040',
  },
};

// eslint-disable-next-line import/no-anonymous-default-export
export default {
  name: 'Vibrant Ink',
  themeName: 'vibrant-ink',
  themeData,
};
