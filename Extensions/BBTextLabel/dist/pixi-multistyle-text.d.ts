/// <reference types="pixi.js" />
export interface ExtendedTextStyle extends PIXI.TextStyleOptions {
    valign?: "top" | "middle" | "bottom" | "baseline" | number;
    debug?: boolean;
    tagStyle?: Array<string>;
}
export interface TextStyleSet {
    [key: string]: ExtendedTextStyle;
}
export interface MstDebugOptions {
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
export interface TagData {
    name: string;
    properties: {
        [key: string]: string;
    };
}
export interface MstInteractionEvent extends PIXI.interaction.InteractionEvent {
    targetTag: TagData;
}
export default class MultiStyleText extends PIXI.Text {
    private static DEFAULT_TAG_STYLE;
    static debugOptions: MstDebugOptions;
    private textStyles;
    private hitboxes;
    constructor(text: string, styles: TextStyleSet);
    private handleInteraction;
    styles: TextStyleSet;
    setTagStyle(tag: string, style: ExtendedTextStyle): void;
    deleteTagStyle(tag: string): void;
    private getTagRegex;
    private getPropertyRegex;
    private getBBcodePropertyRegex;
    private _getTextDataPerLine;
    private getFontString;
    private createTextData;
    private getDropShadowPadding;
    updateText(): void;
    protected wordWrap(text: string): string;
    protected updateTexture(): void;
    private assign;
}
