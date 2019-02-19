// @flow

export default function getObjectByName(
  project: gdProject,
  layout: gdLayout,
  associatedObjectName: string
): ?gdObject {
  let associatedObject = null;
  if (layout.hasObjectNamed(associatedObjectName))
    associatedObject = layout.getObject(associatedObjectName);
  else if (project.hasObjectNamed(associatedObjectName))
    associatedObject = project.getObject(associatedObjectName);
  return associatedObject;
}
