// @flow

export type WorkingDeskToolTabKind =
  | 'nano-banana'
  | 'elevenlabs-audio'
  | 'local-image';
export type WorkingDeskToolTabStatus = 'running' | 'success' | 'error';

export type WorkingDeskToolTabUpdate = {|
  id: string,
  kind: WorkingDeskToolTabKind,
  title: string,
  status: WorkingDeskToolTabStatus,
  statusText?: ?string,
  requestText?: ?string,
  responseText?: ?string,
  generatedImagePath?: ?string,
  generatedImageUrl?: ?string,
  generatedAudioPath?: ?string,
  generatedAudioUrl?: ?string,
  errorText?: ?string,
|};
