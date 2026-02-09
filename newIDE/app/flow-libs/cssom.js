/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

declare class StyleSheet {
  disabled: boolean;
  +href: string;
  +media: MediaList;
  +ownerNode: Node;
  +parentStyleSheet: ?StyleSheet;
  +title: string;
  +type: string;
}

declare class StyleSheetList {
  @@iterator(): Iterator<StyleSheet>;
  length: number;
  [index: number]: StyleSheet;
}

declare class MediaList {
  @@iterator(): Iterator<string>;
  mediaText: string;
  length: number;
  item(index: number): ?string;
  deleteMedium(oldMedium: string): void;
  appendMedium(newMedium: string): void;
  [index: number]: string;
}

declare class CSSStyleSheet extends StyleSheet {
  +cssRules: CSSRuleList;
  +ownerRule: ?CSSRule;
  deleteRule(index: number): void;
  insertRule(rule: string, index: number): number;
}

declare class CSSGroupingRule extends CSSRule {
  +cssRules: CSSRuleList;
  deleteRule(index: number): void;
  insertRule(rule: string, index: number): number;
}

declare class CSSConditionRule extends CSSGroupingRule {
  conditionText: string;
}

declare class CSSMediaRule extends CSSConditionRule {
  +media: MediaList;
}

declare class CSSStyleRule extends CSSRule {
  selectorText: string;
  +style: CSSStyleDeclaration;
}

declare class CSSRule {
  cssText: string;
  +parentRule: ?CSSRule;
  +parentStyleSheet: ?CSSStyleSheet;
  +type: number;
  static STYLE_RULE: number;
  static MEDIA_RULE: number;
  static FONT_FACE_RULE: number;
  static PAGE_RULE: number;
  static IMPORT_RULE: number;
  static CHARSET_RULE: number;
  static UNKNOWN_RULE: number;
  static KEYFRAMES_RULE: number;
  static KEYFRAME_RULE: number;
  static NAMESPACE_RULE: number;
  static COUNTER_STYLE_RULE: number;
  static SUPPORTS_RULE: number;
  static DOCUMENT_RULE: number;
  static FONT_FEATURE_VALUES_RULE: number;
  static VIEWPORT_RULE: number;
  static REGION_STYLE_RULE: number;
}

declare class CSSKeyframeRule extends CSSRule {
  keyText: string;
  +style: CSSStyleDeclaration;
}

declare class CSSKeyframesRule extends CSSRule {
  name: string;
  +cssRules: CSSRuleList;
  appendRule(rule: string): void;
  deleteRule(select: string): void;
  findRule(select: string): CSSKeyframeRule | null;
}

declare class CSSRuleList {
  @@iterator(): Iterator<CSSRule>;
  length: number;
  item(index: number): ?CSSRule;
  [index: number]: CSSRule;
}

