// @flow
import ParameterRenderingService from '../ParameterRenderingService';

export type ParameterFieldProps = {|
  parameterMetadata?: gdParameterMetadata,
  project: gdProject,
  layout?: gdLayout,
  onChange: string => void,
  value: string,
  isInline?: boolean,
  parameterRenderingService?: typeof ParameterRenderingService,
|};
