// Automatically generated by GDevelop.js/scripts/generate-types.js
declare class gdLayer {
  constructor(): void;
  setName(name: string): void;
  getName(): string;
  setVisibility(visible: boolean): void;
  getVisibility(): boolean;
  setLightingLayer(lightingLayer: boolean): void;
  isLightingLayer(): boolean;
  setFollowBaseLayerCamera(followBaseLayerCamera: boolean): void;
  isFollowingBaseLayerCamera(): boolean;
  setAmbientLightColor(r: number, g: number, b: number): void;
  getAmbientLightColorRed(): number;
  getAmbientLightColorGreen(): number;
  getAmbientLightColorBlue(): number;
  getEffects(): gdEffectsContainer;
  getCameraCount(): number;
  setCameraCount(cameraCount: number): void;
  serializeTo(element: gdSerializerElement): void;
  unserializeFrom(element: gdSerializerElement): void;
  delete(): void;
  ptr: number;
};