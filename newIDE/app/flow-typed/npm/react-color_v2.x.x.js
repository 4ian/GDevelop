// flow-typed signature: ad7630ebca7749193fedebd877d186a5
// flow-typed version: 9bf16da660/react-color_v2.x.x/flow_>=v0.56.x

declare module "react-color" {
  declare export type HexColor = string;

  declare export type HSLColor = {|
    h: number,
    s: number,
    l: number,
    a?: number
  |};

  declare export type HSVColor = {|
    h: number,
    s: number,
    v: number,
    a?: number
  |};

  declare export type RGBColor = {|
    r: number,
    g: number,
    b: number,
    a?: number
  |};

  declare export type Color = HexColor | HSLColor | HSVColor | RGBColor;

  declare export type ColorResult = {|
    hex: HexColor,
    hsl: HSLColor,
    hsv: HSVColor,
    rgb: RGBColor
  |};

  declare export type ColorChangeHandler = (color: ColorResult) => void;

  declare export type ColorPickerProps = {|
    color?: Color,
    onChange?: ColorChangeHandler,
    onChangeComplete?: ColorChangeHandler
  |};

  declare export type AlphaPickerProps = {|
    ...ColorPickerProps,
    width?: string,
    height?: string,
    direction?: "horizontal" | "vertical",
    renderers?: Object,
    pointer?: React$ComponentType<any>
  |};

  declare export type BlockPickerProps = {|
    ...ColorPickerProps,
    width?: string,
    colors?: Array<string>,
    triangle?: "hide" | "top",
    onSwatchHover?: (color: Color, event: SyntheticMouseEvent<*>) => void
  |};

  declare export type ChromePickerProps = {|
    ...ColorPickerProps,
    disableAlpha?: boolean,
    renderers?: Object
  |};

  declare export type CirclePickerProps = {|
    ...ColorPickerProps,
    width?: string,
    colors?: Array<string>,
    circleSize?: number,
    circleSpacing?: number,
    onSwatchHover?: (color: Color, event: SyntheticMouseEvent<*>) => void
  |};

  declare export type CompactPickerProps = {|
    ...ColorPickerProps,
    colors?: Array<string>,
    onSwatchHover?: (color: Color, event: SyntheticMouseEvent<*>) => void
  |};

  declare export type GithubPickerProps = {|
    ...ColorPickerProps,
    width?: string,
    colors?: Array<string>,
    triangle?: "hide" | "top-left" | "top-right",
    onSwatchHover?: (color: Color, event: SyntheticMouseEvent<*>) => void
  |};

  declare export type HuePickerProps = {|
    ...ColorPickerProps,
    width?: string,
    height?: string,
    direction?: "horizontal" | "vertical",
    pointer?: React$ComponentType<any>
  |};

  declare export type MaterialPickerProps = {|
    ...ColorPickerProps
  |};

  declare export type PhotoshopPickerProps = {|
    ...ColorPickerProps,
    header?: string,
    onAccept?: () => void,
    onCancel?: () => void
  |};

  declare export type SketchPickerProps = {|
    ...ColorPickerProps,
    disableAlpha?: boolean,
    presetColors?: Array<string | {| color: string, title: string |}>,
    width?: number,
    renderers?: Object,
    onSwatchHover?: (color: Color, event: SyntheticMouseEvent<*>) => void
  |};

  declare export type SliderPickerProps = {|
    ...ColorPickerProps,
    pointer?: React$ComponentType<any>
  |};

  declare export type SwatchesPickerProps = {|
    ...ColorPickerProps,
    width?: number,
    height?: number,
    colors?: Array<Array<string>>,
    onSwatchHover?: (color: Color, event: SyntheticMouseEvent<*>) => void
  |};

  declare export type TwitterPickerProps = {|
    ...ColorPickerProps,
    width?: string,
    colors?: Array<string>,
    triangle?: "hide" | "top-left" | "top-right",
    onSwatchHover?: (color: Color, event: SyntheticMouseEvent<*>) => void
  |};

  declare export type ColorWrapChangeHandler = (
    color: Color | ColorResult
  ) => void;

  declare export type InjectedColorProps = {
    hex: string,
    hsl: HSLColor,
    hsv: HSVColor,
    rgb: RGBColor,
    oldHue: number,
    onChange?: ColorWrapChangeHandler,
    source: string
  };

  declare export class AlphaPicker extends React$Component<AlphaPickerProps> {}
  declare export class BlockPicker extends React$Component<BlockPickerProps> {}
  declare export class ChromePicker extends React$Component<ChromePickerProps> {}
  declare export class CirclePicker extends React$Component<CirclePickerProps> {}
  declare export class CompactPicker extends React$Component<CompactPickerProps> {}
  declare export class GithubPicker extends React$Component<GithubPickerProps> {}
  declare export class HuePicker extends React$Component<HuePickerProps> {}
  declare export class MaterialPicker extends React$Component<MaterialPickerProps> {}
  declare export class PhotoshopPicker extends React$Component<PhotoshopPickerProps> {}
  declare export class SketchPicker extends React$Component<SketchPickerProps> {}
  declare export class SliderPicker extends React$Component<SliderPickerProps> {}
  declare export class SwatchesPicker extends React$Component<SwatchesPickerProps> {}
  declare export class TwitterPicker extends React$Component<TwitterPickerProps> {}

  declare export function CustomPicker<Props: {}>(
    Component: React$ComponentType<InjectedColorProps & $Supertype<Props>>
  ): React$ComponentType<Props>;
}

declare module "react-color/lib/components/common" {
  import type {
    HexColor,
    RGBColor,
    HSLColor,
    HSVColor,
    ColorChangeHandler
  } from "react-color";

  declare type PartialColorResult = {|
    hex?: HexColor,
    hsl?: HSLColor,
    hsv?: HSVColor,
    rgb?: RGBColor
  |};

  declare export type AlphaProps = {|
    ...PartialColorResult,
    pointer?: React$ComponentType<any>,
    onChange?: ColorChangeHandler
  |};

  declare export type EditableInputProps = {|
    label?: string,
    value?: any,
    onChange?: ColorChangeHandler,
    style?: {|
      input?: Object,
      label?: Object,
      wrap?: Object
    |}
  |};

  declare export type HueProps = {|
    ...PartialColorResult,
    pointer?: React$ComponentType<any>,
    onChange?: ColorChangeHandler,
    direction?: "horizontal" | "vertical"
  |};

  declare export type SaturationProps = {|
    ...PartialColorResult,
    pointer?: React$ComponentType<any>,
    onChange?: ColorChangeHandler
  |};

  declare export type CheckboardProps = {|
    size?: number,
    white?: string,
    grey?: string
  |};

  declare export class Alpha extends React$Component<AlphaProps> {}
  declare export class EditableInput extends React$Component<EditableInputProps> {}
  declare export class Hue extends React$Component<HueProps> {}
  declare export class Saturation extends React$Component<SaturationProps> {}
  declare export class Checkboard extends React$Component<CheckboardProps> {}
}
