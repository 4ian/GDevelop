declare interface TextStyleExtended extends Partial<PIXI.ITextStyle> {
  valign?: 'top' | 'middle' | 'bottom' | 'baseline' | number;
  debug?: boolean;
  tagStyle?: 'xml' | 'bbcode';
}
declare interface TextStyleSet {
  [key: string]: TextStyleExtended;
}
declare interface MstDebugOptions {
  spans: {
    enabled?: boolean;
    baseline?: string;
    top?: string;
    bottom?: string;
    bounding?: string;
    text?: boolean;
  };
  objects: {
    enabled?: boolean;
    bounding?: string;
    text?: boolean;
  };
}
declare class MultiStyleText extends PIXI.Text {
  private static DEFAULT_TAG_STYLE;
  static debugOptions: MstDebugOptions;
  private textStyles;
  private hitboxes;
  constructor(text: string, styles: TextStyleSet);
  private handleInteraction;
  set styles(styles: TextStyleSet);
  setTagStyle(tag: string, style: TextStyleExtended): void;
  deleteTagStyle(tag: string): void;
  private getTagRegex;
  private getPropertyRegex;
  private getBBcodePropertyRegex;
  private _getTextDataPerLine;
  private getFontString;
  private createTextData;
  private getDropShadowPadding;
  private withPrivateMembers;
  updateText(): void;
  protected wordWrap(text: string): string;
  private assign;
}