declare class CSSStyleDeclaration {
  @@iterator(): Iterator<string>;
  /* DOM CSS Properties */
  alignContent: string;
  alignItems: string;
  alignSelf: string;
  all: string;
  animation: string;
  animationDelay: string;
  animationDirection: string;
  animationDuration: string;
  animationFillMode: string;
  animationIterationCount: string;
  animationName: string;
  animationPlayState: string;
  animationTimingFunction: string;
  backdropFilter: string;
  webkitBackdropFilter: string;
  backfaceVisibility: string;
  background: string;
  backgroundAttachment: string;
  backgroundBlendMode: string;
  backgroundClip: string;
  backgroundColor: string;
  backgroundImage: string;
  backgroundOrigin: string;
  backgroundPosition: string;
  backgroundPositionX: string;
  backgroundPositionY: string;
  backgroundRepeat: string;
  backgroundSize: string;
  blockSize: string;
  border: string;
  borderBlockEnd: string;
  borderBlockEndColor: string;
  borderBlockEndStyle: string;
  borderBlockEndWidth: string;
  borderBlockStart: string;
  borderBlockStartColor: string;
  borderBlockStartStyle: string;
  borderBlockStartWidth: string;
  borderBottom: string;
  borderBottomColor: string;
  borderBottomLeftRadius: string;
  borderBottomRightRadius: string;
  borderBottomStyle: string;
  borderBottomWidth: string;
  borderCollapse: string;
  borderColor: string;
  borderImage: string;
  borderImageOutset: string;
  borderImageRepeat: string;
  borderImageSlice: string;
  borderImageSource: string;
  borderImageWidth: string;
  borderInlineEnd: string;
  borderInlineEndColor: string;
  borderInlineEndStyle: string;
  borderInlineEndWidth: string;
  borderInlineStart: string;
  borderInlineStartColor: string;
  borderInlineStartStyle: string;
  borderInlineStartWidth: string;
  borderLeft: string;
  borderLeftColor: string;
  borderLeftStyle: string;
  borderLeftWidth: string;
  borderRadius: string;
  borderRight: string;
  borderRightColor: string;
  borderRightStyle: string;
  borderRightWidth: string;
  borderSpacing: string;
  borderStyle: string;
  borderTop: string;
  borderTopColor: string;
  borderTopLeftRadius: string;
  borderTopRightRadius: string;
  borderTopStyle: string;
  borderTopWidth: string;
  borderWidth: string;
  bottom: string;
  boxDecorationBreak: string;
  boxShadow: string;
  boxSizing: string;
  breakAfter: string;
  breakBefore: string;
  breakInside: string;
  captionSide: string;
  clear: string;
  clip: string;
  clipPath: string;
  color: string;
  columns: string;
  columnCount: string;
  columnFill: string;
  columnGap: string;
  columnRule: string;
  columnRuleColor: string;
  columnRuleStyle: string;
  columnRuleWidth: string;
  columnSpan: string;
  columnWidth: string;
  contain: string;
  content: string;
  counterIncrement: string;
  counterReset: string;
  cursor: string;
  direction: string;
  display: string;
  emptyCells: string;
  filter: string;
  flex: string;
  flexBasis: string;
  flexDirection: string;
  flexFlow: string;
  flexGrow: string;
  flexShrink: string;
  flexWrap: string;
  float: string;
  font: string;
  fontFamily: string;
  fontFeatureSettings: string;
  fontKerning: string;
  fontLanguageOverride: string;
  fontSize: string;
  fontSizeAdjust: string;
  fontStretch: string;
  fontStyle: string;
  fontSynthesis: string;
  fontVariant: string;
  fontVariantAlternates: string;
  fontVariantCaps: string;
  fontVariantEastAsian: string;
  fontVariantLigatures: string;
  fontVariantNumeric: string;
  fontVariantPosition: string;
  fontWeight: string;
  grad: string;
  grid: string;
  gridArea: string;
  gridAutoColumns: string;
  gridAutoFlow: string;
  gridAutoPosition: string;
  gridAutoRows: string;
  gridColumn: string;
  gridColumnStart: string;
  gridColumnEnd: string;
  gridRow: string;
  gridRowStart: string;
  gridRowEnd: string;
  gridTemplate: string;
  gridTemplateAreas: string;
  gridTemplateRows: string;
  gridTemplateColumns: string;
  height: string;
  hyphens: string;
  imageRendering: string;
  imageResolution: string;
  imageOrientation: string;
  imeMode: string;
  inherit: string;
  initial: string;
  inlineSize: string;
  isolation: string;
  justifyContent: string;
  left: string;
  letterSpacing: string;
  lineBreak: string;
  lineHeight: string;
  listStyle: string;
  listStyleImage: string;
  listStylePosition: string;
  listStyleType: string;
  margin: string;
  marginBlockEnd: string;
  marginBlockStart: string;
  marginBottom: string;
  marginInlineEnd: string;
  marginInlineStart: string;
  marginLeft: string;
  marginRight: string;
  marginTop: string;
  marks: string;
  mask: string;
  maskType: string;
  maxBlockSize: string;
  maxHeight: string;
  maxInlineSize: string;
  maxWidth: string;
  minBlockSize: string;
  minHeight: string;
  minInlineSize: string;
  minWidth: string;
  mixBlendMode: string;
  mozTransform: string;
  mozTransformOrigin: string;
  mozTransitionDelay: string;
  mozTransitionDuration: string;
  mozTransitionProperty: string;
  mozTransitionTimingFunction: string;
  objectFit: string;
  objectPosition: string;
  offsetBlockEnd: string;
  offsetBlockStart: string;
  offsetInlineEnd: string;
  offsetInlineStart: string;
  opacity: string;
  order: string;
  orphans: string;
  outline: string;
  outlineColor: string;
  outlineOffset: string;
  outlineStyle: string;
  outlineWidth: string;
  overflow: string;
  overflowWrap: string;
  overflowX: string;
  overflowY: string;
  padding: string;
  paddingBlockEnd: string;
  paddingBlockStart: string;
  paddingBottom: string;
  paddingInlineEnd: string;
  paddingInlineStart: string;
  paddingLeft: string;
  paddingRight: string;
  paddingTop: string;
  pageBreakAfter: string;
  pageBreakBefore: string;
  pageBreakInside: string;
  perspective: string;
  perspectiveOrigin: string;
  pointerEvents: string;
  position: string;
  quotes: string;
  rad: string;
  resize: string;
  right: string;
  rubyAlign: string;
  rubyMerge: string;
  rubyPosition: string;
  scrollBehavior: string;
  scrollSnapCoordinate: string;
  scrollSnapDestination: string;
  scrollSnapPointsX: string;
  scrollSnapPointsY: string;
  scrollSnapType: string;
  shapeImageThreshold: string;
  shapeMargin: string;
  shapeOutside: string;
  tableLayout: string;
  tabSize: string;
  textAlign: string;
  textAlignLast: string;
  textCombineUpright: string;
  textDecoration: string;
  textDecorationColor: string;
  textDecorationLine: string;
  textDecorationStyle: string;
  textIndent: string;
  textOrientation: string;
  textOverflow: string;
  textRendering: string;
  textShadow: string;
  textTransform: string;
  textUnderlinePosition: string;
  top: string;
  touchAction: string;
  transform: string;
  transformOrigin: string;
  transformStyle: string;
  transition: string;
  transitionDelay: string;
  transitionDuration: string;
  transitionProperty: string;
  transitionTimingFunction: string;
  turn: string;
  unicodeBidi: string;
  unicodeRange: string;
  userSelect: string;
  verticalAlign: string;
  visibility: string;
  webkitOverflowScrolling: string;
  webkitTransform: string;
  webkitTransformOrigin: string;
  webkitTransitionDelay: string;
  webkitTransitionDuration: string;
  webkitTransitionProperty: string;
  webkitTransitionTimingFunction: string;
  whiteSpace: string;
  widows: string;
  width: string;
  willChange: string;
  wordBreak: string;
  wordSpacing: string;
  wordWrap: string;
  writingMode: string;
  zIndex: string;

