// flow-typed signature: b517cd8873674b6ac09e799503836168
// flow-typed version: 30815cf324/react-dnd-html5-backend_v2.x.x/flow_>=v0.25.x

declare type $npm$reactDnd$NativeTypes$FILE = "__NATIVE_FILE__";
declare type $npm$reactDnd$NativeTypes$URL = "__NATIVE_URL__";
declare type $npm$reactDnd$NativeTypes$TEXT = "__NATIVE_TEXT__";
declare type $npm$reactDnd$NativeTypes =
  | $npm$reactDnd$NativeTypes$FILE
  | $npm$reactDnd$NativeTypes$URL
  | $npm$reactDnd$NativeTypes$TEXT;

declare module "react-dnd-html5-backend" {
  declare module.exports: {
    getEmptyImage(): Image,
    NativeTypes: {
      FILE: $npm$reactDnd$NativeTypes$FILE,
      URL: $npm$reactDnd$NativeTypes$URL,
      TEXT: $npm$reactDnd$NativeTypes$TEXT
    }
  };
}
