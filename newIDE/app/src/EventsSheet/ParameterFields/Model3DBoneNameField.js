// @flow
import * as React from 'react';
import GenericExpressionField from './GenericExpressionField';
import {
  type ParameterFieldProps,
  type ParameterFieldInterface,
  type FieldFocusFunction,
} from './ParameterFieldCommons';
import getObjectByName from '../../Utils/GetObjectByName';
import getObjectGroupByName from '../../Utils/GetObjectGroupByName';
import { mapVector } from '../../Utils/MapFor';
import { getLastObjectParameterValue } from './ParameterMetadataTools';
import PixiResourcesLoader from '../../ObjectsRendering/PixiResourcesLoader';
import {
  type Model3DBoneNameLoadingState,
  getCommonModel3DBoneNames,
  getModel3DBoneNameAutocompletions,
  getModel3DBoneNameResourceKey,
} from './Model3DBoneNameFieldUtils';

export {
  getCommonModel3DBoneNames,
  getModel3DBoneNameAutocompletions,
  getModel3DBoneNameResourceKey,
} from './Model3DBoneNameFieldUtils';

const gd: libGDevelop = global.gd;

const getModelResourceName = (object: gdObject): string => {
  if (object.getType() !== 'Scene3D::Model3DObject') return '';
  return gd
    .asModel3DConfiguration(object.getConfiguration())
    .getModelResourceName();
};

export default (React.forwardRef<ParameterFieldProps, ParameterFieldInterface>(
  function Model3DBoneNameField(props: ParameterFieldProps, ref) {
    const field = React.useRef<?GenericExpressionField>(null);
    const focus: FieldFocusFunction = options => {
      if (field.current) field.current.focus(options);
    };
    React.useImperativeHandle(ref, () => ({ focus }));

    const {
      project,
      globalObjectsContainer,
      objectsContainer,
      instructionMetadata,
      instruction,
      expressionMetadata,
      expression,
      parameterIndex,
    } = props;
    const targetName = getLastObjectParameterValue({
      instructionMetadata,
      instruction,
      expressionMetadata,
      expression,
      parameterIndex,
    });

    let targetObjects: Array<gdObject> | null = null;
    if (targetName) {
      const concreteObject = getObjectByName(
        globalObjectsContainer,
        objectsContainer,
        targetName
      );
      if (concreteObject) {
        targetObjects = [concreteObject];
      } else {
        const group = getObjectGroupByName(
          globalObjectsContainer,
          objectsContainer,
          targetName
        );
        if (group) {
          const objects = mapVector(group.getAllObjectsNames(), objectName =>
            getObjectByName(
              globalObjectsContainer,
              objectsContainer,
              objectName
            )
          );
          if (objects.every(Boolean)) {
            // $FlowFixMe[incompatible-type] Every null entry was rejected above.
            targetObjects = objects;
          }
        }
      }
    }

    const modelResourceNames = targetObjects
      ? targetObjects.map(getModelResourceName)
      : [];
    const resourceKey = project
      ? getModel3DBoneNameResourceKey(modelResourceNames)
      : '';
    const [
      loadingState,
      setLoadingState,
    ] = React.useState<Model3DBoneNameLoadingState>({
      status: 'idle',
      names: [],
    });

    React.useEffect(
      () => {
        if (!project || !resourceKey) {
          setLoadingState({ status: 'idle', names: [] });
          return;
        }

        let cancelled = false;
        setLoadingState({ status: 'loading', names: [] });
        const resourceNames = resourceKey.split('\u0000');
        Promise.all(
          resourceNames.map(resourceName =>
            PixiResourcesLoader.get3DModel(project, resourceName)
          )
        )
          .then(models => {
            if (cancelled) return;
            if (models.some(model => !model)) {
              setLoadingState({ status: 'error', names: [] });
              return;
            }
            setLoadingState({
              status: 'loaded',
              names: getCommonModel3DBoneNames(models),
            });
          })
          .catch(() => {
            if (!cancelled) {
              setLoadingState({ status: 'error', names: [] });
            }
          });

        return () => {
          cancelled = true;
        };
      },
      [project, resourceKey]
    );

    return (
      <GenericExpressionField
        expressionType="string"
        onGetAdditionalAutocompletions={currentExpression =>
          getModel3DBoneNameAutocompletions(loadingState, currentExpression)
        }
        ref={field}
        {...props}
      />
    );
  }
): React.ComponentType<{
  ...ParameterFieldProps,
  +ref?: React.RefSetter<ParameterFieldInterface>,
}>);