  cssFloat: string;
  cssText: string;
  getPropertyPriority(property: string): string;
  getPropertyValue(property:string): string;
  item(index: number): string;
  [index: number]: string;
  length: number;
  parentRule: CSSRule;
  removeProperty(property: string): string;
  setProperty(property: string, value: ?string, priority: ?string): void;
  setPropertyPriority(property: string, priority: string): void;
}

declare class TransitionEvent extends Event {
  elapsedTime: number; // readonly
  pseudoElement: string; // readonly
  propertyName: string; // readonly
}

type AnimationPlayState = 'idle' | 'running' | 'paused' | 'finished'
type AnimationReplaceState = 'active' | 'removed' | 'persisted'
type FillMode = 'none' | 'forwards' | 'backwards' | 'both' | 'auto'
type PlaybackDirection = 'normal' | 'reverse' | 'alternate' | 'alternate-reverse'
type IterationCompositeOperation = 'replace' | 'accumulate'
type CompositeOperation = 'replace' | 'add' | 'accumulate'
type CompositeOperationOrAuto = CompositeOperation | 'auto'

declare class AnimationTimeline {
  +currentTime: number | null;
}

type DocumentTimelineOptions = {
  originTime?: DOMHighResTimeStamp;
  ...
}

declare class DocumentTimeline extends AnimationTimeline {
  constructor(options?: DocumentTimelineOptions): void;
}

