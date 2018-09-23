// @flow
import {
  type ResourceSource,
  type ChooseResourceFunction,
} from '../../../ResourcesList/ResourceSource.flow';
import { type ResourceExternalEditor } from '../../../ResourcesList/ResourceExternalEditor.flow';

export type ParameterFieldProps = {|
  parameterMetadata?: gdParameterMetadata,
  project?: gdProject,
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
  resourceExternalEditors?: Array<ResourceExternalEditor>,
  instructionOrExpression?: ?gdInstruction | ?gdExpression,
|};
