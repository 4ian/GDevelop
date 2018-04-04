// @flow
import {
  type ResourceSource,
  type ChooseResourceFunction,
} from '../../../ResourcesList/ResourceSource.flow';


export type ParameterFieldProps = {|
  parameterMetadata?: gdParameterMetadata,
  project: gdProject,
  layout?: gdLayout,
  onChange: string => void,
  value: string,
  isInline?: boolean,
  parameterRenderingService?: {
    components: any,
    getParameterComponent: (type: string) => any,
  },
  resourceSources?: Array<ResourceSource>,
  onChooseResource?: ChooseResourceFunction,
|};