type EffectTiming = {
  delay: number;
  endDelay: number;
  fill: FillMode;
  iterationStart: number;
  iterations: number;
  duration: number | string;
  direction: PlaybackDirection;
  easing: string;
  ...
}

type OptionalEffectTiming = $Rest<EffectTiming, {...}>

type ComputedEffectTiming = EffectTiming & {
  endTime: number;
  activeDuration: number;
  localTime: number | null;
  progress: number | null;
  currentIteration: number | null;
  ...
}

declare class AnimationEffect {
  getTiming(): EffectTiming;
  getComputedTiming(): ComputedEffectTiming;
  updateTiming(timing?: OptionalEffectTiming): void;
}

type Keyframe = {
  composite?: CompositeOperationOrAuto;
  easing?: string;
  offset?: number | null;
  [property: string]: string | number | null | void;
  ...
}

type ComputedKeyframe = {
  composite: CompositeOperationOrAuto;
  computedOffset: number;
  easing: string;
  offset: number | null;
  [property: string]: string | number | null | void;
  ...
}

type PropertyIndexedKeyframes = {
  composite?: CompositeOperationOrAuto | CompositeOperationOrAuto[];
  easing?: string | string[];
  offset?: number | (number | null)[];
  [property: string]: string | string[] | number | null | (number | null)[] | void;
  ...
}

type KeyframeEffectOptions = $Rest<EffectTiming, {...}> & {
  iterationComposite?: IterationCompositeOperation;
  composite?: CompositeOperation;
  ...
}

declare class KeyframeEffect extends AnimationEffect {
  constructor(
    target: Element | null,
    keyframes: Keyframe[] | PropertyIndexedKeyframes | null,
    options?: number | KeyframeEffectOptions,
  ): void;
  constructor(source: KeyframeEffect): void;

  target: Element | null;
  iterationComposite: IterationCompositeOperation;
  composite: CompositeOperation;
  getKeyframes(): ComputedKeyframe[];
  setKeyframes(keyframes: Keyframe[] | PropertyIndexedKeyframes | null): void;
}

declare class Animation extends EventTarget {
  constructor(effect?: AnimationEffect | null, timeline?: AnimationTimeline | null): void;

  id: string;
  effect: AnimationEffect | null;
  timeline: AnimationTimeline | null;
  startTime: number | null;
  currentTime: number | null;
  playbackRate: number;
  +playState: AnimationPlayState;
  +replaceState: AnimationReplaceState;
  +pending: boolean;
  +ready: Promise<Animation>;
  +finished: Promise<Animation>;
  onfinish: ?((ev: AnimationPlaybackEvent) => mixed);
  oncancel: ?((ev: AnimationPlaybackEvent) => mixed);
  onremove: ?((ev: AnimationPlaybackEvent) => mixed);
  cancel(): void;
  finish(): void;
  play(): void;
  pause(): void;
  updatePlaybackRate(playbackRate: number): void;
  reverse(): void;
  persist(): void;
  commitStyles(): void;
}

type KeyframeAnimationOptions = KeyframeEffectOptions & {
  id?: string;
  ...
}

type GetAnimationsOptions = {
  subtree?: boolean;
  ...
}

interface Animatable {
  animate(keyframes: Keyframe[] | PropertyIndexedKeyframes | null, options?: number | KeyframeAnimationOptions): Animation;
  getAnimations(options?: GetAnimationsOptions): Animation[];
}

type AnimationPlaybackEvent$Init = Event$Init & {
  currentTime?: number | null;
  timelineTime?: number | null;
  ...
}

declare class AnimationPlaybackEvent extends Event {
  constructor(type: string, animationEventInitDict?: AnimationPlaybackEvent$Init): void;
  +currentTime: number | null;
  +timelineTime: number | null;
}
