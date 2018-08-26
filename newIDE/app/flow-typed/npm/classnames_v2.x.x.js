// flow-typed signature: cf86673cc32d185bdab1d2ea90578d37
// flow-typed version: 614bf49aa8/classnames_v2.x.x/flow_>=v0.25.x

type $npm$classnames$Classes =
  | string
  | { [className: string]: * }
  | false
  | void
  | null;

declare module "classnames" {
  declare module.exports: (
    ...classes: Array<$npm$classnames$Classes | $npm$classnames$Classes[]>
  ) => string;
}

declare module "classnames/bind" {
  declare module.exports: $Exports<"classnames">;
}

declare module "classnames/dedupe" {
  declare module.exports: $Exports<"classnames">;
}
